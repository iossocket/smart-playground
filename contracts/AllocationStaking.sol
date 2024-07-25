// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./interfaces/ISalesFactory.sol";

contract AllocationStaking is Ownable {
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint256 amount; // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. Current reward debt when user joined farm. See explanation below.
        //
        // We do some fancy math here. Basically, any point in time, the amount of ERC20s
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accERC20PerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accERC20PerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.

        // The staked token can not be withdrawed until tokensUnlockTime.
        uint256 tokensUnlockTime; // If user registered for sale, returns when tokens are getting unlocked
        address[] salesRegistered;
    }

    // Info of each pool.
    struct PoolInfo {
        IERC20 lpToken; // Address of LP token contract.
        uint256 allocPoint; // How many allocation points assigned to this pool. ERC20s to distribute per block.
        uint256 lastRewardTimestamp; // Last timstamp that ERC20s distribution occurs.
        uint256 accERC20PerShare; // Accumulated ERC20s per share, times 1e36.
        uint256 totalDeposits; // Total amount of tokens deposited at the moment (staked)
    }

    // Address of the ERC20 Token contract.
    IERC20 public erc20;
    // The total amount of ERC20 that's paid out as reward.
    uint256 public paidOut;
    // ERC20 tokens rewarded per second.
    uint256 public rewardPerSecond;
    // Total rewards added to farm
    uint256 public totalRewards;

    // Address of sales factory contract
    ISalesFactory public salesFactory;

    // Info of each pool.
    PoolInfo[] public poolInfo;
    // Info of each user that stakes LP tokens.[poolIndex: [userAddress: UserInfo]], record the specific user staked in some pool
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    // Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint;

    // The timestamp when farming starts.
    uint256 public startTimestamp;
    // The timestamp when farming ends.
    uint256 public endTimestamp;

    // Events
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );
    event CompoundedEarnings(
        address indexed user,
        uint256 indexed pid,
        uint256 amountAdded,
        uint256 totalDeposited
    );

    // currently it is only used to update tokensUnlockTime
    modifier onlyVerifiedSales() {
        require(
            salesFactory.isSaleCreatedThroughFactory(msg.sender),
            "Sale not created through factory."
        );
        _;
    }

    constructor(
        IERC20 _erc20,
        uint256 _rewardPerSecond,
        uint256 _startTimestamp,
        address _salesFactory
    ) Ownable(msg.sender) {
        erc20 = _erc20;
        rewardPerSecond = _rewardPerSecond;
        startTimestamp = _startTimestamp;
        endTimestamp = _startTimestamp;
        salesFactory = ISalesFactory(_salesFactory);
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    // Fund the farm, increase the end block
    function fund(uint256 _amount) public {
        require(
            block.timestamp < endTimestamp,
            "fund: too late, the farm is closed"
        );
        erc20.safeTransferFrom(address(msg.sender), address(this), _amount);
        endTimestamp += _amount / rewardPerSecond;
        totalRewards = totalRewards + _amount;
    }

    // Add a new lp to the pool. Can only be called by the owner.
    // DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function add(
        uint256 _allocPoint,
        IERC20 _lpToken,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardTimestamp = block.timestamp > startTimestamp
            ? block.timestamp
            : startTimestamp;
        totalAllocPoint = totalAllocPoint + _allocPoint;
        // Push new PoolInfo
        poolInfo.push(
            PoolInfo({
                lpToken: _lpToken,
                allocPoint: _allocPoint,
                lastRewardTimestamp: lastRewardTimestamp,
                accERC20PerShare: 0,
                totalDeposits: 0
            })
        );
    }

    // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // Update reward variables of the given pool to be up-to-date.
    // Update lastRewardTimestamp & accERC20PerShare
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];

        uint256 lastTimestamp = block.timestamp < endTimestamp
            ? block.timestamp
            : endTimestamp;

        if (lastTimestamp <= pool.lastRewardTimestamp) {
            lastTimestamp = pool.lastRewardTimestamp;
        }

        uint256 lpSupply = pool.totalDeposits;

        if (lpSupply == 0) {
            pool.lastRewardTimestamp = lastTimestamp;
            return;
        }

        uint256 nrOfSeconds = lastTimestamp - pool.lastRewardTimestamp;
        uint256 erc20Reward = (nrOfSeconds *
            rewardPerSecond *
            pool.allocPoint) / totalAllocPoint;
        console.log("erc20Reward: %d", erc20Reward);

        // Update pool accERC20PerShare, accERC20PerShare has nothing to do with duration
        pool.accERC20PerShare += (erc20Reward * 1e36) / lpSupply;

        // Update pool lastRewardTimestamp
        pool.lastRewardTimestamp = lastTimestamp;
    }

    function deposited(
        uint256 _pid,
        address _user
    ) public view returns (uint256) {
        UserInfo memory user = userInfo[_pid][_user];
        return user.amount;
    }

    function pending(
        uint256 _pid,
        address _user
    ) public view returns (uint256) {
        PoolInfo memory pool = poolInfo[_pid];
        UserInfo memory user = userInfo[_pid][_user];

        uint256 amount = user.amount;
        uint256 rewardDebt = user.rewardDebt;
        uint256 lpSupply = pool.totalDeposits;
        uint256 accERC20PerShare = pool.accERC20PerShare;

        // recalculate acc
        if (block.timestamp > pool.lastRewardTimestamp && lpSupply != 0) {
            uint256 lastTimestamp = block.timestamp < endTimestamp
                ? block.timestamp
                : endTimestamp;
            uint256 numOfSeconds = lastTimestamp - pool.lastRewardTimestamp;
            uint256 erc20Reward = (numOfSeconds *
                rewardPerSecond *
                pool.allocPoint) / totalAllocPoint;
            accERC20PerShare += (erc20Reward * 1e36) / lpSupply;
        }

        return (amount * accERC20PerShare) / 1e36 - rewardDebt;
    }

    function totalPending() public view returns (uint256) {
        if (block.timestamp < startTimestamp) {
            return 0;
        }
        uint256 lastTimestamp = block.timestamp < endTimestamp
            ? block.timestamp
            : endTimestamp;
        return rewardPerSecond * (lastTimestamp - startTimestamp) - paidOut;
    }

    // Deposit LP tokens to Farm for ERC20 allocation.
    function deposit(uint256 _pid, uint256 _amount) public {
        console.log("=== start deposit ===");
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        uint256 depositAmount = _amount;
        // Update pool
        // Update lastRewardTimestamp & accERC20PerShare of pool
        updatePool(_pid);

        // Transfer pending amount to user if already staking
        // transfer reward to user
        if (user.amount > 0) {
            uint256 pendingAmount = (user.amount * pool.accERC20PerShare) /
                1e36 -
                user.rewardDebt;
            console.log(
                "pendingAmount: %d, user.rewardDebt: %d",
                pendingAmount,
                user.rewardDebt
            );
            console.log(
                "user.amount: %d, accERC20PerShare: %d",
                user.amount,
                pool.accERC20PerShare
            );
            erc20Transfer(msg.sender, pendingAmount);
        }
        // erc20.safeTransferFrom(address(msg.sender), address(this), _amount);
        // Safe transfer lpToken from user
        pool.lpToken.safeTransferFrom(
            address(msg.sender),
            address(this),
            _amount
        );
        // Add deposit to total deposits
        pool.totalDeposits += depositAmount;
        // Add deposit to user's amount
        user.amount += depositAmount;
        // Compute reward debt
        user.rewardDebt = (user.amount * pool.accERC20PerShare) / 1e36;
        console.log("user.rewardDebt: %d", user.rewardDebt);
        // Emit relevant event
        emit Deposit(msg.sender, _pid, depositAmount);
    }

    // Withdraw LP tokens from Farm.
    function withdraw(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        require(
            user.tokensUnlockTime <= block.timestamp,
            "Last sale you registered for is not finished yet."
        );
        require(
            user.amount >= _amount,
            "withdraw: can't withdraw more than deposit"
        );

        // Update pool
        updatePool(_pid);

        // Compute user's pending amount
        uint256 pendingAmount = (user.amount * pool.accERC20PerShare) /
            1e36 -
            user.rewardDebt;

        // Transfer pending amount to user
        erc20Transfer(msg.sender, pendingAmount);
        user.amount -= _amount;
        user.rewardDebt = (user.amount * pool.accERC20PerShare) / 1e36;

        // Transfer withdrawal amount to user
        pool.lpToken.safeTransfer(address(msg.sender), _amount);
        pool.totalDeposits -= _amount;

        if (_amount > 0) {
            // Reset the tokens unlock time
            user.tokensUnlockTime = 0;
        }

        // Emit relevant event
        emit Withdraw(msg.sender, _pid, _amount);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(
            user.tokensUnlockTime <= block.timestamp,
            "Emergency withdraw blocked during sale and cooldown period."
        );
        pool.lpToken.safeTransfer(msg.sender, user.amount);
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);
        pool.totalDeposits -= user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        user.tokensUnlockTime = 0;
    }

    // Transfer ERC20 and update the required ERC20 to payout all rewards
    function erc20Transfer(address _to, uint256 _amount) internal {
        erc20.transfer(_to, _amount);
        paidOut += _amount;
    }

    // Function to fetch deposits and earnings at one call for multiple users for passed pool id.
    function getPendingAndDepositedForUsers(
        address[] memory users,
        uint pid
    ) external view returns (uint256[] memory, uint256[] memory) {
        uint256[] memory pendings = new uint256[](users.length);
        uint256[] memory depositeds = new uint256[](users.length);

        for (uint i = 0; i < users.length; i++) {
            pendings[i] = pending(pid, users[i]);
            depositeds[i] = deposited(pid, users[i]);
        }

        return (pendings, depositeds);
    }

    function setTokensUnlockTime(
        uint256 _pid,
        address _user,
        uint256 _tokensUnlockTime
    ) external onlyVerifiedSales {
        UserInfo storage user = userInfo[_pid][_user];
        // Require that tokens are currently unlocked
        require(user.tokensUnlockTime <= block.timestamp);
        user.tokensUnlockTime = _tokensUnlockTime;
        // Add sale to the array of sales user registered for.
        // msg.sender here must the factory contract.
        user.salesRegistered.push(msg.sender);
    }

    function getPoolDetail(
        uint256 _pid
    ) public view returns (uint256, uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        return (pool.accERC20PerShare, pool.lastRewardTimestamp);
    }

    function currentTime() public view returns (uint256) {
        return block.timestamp;
    }
}

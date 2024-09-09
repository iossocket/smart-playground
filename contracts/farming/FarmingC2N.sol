// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract FarmingC2N is Ownable {
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint256 userStake;
        uint256 accumulated;
        uint256 checkpoint;
    }

    struct PoolInfo {
        IERC20 lpToken;
        uint256 allocPoint;
        uint256 totalDeposits;
        uint256 accumulatedPerTokenRewards;
        uint256 lastUpdated;
    }

    IERC20 public immutable erc20;
    uint256 public immutable rewardPerSecond; // reward WEI per second

    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    PoolInfo[] public poolInfo;
    uint256 public totalAllocPoint;
    uint256 public immutable startTimestamp;
    uint256 public endTimestamp;
    uint256 public totalRewards;
    uint256 public paidOut;

    event Claim(address indexed user, uint256 indexed pid, uint256 rewards);
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );
    event NewBlock(uint256 timestamp);

    constructor(
        IERC20 _erc20,
        uint256 _rewardPerSecond,
        uint256 _startTimestamp
    ) Ownable(msg.sender) {
        erc20 = _erc20;
        rewardPerSecond = _rewardPerSecond;
        startTimestamp = _startTimestamp;
        endTimestamp = _startTimestamp;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    // fund total rewards, meanwhile extend the reward period
    function fund(uint256 _amount) public {
        // for test purpose
        // require(
        //     block.timestamp < endTimestamp,
        //     "fund: too late, the farm is closed"
        // );
        erc20.safeTransferFrom(msg.sender, address(this), _amount);
        endTimestamp += _amount / rewardPerSecond;
        totalRewards += _amount;
    }

    function add(
        uint256 _allocPoint,
        IERC20 _lpToken,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastUpdated = block.timestamp > startTimestamp
            ? block.timestamp
            : startTimestamp;
        totalAllocPoint += _allocPoint;
        poolInfo.push(
            PoolInfo({
                lpToken: _lpToken,
                allocPoint: _allocPoint,
                totalDeposits: 0,
                accumulatedPerTokenRewards: 0,
                lastUpdated: lastUpdated
            })
        );
    }

    function set(
        uint256 _pid,
        uint256 _allocPoint,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        PoolInfo storage info = poolInfo[_pid];
        totalAllocPoint = totalAllocPoint - info.allocPoint + _allocPoint;
        info.allocPoint = _allocPoint;
    }

    function deposited(
        uint256 _pid,
        address _user
    ) public view returns (uint256) {
        return userInfo[_pid][_user].userStake;
    }

    function _calculatePoolRewardsPerToken(
        PoolInfo memory pool
    )
        internal
        view
        returns (uint256 accumulatedPerTokenRewards, uint256 lastUpdated)
    {
        accumulatedPerTokenRewards = pool.accumulatedPerTokenRewards;
        lastUpdated = pool.lastUpdated;
        if (block.timestamp < startTimestamp) {
            return (accumulatedPerTokenRewards, lastUpdated);
        }

        uint256 lastUpdatedTimestamp = block.timestamp > endTimestamp
            ? endTimestamp
            : block.timestamp;
        if (lastUpdatedTimestamp == pool.lastUpdated) {
            console.log(
                "lastUpdatedTimestamp == pool.lastUpdated, accumulatedPerTokenRewards: %d",
                accumulatedPerTokenRewards
            );
            return (accumulatedPerTokenRewards, lastUpdated);
        }
        lastUpdated = lastUpdatedTimestamp;
        if (pool.totalDeposits == 0) {
            console.log(
                "pool.totalDeposits is 0, accumulatedPerTokenRewards: %d",
                accumulatedPerTokenRewards
            );
            return (accumulatedPerTokenRewards, lastUpdated);
        }
        uint256 elapsed = lastUpdatedTimestamp - pool.lastUpdated;
        console.log(
            "elapsed: %d, rewardPerSecond: %d",
            elapsed,
            rewardPerSecond
        );

        // pool.accumulatedPerTokenRewards + (elapsed * rewardPerSecond) * (pool.allocPoint / totalAllocPoint) / pool.totalDeposits;
        // every div operation need to nul 1e18
        uint newAccumulated = pool.accumulatedPerTokenRewards +
            (elapsed * rewardPerSecond * pool.allocPoint * 1e36) /
            (totalAllocPoint * pool.totalDeposits);
        return (newAccumulated, lastUpdated);
    }

    function pending(
        uint256 _pid,
        address _user
    ) public view returns (uint256) {
        PoolInfo memory pool = poolInfo[_pid];
        UserInfo memory user = userInfo[_pid][_user];
        (uint256 accumulatedPerTokenRewards, ) = _calculatePoolRewardsPerToken(
            pool
        );
        return
            user.accumulated +
            ((accumulatedPerTokenRewards - user.checkpoint) * user.userStake) /
            1e36;
    }

    function totalPending() external view returns (uint256) {
        if (block.timestamp <= startTimestamp) {
            return 0;
        }
        uint256 lastTimestamp = block.timestamp < endTimestamp
            ? block.timestamp
            : endTimestamp;
        return rewardPerSecond * (lastTimestamp - startTimestamp) - paidOut;
    }

    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            PoolInfo storage pool = poolInfo[pid];
            updatePool(pool);
        }
    }

    function updatePool(PoolInfo storage pool) internal {
        (
            uint256 accumulatedPerTokenRewards,
            uint256 lastUpdated
        ) = _calculatePoolRewardsPerToken(pool);

        pool.accumulatedPerTokenRewards = accumulatedPerTokenRewards;
        pool.lastUpdated = lastUpdated;
    }

    // Deposit LP tokens to Farm for ERC20 allocation.
    function deposit(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        uint256 depositAmount = _amount;
        updatePool(pool);
        user.accumulated +=
            ((pool.accumulatedPerTokenRewards - user.checkpoint) *
                user.userStake) /
            1e36;
        user.checkpoint = pool.accumulatedPerTokenRewards;
        pool.lpToken.safeTransferFrom(
            address(msg.sender),
            address(this),
            depositAmount
        );
        pool.totalDeposits += depositAmount;
        user.userStake += depositAmount;
        emit Deposit(msg.sender, _pid, depositAmount);
    }

    // Withdraw LP tokens from Farm.
    function withdraw(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        require(
            user.userStake >= _amount,
            "withdraw: can't withdraw more than deposit"
        );

        updatePool(pool);
        user.accumulated +=
            ((pool.accumulatedPerTokenRewards - user.checkpoint) *
                user.userStake) /
            1e36;
        user.checkpoint = pool.accumulatedPerTokenRewards;

        user.userStake -= _amount;
        pool.totalDeposits -= _amount;
        pool.lpToken.safeTransfer(address(msg.sender), _amount);

        emit Withdraw(msg.sender, _pid, _amount);
    }

    function claim(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        updatePool(pool);
        console.log("user.checkpoint: %d", user.checkpoint);

        user.accumulated +=
            ((pool.accumulatedPerTokenRewards - user.checkpoint) *
                user.userStake) /
            1e36;
        user.checkpoint = pool.accumulatedPerTokenRewards;

        uint256 rewards = user.accumulated;
        user.accumulated = 0;
        console.log("rewards: %d", rewards);
        console.log("balance: %d", erc20.balanceOf(address(this)));

        erc20.safeTransfer(msg.sender, rewards);

        emit Claim(msg.sender, _pid, rewards);
    }

    // Transfer ERC20 and update the required ERC20 to payout all rewards
    function erc20Transfer(address _to, uint256 _amount) internal {
        erc20.transfer(_to, _amount);
        paidOut += _amount;
    }

    //
    function createNewBlock() external returns (uint256) {
        emit NewBlock(block.timestamp);
        return block.timestamp;
    }
}

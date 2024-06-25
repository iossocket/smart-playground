// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CrowdFund {
    event Launch(
        uint id,
        address indexed creator,
        uint goal,
        uint32 startAt,
        uint32 endAt
    );
    event Cancel(uint id);
    event Pledge(uint indexed id, address indexed caller, uint amount);
    event Unpledge(uint indexed id, address indexed caller, uint amount);
    event Claim(uint id);
    event Refund(uint indexed id, address indexed caller, uint amount);

    struct Campaign {
        address creator;
        uint goal;
        uint32 startAt;
        uint32 endAt;
        bool claimed;
        uint pledged;
    }

    IERC20 public immutable token;
    mapping(uint => Campaign) public campaigns;
    uint public count;
    mapping(uint => mapping(address => uint)) public pledgedAccount;

    constructor(address token_) {
        token = IERC20(token_);
    }

    function launch(uint goal_, uint32 startAt_, uint32 endAt_) external {
        console.log("launch start: %s, end: %s", startAt_, endAt_);
        require(block.timestamp <= startAt_, "start at < now");
        require(startAt_ < endAt_, "start < end");
        require(endAt_ <= startAt_ + 90 days, "max duration");

        count += 1;
        campaigns[count] = Campaign({
            creator: msg.sender,
            goal: goal_,
            pledged: 0,
            claimed: false,
            startAt: startAt_,
            endAt: endAt_
        });

        emit Launch(count, msg.sender, goal_, startAt_, endAt_);
    }

    function cancel(uint id_) external {
        Campaign storage campaign = campaigns[id_];
        require(campaign.creator != address(0), "campaign not exist");
        require(campaign.startAt < block.timestamp, "started");
        require(campaign.creator == msg.sender, "creator only");

        delete campaigns[id_];
        emit Cancel(id_);
    }

    function pledge(uint id_, uint amount_) external {
        Campaign storage campaign = campaigns[id_];
        console.log(
            "pledge at: %s, campaign range: %s - %s",
            block.timestamp,
            campaign.startAt,
            campaign.endAt
        );
        require(block.timestamp >= campaign.startAt, "not start yet");
        require(block.timestamp < campaign.endAt, "Campaign ended");

        campaign.pledged += amount_;
        pledgedAccount[id_][msg.sender] += amount_;

        token.transferFrom(msg.sender, address(this), amount_);

        emit Pledge(id_, msg.sender, amount_);
    }

    function unpledge(uint id_, uint amount_) external {
        Campaign storage campaign = campaigns[id_];
        require(block.timestamp < campaign.endAt, "Campaign ended");
        require(pledgedAccount[id_][msg.sender] >= amount_, "invalid amount");

        campaign.pledged -= amount_;
        pledgedAccount[id_][msg.sender] -= amount_;
        token.transfer(msg.sender, amount_);

        emit Unpledge(id_, msg.sender, amount_);
    }

    function claim(uint id_) external {
        Campaign storage campaign = campaigns[id_];
        require(msg.sender == campaign.creator, "not creator");
        require(block.timestamp >= campaign.endAt, "not ent");
        require(campaign.pledged >= campaign.goal, "pledge < goal");
        require(!campaign.claimed, "claimed");

        campaign.claimed = true;
        token.transfer(msg.sender, campaign.goal);

        emit Claim(id_);
    }

    function refund(uint id_) external {
        Campaign storage campaign = campaigns[id_];
        require(block.timestamp >= campaign.endAt, "not ent");
        require(campaign.pledged >= campaign.goal, "pledge < goal");

        uint bal = pledgedAccount[id_][msg.sender];
        pledgedAccount[id_][msg.sender] = 0;
        token.transfer(msg.sender, bal);

        emit Refund(id_, msg.sender, bal);
    }
}

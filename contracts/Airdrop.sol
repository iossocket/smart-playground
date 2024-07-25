// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Airdrop {
    IERC20 public airdropToken;
    uint256 public totalTokensWithdrawn;

    mapping(address => bool) public wasClaimed;
    uint256 public constant TOKENS_PER_CLAIM = 100 * 10 ** 18;

    event TokensAirdropped(address beneficiary);

    constructor(address airdropToken_) {
        require(airdropToken_ != address(0));

        airdropToken = IERC20(airdropToken_);
    }

    // Function to withdraw tokens.
    function withdrawTokens() public {
        // tx.origin is the address of the EOA (externally ownder account) that originated the transaction,
        //and msg.sender is the address of whatever called the currently executing smart contract (could be an EOA or a smart contract).
        require(
            msg.sender == tx.origin,
            "Require that message sender is tx-origin."
        );

        address beneficiary = msg.sender;
        require(!wasClaimed[beneficiary], "Already claimed!");
        wasClaimed[msg.sender] = true;

        bool status = airdropToken.transfer(beneficiary, TOKENS_PER_CLAIM);
        require(status, "Token transfer status is false.");

        totalTokensWithdrawn += TOKENS_PER_CLAIM;
        emit TokensAirdropped(beneficiary);
    }
}

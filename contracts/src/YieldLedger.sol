// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract YieldLedger {
    address public immutable tokenAddress;
    address public controller;
    mapping(address => uint256) public balances;
    error NoBalance();

    constructor(address _controller) {
        controller = _controller;
    }

    modifier onlyController() {
        require(msg.sender == controller, "not controller");
        _;
    }

    function recordDeposit(address user, uint256 amount) external onlyController {
        balances[user] += amount;
    }

    function recordWithdrawal(address user, uint256 amount) external onlyController {
        if (balances[user] == 0) {
            revert NoBalance();
        }
        if (balances[user] < amount) {
            balances[user] = 0;
        } else {
            balances[user] -= amount;
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ITeller {
    function deposit(uint256 _assets, address _receiver) external returns (uint256);
    function redeem(uint256 _shares, address _receiver, address _account) external returns (uint256);
}

contract YeildVault {
    address public immutable tokenAddress;
    ITeller teller = ITeller(0x96424C885951ceb4B79fecb934eD857999e6f82B);
    mapping(address => uint256) public balances;

    constructor(address _token) {
        tokenAddress = _token;
    }

    function deposit(uint256 amount) external {
        if (amount == 0) {
            revert("Amount must be greater than zero");
        }

        if (IERC20(tokenAddress).allowance(msg.sender, address(this)) < amount) {
            revert("Insufficient allowance");
        }

        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount), "Transfer failed");

        balances[msg.sender] += amount;
        // Logic to invest the deposited tokens into yield-generating strategies
    }

    function withdraw(uint256 amount) external {
        if (amount == 0) {
            revert("Amount must be greater than zero");
        }

        if (balances[msg.sender] < amount) {
            revert("Insufficient balance");
        }

        require(IERC20(tokenAddress).transfer(msg.sender, amount), "Transfer failed");
        balances[msg.sender] -= amount;
    }

    
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {YeildVault} from "../src/YieldVault.sol";
import {Helper} from "./Helper.s.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployYieldVault is Script {
    uint256 deployerKey;
    address usdcAddress;

    struct NetworkConfig {
        uint256 deployerKey;
        address usdcAddress;
    }

    function run() external returns (YeildVault,address) {
        Helper helper = new Helper();
        (usdcAddress, deployerKey) = helper.activeNetworkConfig();

        vm.startBroadcast(deployerKey);
        YeildVault yieldVault = new YeildVault(usdcAddress);
        vm.stopBroadcast();
        return (yieldVault,usdcAddress);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {YieldLedger} from "../src/YieldLedger.sol";
import {Helper} from "./Helper.s.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployYieldLedger is Script {
    uint256 deployerKey;

    struct NetworkConfig {
        uint256 deployerKey;
    }

    function run() external returns (YieldLedger) {
        Helper helper = new Helper();
        (deployerKey) = helper.activeNetworkConfig();

        vm.startBroadcast(deployerKey);
        YieldLedger yieldLedger = new YieldLedger();
        vm.stopBroadcast();
        return (yieldLedger);
    }
}

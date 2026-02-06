// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";

import {ERC20Mock} from "../src/mocks/ERC20Mock.sol";

contract Helper is Script {
    NetworkConfig public activeNetworkConfig;
    uint256 public constant DEFAULT_ANVIL_KEY = uint256(uint160(address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)));

    struct NetworkConfig {
        address usdcAddress;
        uint256 deployerKey;
    }

    constructor() {
        if (block.chainid == 11155111) {
            activeNetworkConfig = getSepoliaNetworkConfig();
        } else {
            activeNetworkConfig = getOrCreateAnvilEthConfig();
        }
    }

    function getSepoliaNetworkConfig() internal returns (NetworkConfig memory) {
        return NetworkConfig({
            usdcAddress: 0x577D296678535e4903D59A4C929B718e1D575e0A, deployerKey: vm.envUint("SEPOLIA_PRIVATE_KEY")
        });
    }

    function getOrCreateAnvilEthConfig() public returns (NetworkConfig memory) {
        if (activeNetworkConfig.usdcAddress != address(0)) {
            return activeNetworkConfig;
        }

        vm.startBroadcast();
        address usdcAddress = address(new ERC20Mock("USDC", "USDC", msg.sender, 100));
        vm.stopBroadcast();
        activeNetworkConfig = NetworkConfig({usdcAddress: usdcAddress, deployerKey: DEFAULT_ANVIL_KEY});
        return activeNetworkConfig;
    }
}

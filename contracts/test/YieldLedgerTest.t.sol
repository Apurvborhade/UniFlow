// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import {Test, console} from "forge-std/Test.sol";
import {YieldLedger} from "../src/YieldLedger.sol";
import {DeployYieldLedger} from "../script/DeployYieldLedger.s.sol";
import {Helper} from "../script/Helper.s.sol";


contract YieldLedgerTest is Test {
    address public USER = makeAddr("user");
    Helper helper;
    YieldLedger yieldLedger;
    DeployYieldLedger deployer;


    function setUp() public {
        deployer = new DeployYieldLedger();
        (yieldLedger) = deployer.run();
    }

    
}

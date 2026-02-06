// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import {Test, console} from "forge-std/Test.sol";
import {YeildVault} from "../src/YieldVault.sol";
import {DeployYieldVault} from "../script/DeployYieldVault.s.sol";
import {Helper} from "../script/Helper.s.sol";
import {ERC20Mock} from "../src/mocks/ERC20Mock.sol";

contract YeildVaultTest is Test {
    address public USER = makeAddr("user");
    Helper helper;
    YeildVault yieldVault;
    DeployYieldVault deployer;
    ERC20Mock usdc;

    address public usdcAddress;
    uint256 public constant DEPOSIT_AMOUNT = 0.1 ether;
    uint256 public constant INITIAL_BALANCE = 10 ether;

    function setUp() public {
        deployer = new DeployYieldVault();
        (yieldVault, usdcAddress) = deployer.run();
      

        usdc = ERC20Mock(usdcAddress);

        ERC20Mock(usdcAddress).mint(USER, 10 ether);

        vm.prank(USER);
        usdc.approve(address(yieldVault), type(uint256).max);

        uint256 allowance = usdc.allowance(USER, address(yieldVault));
        console.log("Allowance USER -> vault:", allowance);
    }

    function testDeposit() public {
        vm.prank(USER);
        yieldVault.deposit(DEPOSIT_AMOUNT);

        // Vault received tokens
        assertEq(usdc.balanceOf(address(yieldVault)), DEPOSIT_AMOUNT);

        // Internal balance updated
        assertEq(yieldVault.balances(USER), DEPOSIT_AMOUNT);
    }

    function testWithdraw() public {
        // Deposit first
        vm.prank(USER);
        yieldVault.deposit(DEPOSIT_AMOUNT);

        // Withdraw
        vm.prank(USER);
        yieldVault.withdraw(DEPOSIT_AMOUNT);

        // User got tokens back
        assertEq(usdc.balanceOf(USER), INITIAL_BALANCE);

        // Vault balance zero
        assertEq(usdc.balanceOf(address(yieldVault)), 0);

        // Internal balance cleared
        assertEq(yieldVault.balances(USER), 0);
    }

    function testWithdrawMoreThanBalanceReverts() public {
        vm.prank(USER);
        yieldVault.deposit(DEPOSIT_AMOUNT);

        vm.prank(USER);
        vm.expectRevert(); // underflow revert
        yieldVault.withdraw(DEPOSIT_AMOUNT + 1);
    }
}

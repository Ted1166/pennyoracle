// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PennyOracle} from "../src/PennyOracle.sol";

contract MockUSDC {
    string public constant name = "Mock USDC";
    string public constant symbol = "USDC";
    uint8 public constant decimals = 6;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract PennyOracleTest is Test {
    PennyOracle pennyOracle;
    MockUSDC usdc;

    address oracle = address(0x1234);
    address asker = address(0xABCD);

    function setUp() public {
        usdc = new MockUSDC();
        pennyOracle = new PennyOracle(address(usdc), oracle);

        usdc.mint(asker, 1_000_000);
        vm.prank(asker);
        usdc.approve(address(pennyOracle), type(uint256).max);
    }

    function testAskDebitsPrice() public {
        vm.prank(asker);
        uint256 id = pennyOracle.ask("what is the meaning of life");

        assertEq(id, 0);
        assertEq(usdc.balanceOf(address(pennyOracle)), 10_000);
        assertEq(usdc.balanceOf(asker), 990_000);
    }

    function testAskRevertsOnEmptyQuestion() public {
        vm.prank(asker);
        vm.expectRevert(PennyOracle.EmptyQuestion.selector);
        pennyOracle.ask("");
    }

    function testAskRevertsWithoutApproval() public {
        address noAllowance = address(0xBEEF);
        usdc.mint(noAllowance, 1_000_000);

        vm.prank(noAllowance);
        vm.expectRevert();
        pennyOracle.ask("hello");
    }

    function testFulfillByOracle() public {
        vm.prank(asker);
        uint256 id = pennyOracle.ask("will it rain tomorrow");

        bytes32 hash = keccak256("yes, bring an umbrella");
        vm.prank(oracle);
        pennyOracle.fulfill(id, hash);

        PennyOracle.Question memory q = pennyOracle.getQuestion(id);
        assertTrue(q.fulfilled);
        assertEq(q.answerHash, hash);
    }

    function testFulfillRevertsForNonOracle() public {
        vm.prank(asker);
        uint256 id = pennyOracle.ask("who am i");

        vm.expectRevert(PennyOracle.NotOracle.selector);
        pennyOracle.fulfill(id, keccak256("you"));
    }

    function testFulfillRevertsIfAlreadyFulfilled() public {
        vm.prank(asker);
        uint256 id = pennyOracle.ask("double fulfill test");

        vm.prank(oracle);
        pennyOracle.fulfill(id, keccak256("first"));

        vm.prank(oracle);
        vm.expectRevert(PennyOracle.AlreadyFulfilled.selector);
        pennyOracle.fulfill(id, keccak256("second"));
    }

    function testWithdraw() public {
        vm.prank(asker);
        pennyOracle.ask("withdraw test");

        address recipient = address(0x9999);
        pennyOracle.withdraw(recipient, 10_000);

        assertEq(usdc.balanceOf(recipient), 10_000);
    }

    function testSetOracle() public {
        address newOracle = address(0x5555);
        pennyOracle.setOracle(newOracle);
        assertEq(pennyOracle.oracle(), newOracle);
    }
}

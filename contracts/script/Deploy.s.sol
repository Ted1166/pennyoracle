// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {PennyOracle} from "../src/PennyOracle.sol";

contract Deploy is Script {
    address constant USDC = 0x3600000000000000000000000000000000000000;

    function run() external returns (PennyOracle) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address oracleSigner = vm.envAddress("ORACLE_ADDRESS");

        vm.startBroadcast(deployerKey);
        PennyOracle pennyOracle = new PennyOracle(USDC, oracleSigner);
        vm.stopBroadcast();

        return pennyOracle;
    }
}

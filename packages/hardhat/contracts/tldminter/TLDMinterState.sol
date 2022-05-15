//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

import "../interfaces/ITLDMinter.sol";
import "../interfaces/ITLD.sol";
import "../shared/AdminableUpgradeable.sol";

abstract contract TLDMinterState is
    Initializable,
    ITLDMinter,
    AdminableUpgradeable
{
    event TLDMint(address indexed _owner, uint256 _batchSize);

    ITLD public tld;

    mapping(address => bool) public addressToHasClaimed;

    bytes32 public merkleRoot;

    uint8 public maxBatchSize;

    function __TLDMinterState_init() internal initializer {
        AdminableUpgradeable.__Adminable_init();
        maxBatchSize = 20;
    }
}

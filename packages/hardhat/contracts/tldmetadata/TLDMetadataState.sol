//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../shared/AdminableUpgradeable.sol";
import "../interfaces/ITLDMetadata.sol";

abstract contract TLDMetadataState is Initializable, AdminableUpgradeable {
    function __TLDMetadataState_init() internal initializer {
        AdminableUpgradeable.__Adminable_init();
    }

    string public baseURI;
    string public provenance;
}

// Load dependencies
const { expect, assert } = require('chai');
const { ethers, upgrades } = require('hardhat');
const { MerkleTree } = require('merkletreejs')
const { utils } = require('ethers')
const { keccak256 } = require("keccak256");

let TLDMinter;
let tldMinter;

const testAddress = '0x0259D65954DfbD0735E094C9CdACC256e5A29dD4';
const testAddress_2 = '0x85B430bf49c0186BB3Ec0512662762753E84aD22';

const testAddresses = new Set([testAddress, testAddress_2])

const leafNodes = [...testAddresses].map(addr => {
    const amount = 1;
    return utils.solidityKeccak256(["address", "uint256"], [addr.trim().toLocaleLowerCase(), amount])
});

const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

// Gets the root hash of the merkle tree in hex format
const root = merkleTree.getRoot();

// NOTE: lots of the minting function can't be tested in isolation
describe('TLDMinter', () => {
    beforeEach(async () => {
        TLDMinter = await ethers.getContractFactory("TLDMinter");
        tldMinter = await upgrades.deployProxy(TLDMinter);
        await tldMinter.deployed();
    });

    it('lets admin sets merkle root without complaining', async () => {
        await tldMinter.setMerkleRoot(root);
    });

    it('complains when non admin tries to setMerkleRoot', async () => {
        const [owner, address1] = await ethers.getSigners();
        await expect(tldMinter.connect(address1).setMerkleRoot(root)).to.be.reverted;
    });

    it('returns the correct value when contracts are not set', async () => {
        expect(await tldMinter.areContractsSet()).to.be.false;
        await tldMinter.setContracts(testAddress);
        expect(await tldMinter.areContractsSet()).to.be.true;
    });
});
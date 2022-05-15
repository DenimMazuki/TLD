// Load dependencies
const { expect, assert } = require('chai');
const { ethers, upgrades } = require('hardhat');
const { MerkleTree } = require('merkletreejs')
const keccak256 = require("keccak256");

let TLDMinter;
let tldMinter;

let TLD;
let tld;

let TLDMetadata;
let tldMetadata;

const testAddress = '0x0259D65954DfbD0735E094C9CdACC256e5A29dD4';
const testAddress_2 = '0x85B430bf49c0186BB3Ec0512662762753E84aD22';

let merkleTree;
let root;


const instantiateRootValue = (addressArray) => {
    const leafNodes = addressArray.map(addr => {
        return keccak256(addr.trim().toLowerCase())
    });
    merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    // Gets the root hash of the merkle tree in hex format
    root = merkleTree.getRoot();
}

describe('Initial TLD Deployment 1: Contracts at deployment ', () => {
    beforeEach(async () => {
        TLDMinter = await ethers.getContractFactory("TLDMinter");
        tldMinter = await upgrades.deployProxy(TLDMinter);

        TLD = await ethers.getContractFactory("TLD");
        tld = await upgrades.deployProxy(TLD);

        TLDMetadata = await ethers.getContractFactory("TLDMetadata");
        tldMetadata = await upgrades.deployProxy(TLDMetadata);

        await tldMinter.deployed();
        await tld.deployed();
        await tldMetadata.deployed();

        const [owner, address1, address2] = await ethers.getSigners();
        instantiateRootValue([owner, address1, address2].map((addy) => addy.address));
    });

    it('lets admin setup TLDMetadata without error', async () => {
        await tldMetadata.setBaseURI('ipfs://test')
    });

    it('lets admin setup TLD without error', async () => {
        await tld.setContracts(tldMetadata.address);
        await tld.addMinter(tldMinter.address);
        await tld.setPause(false);
    });

    it('lets admin setup TLDMinter without error', async () => {
        await tldMinter.setMerkleRoot(root);
        await tldMinter.setPause(false);
        await tldMinter.setContracts(tld.address);
    })

    it('lets admin run entire deployment set up without failure', async () => {
        await tldMetadata.setBaseURI('ipfs://test');

        await tld.setContracts(tldMetadata.address);
        await tld.addMinter(tldMinter.address);
        await tld.setPause(false);

        await tldMinter.setMerkleRoot(root);
        await tldMinter.setPause(false);
        await tldMinter.setContracts(tld.address);
    });
});


describe('Initial TLD Deployment 2: once all the contracts have been setup and unpaused', () => {
    beforeEach(async () => {
        TLDMinter = await ethers.getContractFactory("TLDMinter");
        tldMinter = await upgrades.deployProxy(TLDMinter);

        TLD = await ethers.getContractFactory("TLD");
        tld = await upgrades.deployProxy(TLD);

        TLDMetadata = await ethers.getContractFactory("TLDMetadata");
        tldMetadata = await upgrades.deployProxy(TLDMetadata);

        const addressesToMintlist = (await ethers.getSigners()).map((addy) => addy.address);
        const [owner, addr1] = await ethers.getSigners();
        // Intentionally filter out addr1
        instantiateRootValue(addressesToMintlist.filter((addr) => addr !== addr1.address));

        // setup
        await tldMetadata.setBaseURI('ipfs://test');
        await tld.setContracts(tldMetadata.address);
        await tld.addMinter(tldMinter.address);
        await tld.setPause(false);
        await tldMinter.setMerkleRoot(root);
        await tldMinter.setPause(false);
        await tldMinter.setContracts(tld.address);

    });

    it('airdrop correctly updates the supply count of mint', async () => {
        await tldMinter.airdrop(testAddress, 1);
        expect(await tld.totalSupply()).to.equal(1);
        await tldMinter.airdrop(testAddress, 9);
        expect(await tld.totalSupply()).to.equal(10);
    });

    it('airdrop will revert when trying to hit max supply', async () => {
        await tld.setMaxSupply(3);
        await expect(tldMinter.airdrop(testAddress, 4)).to.be.reverted;
        await expect(tldMinter.airdrop(testAddress, 3)).emit(tldMinter, "TLDMint").withArgs(testAddress, 3);
        await expect(tldMinter.airdrop(testAddress, 1)).to.be.reverted;
    });

    it('changing maxSupply to lower than totalSupply should not be possible', async () => {
        await tldMinter.airdrop(testAddress, 5);
        await expect(tld.setMaxSupply(3)).to.be.reverted;
    });

    it('burn correctly updates the total supply count of TLD', async () => {
        await expect(tldMinter.airdrop(testAddress, 5)).emit(tldMinter, "TLDMint").withArgs(testAddress, 5);
        let totalSupply = 5;
        for (i = 0; i <= 4; ++i) {
            await tld.burn(i);
            --totalSupply;
            expect(await tld.totalSupply()).to.equal(totalSupply);
        }
        await expect(tld.burn(4)).to.be.reverted;
    });

    it('lets addresses on mintlist mint once', async () => {
        const [owner] = await ethers.getSigners();
        const claimingAddress = owner.address;
        const hexProof = merkleTree.getHexProof(keccak256(claimingAddress.toLowerCase()));
        await expect(tldMinter.mint(hexProof)).emit(tldMinter, "TLDMint").withArgs(claimingAddress, 1);
        expect(await tld.totalSupply()).to.equal(1);
        await expect(tldMinter.mint(hexProof)).to.be.reverted;
    });

    it('bonks people who are not on the mintlist when minting', async () => {
        const [owner, notMintListedAddr] = await ethers.getSigners();
        const hexProof = merkleTree.getHexProof(keccak256(notMintListedAddr.address.toLowerCase()));
        await expect(tldMinter.connect(notMintListedAddr).mint(hexProof)).to.be.reverted;
    });

    it('prevents non admin to airdrop', async () => {
        const [owner, address1] = await ethers.getSigners();
        await expect(tldMinter.connect(address1).airdrop(testAddress, 2)).to.be.reverted;
    });

    it('lets admin update merkle root and then be able to mint an address thats previously not mintlisted', async () => {
        const [owner, notMintListedAddr] = await ethers.getSigners();
        // verify testAddress is unable to mint
        const hexProof = merkleTree.getHexProof(keccak256(notMintListedAddr.address.toLowerCase()));
        await expect(tldMinter.connect(notMintListedAddr).mint(hexProof)).to.be.reverted;

        // update merkle tree and root
        const newAddresses = (await ethers.getSigners()).map(addy => addy.address);
        instantiateRootValue(newAddresses)

        await tldMinter.setMerkleRoot(root);
        const newProof = merkleTree.getHexProof(keccak256(notMintListedAddr.address.toLowerCase()));
        await expect(tldMinter.connect(notMintListedAddr).mint(newProof)).emit(tldMinter, "TLDMint").withArgs(notMintListedAddr.address, 1);
        expect(await tld.totalSupply()).to.equal(1);
    });

});
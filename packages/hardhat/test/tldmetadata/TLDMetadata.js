// Load dependencies
const { expect, assert } = require('chai');
const { ethers, upgrades } = require('hardhat');

let TLDMetadata;
let tldMetadata;

// Start test block
describe('TLDMetadata', () => {
    beforeEach(async () => {
        TLDMetadata = await ethers.getContractFactory("TLDMetadata");
        tldMetadata = await upgrades.deployProxy(TLDMetadata)
        await tldMetadata.deployed();
    });

    it("returns a blank tokenURI when constructed", async () => {
        await tldMetadata.tokenURI(1)
    });

    // pre-reveal ONLY 
    it('tokenURI is set to whatever baseURI is passed in (unrevealed image)', async () => {
        const unrevealedSite = 'ipfs://unrevealed.png';
        await tldMetadata.setBaseURI(unrevealedSite);
        expect((await tldMetadata.tokenURI(1))).to.equal(unrevealedSite);
    });

    it('does not allow non admins to unpause the contract', async () => {
        const [owner, addr1] = await ethers.getSigners();
        await expect(tldMetadata.connect(addr1).setPause(false)).to.be.reverted;;
    });

    it('allows new address admin to unpause the contract', async () => {
        const [owner, addr1] = await ethers.getSigners();
        await tldMetadata.addAdmin(addr1.address);
        await tldMetadata.connect(addr1).setPause(false);
    });

    it('does not allow non-admin to set baseURI', async () => {
        await tldMetadata.setPause(false);
        const unrevealedSite = 'ipfs://unrevealed.png';
        const [owner, addr1] = await ethers.getSigners();
        await expect(tldMetadata.connect(addr1).setBaseURI(unrevealedSite)).to.be.reverted;
    });

    it('does not allow non-admin to set provenance', async () => {
        await tldMetadata.setPause(false);
        const provenanceString = 'abcde';
        const [owner, addr1] = await ethers.getSigners();
        await expect(tldMetadata.connect(addr1).setProvenance(provenanceString)).to.be.reverted;
    });
})
// Load dependencies
const { expect, assert } = require("chai");
const { ethers, upgrades } = require("hardhat");

let TLD;
let tld;

const testAddress = "0x0259D65954DfbD0735E094C9CdACC256e5A29dD4";
const testAddress_2 = "0x85B430bf49c0186BB3Ec0512662762753E84aD22";

// NOTE: tokenURI can't be properly tested without testing Metadata. Will do so in another file
describe("TLD Upgradable", () => {
  beforeEach(async () => {
    TLD = await ethers.getContractFactory("TLD");
    tld = await upgrades.deployProxy(TLD);
    await tld.deployed();
  });

  it("has a totalSupply of 0 at initialization", async () => {
    expect(await tld.totalSupply()).to.equal(0);
  });

  it("is paused on initialization", async () => {
    await expect(tld.mint(testAddress, 1)).to.be.reverted;
  });

  it("can only be minted by Minter. Contract deployer is not a minter", async () => {
    await tld.setPause(false);
    await expect(tld.mint(testAddress, 1)).to.be.reverted;
  });

  it("can add minter properly", async () => {
    await tld.addMinter(testAddress);
    expect(await tld.isMinter(testAddress)).to.be.true;
  });

  it("is paused unless explicitly paused", async () => {
    await tld.addMinter(testAddress);
    await expect(tld.mint(testAddress, 1)).to.be.reverted;
  });

  // NOTE: Minter is going to be a Minter Contract. This is just to test
  it("allows mint after becoming minter and contract is unpaused", async () => {
    const [owner] = await ethers.getSigners();
    await tld.addMinter(owner.address);
    await tld.setPause(false);
    await tld.mint(testAddress, 1);
    expect(await tld.totalSupply()).to.equal(1);
  });

  it("reverts when non admin tries to setMaxSupply", async () => {
    const [owner, address1] = await ethers.getSigners();
    await expect(tld.connect(address1).setMaxSupply(2)).to.be.reverted;
  });

  it("reverts maxSupply is hit", async () => {
    const [owner] = await ethers.getSigners();
    await tld.addMinter(owner.address);
    await tld.setPause(false);
    await tld.setMaxSupply(1);
    await tld.mint(testAddress, 1);
    await expect(tld.mint(testAddress, 1)).to.be.reverted;
  });

  it("complaints when contract are not set", async () => {
    await expect(tld.tokenURI(1)).to.be.reverted;
  });

  it("returns the correct value for areContractsSet() when contracts are set", async () => {
    expect(await tld.areContractsSet()).to.be.false;
    await tld.setContracts(testAddress_2);
    expect(await tld.areContractsSet()).to.be.true;
  });

  it("has a positive totalSupply() despite token burns", async () => {
    await tld.setContracts(testAddress_2);
    expect(await tld.totalSupply()).to.equal(0);
    const [owner] = await ethers.getSigners();
    await tld.addMinter(owner.address);
    await tld.setPause(false);
    await tld.mint(testAddress, 1);
    expect(await tld.totalSupply()).to.equal(1);
    await tld.burn(0);
    expect(await tld.totalSupply()).to.equal(0);
    await expect(tld.burn(0)).to.be.reverted;
    expect(await tld.totalSupply()).to.equal(0);
    await expect(tld.burn(1)).to.be.reverted;
    expect(await tld.totalSupply()).to.equal(0);
  });
});

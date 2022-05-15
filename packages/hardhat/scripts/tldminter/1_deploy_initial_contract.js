const { ethers, upgrades } = require('hardhat');
const { requireEnvVariables } = require('../utils');

require('dotenv').config();
requireEnvVariables(['DEVNET_PRIVKEY', 'L2RPC']);

// TESTNET ADDY RN
const TLDAddress = '0x6d678Cc3A12b9A0c84C4438c428Ef85931C6095F';

const TLDMinterAddress = '0x17734958243143668e8D6246546157577E40371d';
async function main() {
  // const TLDMinter = await ethers.getContractFactory("TLDMinter");
  // console.log("Deploying TLDMinter...");
  // const tldMinter = await upgrades.deployProxy(TLDMinter);
  // await tldMinter.deployed();
  // console.log("TLDMinter deployed to: ", tldMinter.address);
  // console.log("TLDMinter setting contract");

  // await tldMinter.setContracts(TLDAddress);
  const TLD = await ethers.getContractFactory('TLD');
  const tld = await TLD.attach(TLDAddress);
  // console.log("TLD adding minter as minter");
  await tld.addMinter(TLDMinterAddress);
}

main();

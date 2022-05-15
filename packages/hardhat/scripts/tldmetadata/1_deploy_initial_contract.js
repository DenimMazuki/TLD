const { ethers, upgrades } = require("hardhat");
const { requireEnvVariables } = require("../utils");

require("dotenv").config();
requireEnvVariables(["DEVNET_PRIVKEY", "L2RPC"]);

async function main() {
  const TLDMetadata = await ethers.getContractFactory("TLDMetadata");
  console.log("Deploying TLDMetadata...");
  const tldMetadata = await upgrades.deployProxy(TLDMetadata);
  await tldMetadata.deployed();
  console.log("TLD metadata deployed to: ", tldMetadata.address);
}

main();

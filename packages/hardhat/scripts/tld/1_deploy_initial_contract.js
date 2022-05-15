const { ethers, upgrades } = require("hardhat");
const { requireEnvVariables } = require("../utils");

require("dotenv").config();
requireEnvVariables(["DEVNET_PRIVKEY", "L2RPC"]);

const TLDMetadataAddress = "0xB1492b7a698DE2EBf6Ea0138fe87225F97a3fdEa";

async function main() {
  const TLD = await ethers.getContractFactory("TLD");
  console.log("Deploying TLD...");
  const tld = await upgrades.deployProxy(TLD);
  await tld.deployed();
  console.log("TLD deployed to: ", tld.address);
  console.log("TLD setting contract");
  // await tld.setContracts(TLDMetadataAddress);
}

main();

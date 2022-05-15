const { ethers, upgrades } = require("hardhat");
const { requireEnvVariables } = require("../utils");

require("dotenv").config();
requireEnvVariables(["DEVNET_PRIVKEY", "L2RPC"]);

// TESTNET ADDY RN
const TLDMinterAddress = "0x79871042aDEceba21434c3Cdf999B269654E2e3b";

async function main() {
  const TLDMinter1A = await ethers.getContractFactory("TLDMinter1A");
  console.log("Upgrading TLDMinterV1A...");
  await upgrades.upgradeProxy(TLDMinterAddress, TLDMinter1A);
  console.log("TLDMinter upgraded");
}

main();

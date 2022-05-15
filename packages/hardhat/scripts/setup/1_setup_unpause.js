const { ethers, upgrades } = require("hardhat");
const { requireEnvVariables } = require("../utils");

require("dotenv").config();
requireEnvVariables(["DEVNET_PRIVKEY", "L2RPC"]);

// TESTNET ADDY RN
const TLDMetadataAddress = "0x0abE5B4d0c1FC72dB05807f7Be7F76a1dF4A007f";
const TLDAddress = "0x29DD1481b4487724bE02279eE7423D10b16Def7B";
const TLDMinterAddress = "0x79871042aDEceba21434c3Cdf999B269654E2e3b";

async function main() {
  const TLDMetadata = await ethers.getContractFactory("TLDMetadata");
  const TLD = await ethers.getContractFactory("TLD");
  const TLDMinter = await ethers.getContractFactory("TLDMinter");

  const tldMetadata = await TLDMetadata.attach(TLDMetadataAddress);
  const tld = await TLD.attach(TLDAddress);
  const tldMinter = await TLDMinter.attach(TLDMinterAddress);

  console.log("Setting arbitrary baseURI for metadata");
  await tldMetadata.setBaseURI("ipfs://test");
  console.log("unpausing tld");
  await tld.setPause(false);
  console.log("unpausing tldMinter");
  await tldMinter.setPause(false);
}

main();

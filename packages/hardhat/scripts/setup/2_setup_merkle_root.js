const { ethers, upgrades } = require('hardhat');
const { requireEnvVariables } = require('../utils');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const addressesJson = require('../../data/1_addresses');

require('dotenv').config();
requireEnvVariables(['DEVNET_PRIVKEY', 'L2RPC']);

let merkleTree;
let root;

const instantiateRootValue = (addressArray) => {
  const leafNodes = addressArray.map((addr) => {
    return keccak256(addr.trim().toLowerCase());
  });
  merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  // Gets the root hash of the merkle tree in hex format
  root = merkleTree.getRoot();
};

// TESTNET ADDY RN
const TLDMinterAddress = '0x17734958243143668e8D6246546157577E40371d';
const mintlistedAddress = new Set(
  addressesJson.map((row) => row.address.toLowerCase())
);
const addressArray = [...mintlistedAddress];

instantiateRootValue(addressArray);

async function main() {
  const TLDMinter = await ethers.getContractFactory('TLDMinter');
  const tldMinter = await TLDMinter.attach(TLDMinterAddress);
  console.log('setting root');
  await tldMinter.setMerkleRoot(root);
}

main();

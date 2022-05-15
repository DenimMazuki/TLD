require("dotenv").config();
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.11",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
      {
        version: "0.8.2",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
      {
        version: "0.7.2",
        settings: {},
      },
      {
        version: "0.6.12",
        settings: {},
      },
      {
        version: "0.6.11",
        settings: {},
      },
    ],
  },
  networks: {
    l1: {
      gas: 2100000,
      gasLimit: 0,
      url: process.env["L1RPC"] || "",
      accounts: process.env["DEVNET_PRIVKEY"]
        ? [process.env["DEVNET_PRIVKEY"]]
        : [],
    },
    l2: {
      url: process.env["L2RPC"] || "",
      accounts: process.env["DEVNET_PRIVKEY"]
        ? [process.env["DEVNET_PRIVKEY"]]
        : [],
      gas: "auto",
      gasPrice: "auto",
      gasLimit: 7583290000,
    },
    l2rinkeby: {
      url: process.env["L2RPC"] || "",
      accounts: process.env["DEVNET_PRIVKEY"]
        ? [process.env["DEVNET_PRIVKEY"]]
        : [],
      gas: "auto",
      gasPrice: "auto",
      gasLimit: 1083290,
    },
  },
  etherscan: {
    apiKey: {
      arbitrumTestnet: "UMFRTFMZ9FJJDP9TIQS7YNW5W1M8DYJPAE",
    },
  },
};

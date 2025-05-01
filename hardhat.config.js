require("@nomicfoundation/hardhat-toolbox");
const secret = require('./secret.json');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      accounts: [secret.privateKey]
    },
    zkSyncSepolia: {
      url: "https://sepolia.era.zksync.dev",
      chainId: 300,
      accounts: [secret.privateKey]
    }
  }
}; 
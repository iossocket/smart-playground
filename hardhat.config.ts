import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "dotenv/config";
import { task } from "hardhat/config";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    const balance = await hre.ethers.provider.getBalance(account.address);
    console.log(`${account.address} - Balance: ${hre.ethers.formatEther(balance)} ETH`);
  }
});

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  paths: {
    artifacts: "./frontend/src/artifacts"
  },
  networks: {
    hardhat: {
      // allowBlocksWithSameTimestamp: true,
      // blockGasLimit: 12000000,
    },
    sepolia: {
      url: process.env.PUBLIC_API,
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
  }
};

export default config;

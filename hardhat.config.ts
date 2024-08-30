import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      allowBlocksWithSameTimestamp: true,
    },
    sepolia: {
      url: process.env.PUBLIC_API,
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
  }
};

export default config;

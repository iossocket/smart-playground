const { ethers, upgrades } = require("hardhat");

async function main() {
  const deployedProxyAddress = "0x1218Cb33763401304790577AFDF12272F322B5eD";

  const PriceFeedTrackerV2 = await ethers.getContractFactory(
    "PriceFeedTrackerV2"
  );
  console.log("Upgrading PriceFeedTracker...");

  await upgrades.upgradeProxy(deployedProxyAddress, PriceFeedTrackerV2);
  console.log("PriceFeedTracker upgraded");
}

main(); 
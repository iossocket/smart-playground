// The Open Zeppelin upgrades plugin adds the `upgrades` property
// to the Hardhat Runtime Environment.
// https://docs.openzeppelin.com/upgrades-plugins/1.x/api-hardhat-upgrades#common-options
const { ethers, network, upgrades } = require("hardhat");

async function main() {
  // Obtain reference to contract and ABI.
  const PriceFeedTracker = await ethers.getContractFactory("PriceFeedTracker");
  console.log("Deploying PriceFeedTracker to:", network.name);

  // Get the first account from the list of 20 created for you by Hardhat
  // const [account1] = await ethers.getSigners();

  //  Deploy logic contract using the proxy pattern.
  const priceFeedTracker = await upgrades.deployProxy(
    PriceFeedTracker,

    // Since the logic contract has an initialize() function
    // we need to pass in the arguments to the initialize()
    // function here.
    ["0x07D6C168C417432D809d62676f564A38737f77b8"],

    // We don't need to expressly specify this
    // as the Hardhat runtime will default to the name 'initialize'
    { initializer: "initialize" }
  );
  // console.log("upgrades", upgrades, priceFeedTracker);
  await priceFeedTracker.waitForDeployment();

  console.log("PriceFeedTracker deployed to:", await priceFeedTracker.getAddress());
  // 0x1218Cb33763401304790577AFDF12272F322B5eD
}

main();
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import { ethers, network, upgrades } from "hardhat";

const PriceFeedTrackerModule = buildModule("PriceFeedTrackerModule", (m) => {

  const priceFees = m.contract("PriceFeedTrackerV1");

  return { priceFees };
});

export default PriceFeedTrackerModule;

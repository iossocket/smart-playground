import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import FarmingC2NModule from "./FarmingC2N";
import { ethers } from "hardhat";

const DECIMAL = 18;
const INIT_TOKEN = ethers.parseUnits("1000000", DECIMAL);

const MintAirdropModule = buildModule("MintAirdropModule", (m) => {
  const { airdrop01, lpToken01 } = m.useModule(FarmingC2NModule);
  m.call(lpToken01, "mint", [airdrop01, ethers.parseUnits("1000000", DECIMAL)]);
  return { airdrop01 };
});

export default MintAirdropModule;
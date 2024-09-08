import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

const SEPT_2ND_2024 = 1725206400;
const DECIMAL = 18;
const INIT_TOKEN = ethers.parseUnits("10000", DECIMAL);

// ignition record every steps in ./ignition/deployment folder.
/*
For the first time, it will start to record from sketch.
and the following runs, it will resume from the record in ./ignition/deployment.
so it can resume a failure deployment. and can depend on other module in ./ignition/modules

if need to deploy the same contract multiple times for some reasons, has to add the last params with an unique id.
if need to call the same function in the same contract multiple times, has to add the last params with an unique id.
*/
// await provider.send("wallet_addEthereumChain", [CURRENT_CHAIN]);
const FarmingC2NModule = buildModule("FarmingC2NModule", (m) => {
  const initToken = m.getParameter("c2nInitToken", INIT_TOKEN);

  const c2nToken = m.contract("C2NToken", ["C2N", "C2N", initToken, 18])
  const farmingC2N = m.contract("FarmingC2N", [c2nToken, 10, SEPT_2ND_2024]);

  // last parameter { id } need to be provided while the contract has been used in the same module above
  const lpToken01 = m.contract("C2NToken", ["LP01", "LP01", initToken, 18], { id: "lpToken01" })
  const lpToken02 = m.contract("C2NToken", ["LP02", "LP02", initToken, 18], { id: "lpToken02" })

  const airdrop01 = m.contract("Airdrop", [lpToken01]);
  m.call(lpToken01, "mint", [airdrop01, ethers.parseUnits("1000000", DECIMAL)]);

  m.call(c2nToken, "approve", [farmingC2N, initToken])
  m.call(farmingC2N, "fund", [initToken])
  m.call(farmingC2N, "add", [250, lpToken01, true], { id: "add_lpToken01" });
  m.call(farmingC2N, "add", [750, lpToken02, true], { id: "add_lpToken02" });

  return { farmingC2N, c2nToken, lpToken01, lpToken02, airdrop01 };
});

export default FarmingC2NModule;

// npx hardhat ignition deploy ./ignition/modules/FarmingC2N.ts --network localhost

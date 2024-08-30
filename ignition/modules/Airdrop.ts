import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AirdropModule = buildModule("AirdropModule", (m) => {
  const c2n = m.contract("C2NToken", ["C2N", "C2N", 1000, 18]);
  const airdrop = m.contract("Airdrop", [c2n]);

  return { airdrop };
});

export default AirdropModule;
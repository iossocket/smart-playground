import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FreeMintModule = buildModule("FreeMintModule", (m) => {

  const freeMint = m.contract("FreeMint");

  return { freeMint };
});

export default FreeMintModule;

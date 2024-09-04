# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts

npx hardhat ignition deploy ./ignition/modules/Airdrop.ts --network localhost
```

proxy
```shell
npx hardhat run deployment/UpgradePricefeedtracker.js --network sepolia 

npx hardhat console --network sepolia

# debug in console
const PriceFeedTrackerV2 = await ethers.getContractFactory("PriceFeedTrackerV2");
const priceFeedTrackerV2 = await PriceFeedTrackerV2.attach('0x1218Cb33763401304790577AFDF12272F322B5eD')
(await priceFeedTrackerV2.retrievePrice())


npx hardhat console
const C2N = await ethers.getContractFactory("C2NToken");
const c2n = await C2N.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
```

AirdropModule#C2NToken - 0x5FbDB2315678afecb367f032d93F642f64180aa3
AirdropModule#Airdrop - 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

## 

SalesFactory -> C2NSale -> AllocationStating

allowBlocksWithSameTimestamp time 设置时间戳后，在 contract 内的的 block.timestamp 不会产生 1s 的
```
const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      allowBlocksWithSameTimestamp: true,
    },
  }
};
```

### Farming process

1. deploy FarmingC2N, do fund and add one pool

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


npx hardhat console --network localhost
const C2N = await ethers.getContractFactory("C2NToken");
const c2n = await C2N.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

const FarmingC2N = await ethers.getContractFactory("FarmingC2N");
const farmingC2N = await FarmingC2N.attach("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");

# total rewards: 10000000000000000000n
# 10 per sec
# 1725206400 + 10000000000000000000 / 10
# 1000000000000000000
# 1000000001725206400
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

```

```

### Farming process

1. deploy FarmingC2N, do fund and add one pool

1.1 delete existing local network in metamask

1.2 run `npx hardhat node` to start local chain

1.3 run following script in chrome console to add local network back
```
window.ethereum.request({
  "method": "wallet_addEthereumChain",
  "params": [
    {
      chainName: "localhost",
      chainId: "0x7A69",
      rpcUrls: ["http://localhost:8545"],
      iconUrls: [],
      nativeCurrency: {
        name: "GO",
        symbol: "GO",
        decimals: 18,
      },
      blockExplorerUrls: ["http://localhost:8545"],
    }
  ],
});
```

1.4 run `npm run local` to deploy c2n related contracts

1.5 clear nonce data in metamask, `Settings -> Advanced -> Clear activity and nonce data`

1.6 run `npm run dev` to start frontend in dev environment

> 1.1, 1.3, 1.5 is useful to deal with unexpected exception.
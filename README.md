### Farming process

1. deploy FarmingC2N, do fund and add one pool

* 1.1 delete existing local network in metamask

* 1.2 run `npx hardhat node` to start local chain

* 1.3 run following script in chrome console to add local network back

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
  > run it in Google homepage

* 1.4 run `npm run local` to deploy c2n related contracts

* 1.5 clear nonce data in metamask, `Settings -> Advanced -> Clear activity and nonce data`

* 1.6 run `npm run dev` to start frontend in dev environment

> 1.1, 1.3, 1.5 is useful to deal with unexpected exception.

> In localhost env, block,timestamp wont change if no block mined, so can run `await farmingC2N.createNewBlock()` in hardhat console, which will do nothing except emit an event with timestamp

### Common Command

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
npx hardhat ignition deploy ./ignition/modules/Airdrop.ts --network localhost
```

### Interact with contract by hardhat console

`npx hardhat console --network localhost`

```typescript
const C2N = await ethers.getContractFactory("C2NToken");
const c2n = await C2N.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

const FarmingC2N = await ethers.getContractFactory("FarmingC2N");
const farmingC2N = await FarmingC2N.attach("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");
```

SalesFactory -> C2NSale -> AllocationStating

### Proxy Upgrade

```shell
npx hardhat run deployment/UpgradePricefeedtracker.js --network sepolia 
npx hardhat console --network sepolia
```

```typescript
const PriceFeedTrackerV2 = await ethers.getContractFactory("PriceFeedTrackerV2");
const priceFeedTrackerV2 = await PriceFeedTrackerV2.attach('0x1218Cb33763401304790577AFDF12272F322B5eD')
(await priceFeedTrackerV2.retrievePrice())
```

### Tips

Add `allowBlocksWithSameTimestamp` in `hardhat.config.ts`, then `block.timestamp` won't change when new block mined.

```typescript
const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      allowBlocksWithSameTimestamp: true,
    },
  }
};
```

`block.timestamp` can be fully controlled by the following code

```typescript
import {
  time
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
await time.increaseTo(someTime);
```
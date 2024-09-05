import LPToken from "@/artifacts/contracts/C2NToken.sol/C2NToken.json";
import Airdrop from "@/artifacts/contracts/Airdrop.sol/Airdrop.json";
import FarmingC2N from "@/artifacts/contracts/farming/FarmingC2N.sol/FarmingC2N.json";

export const addresses = {
  "FarmingC2NModule#C2NToken": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "FarmingC2NModule#lpToken01": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  "FarmingC2NModule#lpToken02": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  "FarmingC2NModule#Airdrop": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  "FarmingC2NModule#FarmingC2N": "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
}

export const depositTokens: Record<string, any> = {
  [addresses["FarmingC2NModule#lpToken01"]]: LPToken,
  [addresses["FarmingC2NModule#lpToken02"]]: LPToken,
  [addresses["FarmingC2NModule#Airdrop"]]: Airdrop
};

export const farmContract = FarmingC2N;

export const farms: Record<number, any> = {
  31337: {
    chainId: 31337,
    earnedTokenAddress: addresses["FarmingC2NModule#C2NToken"],
    stakingAddress: addresses["FarmingC2NModule#FarmingC2N"],
    pools: [
      {
        poolId: 0,
        depositTokenAddress: addresses["FarmingC2NModule#lpToken01"],
        airdropAddress: addresses["FarmingC2NModule#Airdrop"],
        available: true,
        depositSymbol: "LP01",
        earnedSymbol: "C2N",
        title: "Local/C2N LP01",
        depositLogo:
          "https://bobabrewery.oss-ap-southeast-1.aliyuncs.com/bnb-logo.svg",
        earnedLogo:
          "https://bobabrewery.oss-ap-southeast-1.aliyuncs.com/Brewery32x32.png",
        getLptHref:
          "https://pancakeswap.finance/add/BNB/0x9eBBEB7f6b842377714EAdD987CaA4510205107A",
        aprRate: 3.15 / 20,
        aprUrl: "",
      },
      {
        poolId: 1,
        depositTokenAddress: addresses["FarmingC2NModule#lpToken02"],
        available: true,
        depositSymbol: "LP02",
        earnedSymbol: "C2N",
        title: "Local/C2N LP02",
        depositLogo:
          "https://bobabrewery.oss-ap-southeast-1.aliyuncs.com/bnb-logo.svg",
        earnedLogo:
          "https://bobabrewery.oss-ap-southeast-1.aliyuncs.com/Brewery32x32.png",
        getLptHref:
          "https://pancakeswap.finance/add/BNB/0x9eBBEB7f6b842377714EAdD987CaA4510205107A",
        aprRate: 3.15 / 20,
        aprUrl: "",
      }
    ],
  },
  11155111: {
    chainId: 11155111,
    earnedTokenAddress: "0x2Cfe540886864DF44D180D67fA7DEb1611AaAcDF",
    stakingAddress: "0x6C336a43bC47648Dac96b1419958B8a4e78E05C1",
    pools: [
      {
        poolId: 0,
        depositTokenAddress: "0x2Cfe540886864DF44D180D67fA7DEb1611AaAcDF",
        available: true,
        depositSymbol: "FC2N",
        earnedSymbol: "C2N",
        title: "Sepolia/C2N FC2N",
        depositLogo:
          "https://bobabrewery.oss-ap-southeast-1.aliyuncs.com/bnb-logo.svg",
        earnedLogo:
          "https://bobabrewery.oss-ap-southeast-1.aliyuncs.com/Brewery32x32.png",
        getLptHref:
          "https://pancakeswap.finance/add/BNB/0x9eBBEB7f6b842377714EAdD987CaA4510205107A",
        aprRate: 3.15 / 20,
        aprUrl: "",
      }
    ],
  },
};
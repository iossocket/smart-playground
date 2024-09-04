
// {
//   "chainId": "0x64",
//   "chainName": "Gnosis",
//   "rpcUrls": [
//     "https://rpc.gnosischain.com"
//   ],
//   "iconUrls": [
//     "https://xdaichain.com/fake/example/url/xdai.svg",
//     "https://xdaichain.com/fake/example/url/xdai.png"
//   ],
//   "nativeCurrency": {
//     "name": "XDAI",
//     "symbol": "XDAI",
//     "decimals": 18
//   },
//   "blockExplorerUrls": [
//     "https://blockscout.com/poa/xdai/"
//   ]
// }

import { addresses } from "./farms";

type NetworkConfiguration = {
  chainId: string,
  chainName: string,
  rpcUrls: string[],
  iconUrls: string[],
  nativeCurrency: {
    name: string,
    symbol: string,
    decimals: number,
  },
  blockExplorerUrls: string[]
}

export const VALID_CHAINS: NetworkConfiguration[] = [
  {
    chainName: "Sepolia test network",
    chainId: "0xAA36A7",
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    iconUrls: [],
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
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
  },
]

export const CURRENT_CHAIN = VALID_CHAINS[1];
export const AIRDROP_CONTRACT = addresses["FarmingC2NModule#Airdrop"];


export const TOKEN_ADDRESS_MAP = {
  11155111: addresses["FarmingC2NModule#C2NToken"], // 测试链sepolia
  31337: addresses["FarmingC2NModule#C2NToken"], // 本地链 填C2N-TOKEN的地址
}
export const TOKENS_INFO: Record<number, any> = {
  11155111: { chainId: 11155111, symbol: 'C2N', address: TOKEN_ADDRESS_MAP[11155111] },
  31337: { chainId: 31337, symbol: 'C2N', address: TOKEN_ADDRESS_MAP[31337] },
}
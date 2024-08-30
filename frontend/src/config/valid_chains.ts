
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
export const AIRDROP_CONTRACT = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"


export const TOKEN_ADDRESS_MAP = {
  11155111: "0x4E71E941878CE2afEB1039A0FE16f5eb557571C8", // 测试链sepolia
  31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // 本地链 填C2N-TOKEN的地址
}
export const TOKENS_INFO: Record<number, any> = {
  11155111: { chainId: 11155111, symbol: 'C2N', address: TOKEN_ADDRESS_MAP[11155111] },
  31337: { chainId: 31337, symbol: 'C2N', address: TOKEN_ADDRESS_MAP[31337] },
}


// AirdropModule#C2NToken - 0x5FbDB2315678afecb367f032d93F642f64180aa3
// AirdropModule#Airdrop - 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
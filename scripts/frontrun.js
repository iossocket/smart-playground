// provider.on("pending", listener)
// import { ethers, utils } from "ethers";
const { ethers, utils } = require("ethers");

function getSignature(fn) {
  return iface.getFunction("mint").selector
}

// 1. 创建provider
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')
let network = provider.getNetwork()
network.then(res => console.log(`[${(new Date).toLocaleTimeString()}] 连接到 chain ID ${res.chainId}`));

//2.构建contract实例
const contractABI = [
  "function mint() public",
  "function ownerOf(uint256) public view returns (address)",
  "function totalSupply() view returns (uint256)"
]

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const contractFM = new ethers.Contract(contractAddress, contractABI, provider);

const iface = new ethers.Interface(contractABI);


// Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
// Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
// 3. 创建钱包，用于发送抢跑交易
const privateKey = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
const wallet = new ethers.Wallet(privateKey, provider)

//5. 构建正常mint函数，检验mint结果，显示正常。
const normalTx = async () => {
  provider.on('pending', async (txHash) => {
    console.log("mint hash:", txHash);
    provider.getTransaction(txHash).then(
      async (tx) => {
        if (tx.data.indexOf(getSignature("mint")) !== -1) {
          console.log(`[${(new Date).toLocaleTimeString()}]监听到交易:${txHash}`)
          console.log(`铸造发起的地址是:${tx.from}`)//打印交易发起地址
          await tx.wait()
          const tokenId = await contractFM.totalSupply()
          console.log(`mint的NFT编号:${tokenId}`)
          console.log(`编号${tokenId}NFT的持有者是${await contractFM.ownerOf(tokenId)}`)//打印nft持有者地址
          console.log(`铸造发起的地址是不是对应NFT的持有者:${tx.from === await contractFM.ownerOf(tokenId)}`)//比较二者是否一致
        }
      }
    )
  })
}

normalTx();
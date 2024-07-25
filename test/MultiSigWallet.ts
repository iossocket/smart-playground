import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";

// 对要签名的参数进行编码
function getMessageBytes(contractAddr: string, to: string, amount: number, nonce: number) {
  // 对应solidity的Keccak256
  const messageHash = ethers.solidityPackedKeccak256(["address", "address", "uint256", "uint256"], [contractAddr, to, amount, nonce])
  console.log("Message Hash: ", messageHash)
  // 由于 ethers 库的要求，需要先对哈希值数组化
  const messageBytes = ethers.getBytes(messageHash)
  console.log("messageBytes: ", messageBytes)
  // 返回数组化的hash
  return messageBytes
}

async function getSignature(signer: HardhatEthersSigner, contractAddr: string, to: string, amount: number, nonce: number): Promise<string> {
  const messageBytes = getMessageBytes(contractAddr, to, amount, nonce)
  // 对数组化hash进行签名，自动添加"\x19Ethereum Signed Message:\n32"并进行签名
  const signature = await signer.signMessage(messageBytes)
  console.log("Signature: ", signature)
  return signature;
}

describe("MultiSigWallet", function () {
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [signer, account1, account2] = await ethers.getSigners();

    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = await MultiSigWallet.deploy([account1, account2]);

    await signer.sendTransaction({
      to: multiSigWallet,
      value: 10
    })
    return { multiSigWallet, signer, account1, account2 };
  }

  describe("Deployment", function () {
    it("should verify", async function () {
      const { multiSigWallet, account1, account2, signer: to } = await loadFixture(deployFixture);
      expect(await ethers.provider.getBalance(multiSigWallet)).to.be.equal(10);

      const contractAddr = await multiSigWallet.getAddress();
      const signature_1 = await getSignature(account1, contractAddr, to.address, 1, 0);
      const signature_2 = await getSignature(account2, contractAddr, to.address, 1, 0);

      await multiSigWallet.transfer(to.address, 1, 0, [signature_1, signature_2]);

      expect(await ethers.provider.getBalance(multiSigWallet)).to.be.equal(9);
    });
  });
});
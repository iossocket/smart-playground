import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

// 对要签名的参数进行编码
function getMessageBytes(account: string, tokenId: number) {
  // 对应solidity的Keccak256
  const messageHash = ethers.solidityPackedKeccak256(["address", "uint256"], [account, tokenId])
  console.log("Message Hash: ", messageHash)
  // 由于 ethers 库的要求，需要先对哈希值数组化
  const messageBytes = ethers.getBytes(messageHash)
  console.log("messageBytes: ", messageBytes)
  // 返回数组化的hash
  return messageBytes
}

async function getSignature(signer: HardhatEthersSigner, account: string, tokenId: number): Promise<string> {
  const messageBytes = getMessageBytes(account, tokenId)
  // 对数组化hash进行签名，自动添加"\x19Ethereum Signed Message:\n32"并进行签名
  const signature = await signer.signMessage(messageBytes)
  console.log("Signature: ", signature)
  return signature;
}

async function main() {
  const signers = await ethers.getSigners()
  // 我们将accounts[0]作为deployer和signer，account[1]、account[2]、account[3]作为白名单地址
  for (let index = 1; index < 4; index++) {
    await getSignature(signers[0], signers[index].address, index)
  }
}

describe("Sign", function () {
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [signer, account1, account2] = await ethers.getSigners();

    const SignatureNFT = await ethers.getContractFactory("SignatureNFT");
    const signatureNFT = await SignatureNFT.deploy(signer);

    return { signatureNFT, signer, account1, account2 };
  }

  describe("Deployment", function () {
    it("should verify", async function () {
      const { signatureNFT, signer, account1, account2 } = await loadFixture(deployFixture);
      const signature_1 = await getSignature(signer, account1.address, 1);
      const result_1 = await signatureNFT.verify(account1, 1, signature_1);

      const signature_2 = await getSignature(signer, account2.address, 2);
      const result_2 = await signatureNFT.verify(account2, 2, signature_2);

      expect(result_1).to.equal(true);
      expect(result_2).to.equal(true);
    });

    it("should mint", async function () {
      const { signatureNFT, signer, account1, account2 } = await loadFixture(deployFixture);
      const signature_2 = await getSignature(signer, account2.address, 2);
      await expect(signatureNFT.connect(account2).mintNftV2(2, signature_2)).not.to.be.revertedWithCustomError(
        signatureNFT, "SignatureNFT__VerifyFailed"
      );
      await expect(signatureNFT.connect(account1).mintNftV2(2, signature_2)).to.be.revertedWithCustomError(
        signatureNFT, "SignatureNFT__VerifyFailed"
      );
    });
  });
});
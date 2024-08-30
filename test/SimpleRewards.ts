import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";

const ONE_DAY = 24 * 60 * 60;
const ONE_WEEK_IN_SECS = 7 * ONE_DAY;

describe("SimpleRewards", function () {
  async function deploySimpleRewards() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const totalRewards = 7 * 24 * 60 * 60 * 100;

    const C2NToken = await hre.ethers.getContractFactory("C2NToken");
    const staking = await C2NToken.deploy("C2N", "C2N", 10000, 18);
    const reward = await C2NToken.deploy("C2N", "C2N", totalRewards, 18);

    const now = await time.latest();

    const start = now + ONE_WEEK_IN_SECS;
    const end = now + ONE_WEEK_IN_SECS * 2;

    const SimpleRewards = await hre.ethers.getContractFactory("SimpleRewards");
    const simpleRewards = await SimpleRewards.deploy(staking, reward, start, end, totalRewards);

    return { now, simpleRewards, start, owner, otherAccount, staking, reward };
  }

  it("should done", async function () {
    const { staking, simpleRewards, reward, otherAccount, start } = await loadFixture(deploySimpleRewards);

    await reward.mint(simpleRewards, 1000);
    await staking.mint(otherAccount, 1000);
    await staking.connect(otherAccount).approve(simpleRewards, 1000);

    // 86400 * 200 * 2 / 
    await time.increaseTo(start + ONE_DAY);
    await simpleRewards.connect(otherAccount).stake(200);
    await time.increaseTo(start + 2 * ONE_DAY);
    await simpleRewards.connect(otherAccount).stake(200);
    await time.increaseTo(start + 3 * ONE_DAY);
    await simpleRewards.connect(otherAccount).stake(200);
    await time.increaseTo(start + 4 * ONE_DAY);
    await simpleRewards.connect(otherAccount).stake(200);
    // await time.increaseTo(start + ONE_DAY * 2);
    // await simpleRewards.connect(otherAccount).stake(100);
    // await time.increaseTo(start + ONE_DAY * 3);
    // const res = await simpleRewards.connect(otherAccount).claim();
    // console.log(res);
  });
});
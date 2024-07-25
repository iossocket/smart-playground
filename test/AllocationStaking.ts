import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { AllocationStaking } from "../typechain-types";
// import "hardhat/console.sol";

describe("AllocationStaking", function () {
  async function deployFixture() {
    const ONE_MONTH_IN_SECS = 30 * 24 * 60 * 60;
    const startTime = (await time.latest()) + ONE_MONTH_IN_SECS;

    const [owner, account1, account2] = await hre.ethers.getSigners();

    const C2NToken = await hre.ethers.getContractFactory("C2NToken");
    const c2NToken = await C2NToken.deploy("C2N", "C2N", 10000, 18);

    const lpToken01 = await C2NToken.deploy("LP01", "LP01", 10000, 18);
    const lpToken02 = await C2NToken.deploy("LP02", "LP02", 10000, 18);

    const AllocationStaking = await hre.ethers.getContractFactory("AllocationStaking");
    const allocationStaking = await AllocationStaking.deploy(c2NToken, 10, startTime, "");

    return { allocationStaking, c2NToken, startTime, owner, account1, account2, lpToken01, lpToken02 };
  }

  async function printPoolInfo(poolIndex: number, allocationStaking: AllocationStaking, startTime: number) {
    const [accERC20PerShare, lastRewardTimestamp] = await allocationStaking.getPoolDetail(0);
    console.log(`pool${poolIndex} accERC20PerShare: ${accERC20PerShare}, lastRewardTimestamp: ${lastRewardTimestamp}, [${lastRewardTimestamp - BigInt(startTime)}]`);
  }

  describe("Deployment", function () {
    // it("Should deploy", async function () {
    //   const { allocationStaking, startTime } = await loadFixture(deployFixture);
    //   await time.increaseTo(startTime + 60);
    //   for (let i = 0; i < 1000; i++) {
    //     const now = await allocationStaking.currentTime();
    //     console.log(startTime, now, now - BigInt(startTime));
    //   }
    //   // expect(await allocationStaking.poolLength()).to.equal(0);
    // });

    it("Should success", async function () {
      const { allocationStaking, c2NToken, owner, account1, account2, startTime, lpToken01, lpToken02 } = await loadFixture(deployFixture);

      await c2NToken.mint(account1, 1000);
      await c2NToken.mint(account2, 1000);
      await c2NToken.connect(account1).approve(allocationStaking, 1000);
      await c2NToken.connect(account2).approve(allocationStaking, 1000);
      await allocationStaking.connect(account1).fund(1000);
      await allocationStaking.connect(account2).fund(1000);
      expect(await allocationStaking.totalRewards()).to.equal(2000);

      await lpToken01.mint(account1, 1000);
      await lpToken01.connect(account1).approve(allocationStaking, 1000);

      await allocationStaking.add(250, lpToken01, false);
      await allocationStaking.add(750, lpToken02, false);
      expect(await allocationStaking.poolLength()).to.equal(2);

      await time.increaseTo(startTime + 60);
      await allocationStaking.connect(account1).deposit(0, 100);
      await printPoolInfo(0, allocationStaking, startTime);

      await time.increaseTo(startTime + 120);
      await allocationStaking.connect(account1).deposit(0, 100);
      await printPoolInfo(0, allocationStaking, startTime);

      await time.increaseTo(startTime + 180);
      await allocationStaking.connect(account1).deposit(0, 100);
      await printPoolInfo(0, allocationStaking, startTime);

      // await time.increaseTo(startTime + 240);
      // await allocationStaking.connect(account1).deposit(0, 100);
      // await printPoolInfo(0, allocationStaking, startTime);
    });
  });
});
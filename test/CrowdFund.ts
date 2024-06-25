import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

const ONE_DAY_IN_SECS = 24 * 60 * 60;

describe("CrowdFund", () => {
  async function deployOneYearLockFixture() {
    const ONE_HUNDRED_ETH = "100000000000000000000";

    const [owner, otherAccount, secondAccount] = await hre.ethers.getSigners();

    const C2NToken = await hre.ethers.getContractFactory("C2NToken");
    const token = await C2NToken.deploy("C2N", "C2N", ONE_HUNDRED_ETH, 18);

    await token.mint(otherAccount, ONE_HUNDRED_ETH);
    await token.mint(secondAccount, ONE_HUNDRED_ETH);

    const CrowdFund = await hre.ethers.getContractFactory("CrowdFund");
    const fund = await CrowdFund.deploy(token.getAddress());

    await token.connect(otherAccount).approve(await fund.getAddress(), ONE_HUNDRED_ETH);
    await token.connect(secondAccount).approve(await fund.getAddress(), ONE_HUNDRED_ETH);

    return { token, fund, owner, otherAccount, secondAccount };
  }

  describe("Deployment", async function () {
    it("should deploy contract successfully", async () => {
      const { token, fund } = await loadFixture(deployOneYearLockFixture);
      expect(token).to.not.be.null;
      expect(fund).to.not.be.null;
    })
  });

  describe("Launch crowd fund", () => {
    it("should launch new crowd fund", async () => {
      const { fund, owner } = await loadFixture(deployOneYearLockFixture);
      const now = await time.latest();

      await expect(fund.launch("10000000000000000000", now + ONE_DAY_IN_SECS, now + ONE_DAY_IN_SECS * 10))
        .to.emit(fund, "Launch")
        .withArgs(1, owner, "10000000000000000000", anyValue, anyValue); // We accept any value as `when` arg
      expect(await fund.count()).to.equal(1);
    });

    it("should revert launch new crowd fund with start at < now", async () => {
      const { fund, owner } = await loadFixture(deployOneYearLockFixture);
      const now = await time.latest();
      await expect(fund.launch("10000000000000000000", now - ONE_DAY_IN_SECS, now + ONE_DAY_IN_SECS * 10)).to.be.revertedWith(
        "start at < now"
      );
    });

    it("should revert launch new crowd fund with start < end", async () => {
      const { fund, owner } = await loadFixture(deployOneYearLockFixture);
      const now = await time.latest();
      await expect(fund.launch("10000000000000000000", now + 1, now)).to.be.revertedWith(
        "start < end"
      );
    });

    it("should revert launch new crowd fund with max duration", async () => {
      const { fund, owner } = await loadFixture(deployOneYearLockFixture);
      const now = await time.latest();
      await expect(fund.launch("10000000000000000000", now + ONE_DAY_IN_SECS, now + ONE_DAY_IN_SECS * 91 + 1)).to.be.revertedWith(
        "max duration"
      );
    });
  });

  describe("pledge", () => {
    it("should pledge successfully", async () => {
      const { fund, otherAccount, token } = await loadFixture(deployOneYearLockFixture);
      await token.mint(otherAccount, "5000000000000000000");

      const now = await time.latest();
      await fund.launch("10000000000000000000", now + ONE_DAY_IN_SECS, now + ONE_DAY_IN_SECS * 10);
      await time.increaseTo(now + ONE_DAY_IN_SECS);

      await expect(fund.connect(otherAccount).pledge(1, "5000000000000000000")).to.emit(fund, "Pledge").withArgs(1, otherAccount, "5000000000000000000");
      expect(await token.balanceOf(await fund.getAddress())).to.equal("5000000000000000000");
    });
  });
});
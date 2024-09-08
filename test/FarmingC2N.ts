import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { network } from "hardhat";


const ONE_DAY_IN_SECS = 24 * 60 * 60;
const DECIMAL = 18;
const initToken = hre.ethers.parseUnits("10000", DECIMAL);

describe("FarmingC2N", function () {
  async function deployFixture() {
    // const startTime = (await time.latest()) + ONE_DAY_IN_SECS;
    const startTime = 1725206400;
    const [owner, account1, account2] = await hre.ethers.getSigners();

    const C2NToken = await hre.ethers.getContractFactory("C2NToken");
    const c2NToken = await C2NToken.deploy("C2N", "C2N", hre.ethers.parseUnits("10000", DECIMAL), DECIMAL);
    const lpToken01 = await C2NToken.deploy("LP01", "LP01", hre.ethers.parseUnits("10000", DECIMAL), DECIMAL);
    const lpToken02 = await C2NToken.deploy("LP02", "LP02", hre.ethers.parseUnits("10000", DECIMAL), DECIMAL);

    const FarmingC2N = await hre.ethers.getContractFactory("FarmingC2N");
    const farmingC2N = await FarmingC2N.deploy(c2NToken, 10, startTime);

    return { farmingC2N, c2NToken, startTime, owner, account1, account2, lpToken01, lpToken02 };
  }

  xit("Should extend end time successfully", async function () {
    const { farmingC2N, c2NToken, owner, startTime } = await loadFixture(deployFixture);
    await c2NToken.mint(owner, initToken);
    await c2NToken.connect(owner).approve(farmingC2N, initToken);
    // add rewards & extend end time
    await farmingC2N.connect(owner).fund(hre.ethers.parseUnits("50", DECIMAL));
    // 50 * 10^18 / 1 * 10^5 = 50 * 10^13
    expect(Number(await farmingC2N.endTimestamp()) - startTime).to.equals(5000000000000000000)
  });

  xit("Should add one pool successfully", async function () {
    const { farmingC2N, lpToken01 } = await loadFixture(deployFixture);
    await farmingC2N.add(250, lpToken01, true);
    expect(await farmingC2N.poolLength()).to.equal(1)
  });

  xit("Should deposit successfully", async function () {
    const { farmingC2N, c2NToken, owner, account1, startTime, lpToken01 } = await loadFixture(deployFixture);
    await c2NToken.mint(owner, initToken);
    await c2NToken.connect(owner).approve(farmingC2N, initToken);

    // extend end time
    await farmingC2N.connect(owner).fund(hre.ethers.parseUnits("50", DECIMAL));
    await time.increaseTo(startTime + 10);
    await farmingC2N.add(250, lpToken01, true);

    await lpToken01.mint(account1, initToken);
    await lpToken01.connect(account1).approve(farmingC2N, initToken);
    await farmingC2N.connect(account1).deposit(0, hre.ethers.parseUnits("10", DECIMAL));

    expect(await farmingC2N.deposited(0, account1)).to.equal(hre.ethers.parseUnits("10", DECIMAL));
  });

  xit("should get pending correctly", async function () {
    const { farmingC2N, c2NToken, owner, account1, startTime, lpToken01 } = await loadFixture(deployFixture);
    await c2NToken.mint(owner, initToken);
    await c2NToken.connect(owner).approve(farmingC2N, initToken);

    await farmingC2N.connect(owner).fund(hre.ethers.parseUnits("50", DECIMAL));
    await farmingC2N.add(250, lpToken01, true);

    await lpToken01.mint(account1, initToken);
    await lpToken01.connect(account1).approve(farmingC2N, initToken);

    await time.increaseTo(startTime + 10 * ONE_DAY_IN_SECS);
    await farmingC2N.connect(account1).deposit(0, hre.ethers.parseUnits("1", DECIMAL));

    await time.increaseTo(startTime + 11 * ONE_DAY_IN_SECS);
    const pending = await farmingC2N.pending(0, account1)
    expect(pending).to.equal(100);
  });

  it("should get pending", async function () {

    const { farmingC2N, c2NToken, owner, account1, startTime, lpToken01 } = await loadFixture(deployFixture);
    await c2NToken.mint(owner, initToken);
    await c2NToken.connect(owner).approve(farmingC2N, initToken);

    // 10000000000000000000n
    await farmingC2N.connect(owner).fund(hre.ethers.parseUnits("10", DECIMAL));
    console.log("do add pool")
    await time.increaseTo(startTime + 10 * ONE_DAY_IN_SECS);
    await farmingC2N.add(250, lpToken01, true);

    await lpToken01.mint(account1, initToken);
    await lpToken01.connect(account1).approve(farmingC2N, initToken);

    // 10000000000000000000n
    // start 1725206400
    //       1725543529
    await time.increaseTo(startTime + 10 * ONE_DAY_IN_SECS);
    console.log("do deposit")
    await farmingC2N.connect(account1).deposit(0, hre.ethers.parseUnits("10", DECIMAL));

    await time.increaseTo(startTime + 11 * ONE_DAY_IN_SECS);
    console.log("do pending")
    console.log(await farmingC2N.poolInfo(0), await farmingC2N.userInfo(0, account1));
    const pending = await farmingC2N.pending(0, account1)
    expect(pending).to.equal(864000);
  });

  xit("Should claim successfully", async function () {
    const { farmingC2N, c2NToken, owner, account1, startTime, lpToken01 } = await loadFixture(deployFixture);
    await c2NToken.mint(owner, initToken);
    await c2NToken.connect(owner).approve(farmingC2N, initToken);

    // extend end time
    await farmingC2N.connect(owner).fund(hre.ethers.parseUnits("50", DECIMAL));

    await time.increaseTo(startTime + 10);
    await farmingC2N.add(250, lpToken01, true);

    await lpToken01.mint(account1, initToken);
    await lpToken01.connect(account1).approve(farmingC2N, initToken);
    await farmingC2N.connect(account1).deposit(0, hre.ethers.parseUnits("10", DECIMAL));

    await time.increaseTo(startTime + 10 + 1000);

    await expect(farmingC2N.connect(account1).claim(0))
      .to.emit(farmingC2N, "Claim")
      .withArgs(account1, 0, 10000);
    expect(await c2NToken.balanceOf(account1)).to.equal(10000);
  });
});
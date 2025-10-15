const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const factoryAddress = "0xA3a5A8c4061f3B10B275DF98A59f88Fd19Ea1b3B";

  const [signer] = await ethers.getSigners();
  const resolver = await signer.getAddress();
  console.log("Creating test market from resolver:", resolver);

  // Set deadline to 10 seconds from now for immediate testing
  const deadline = Math.floor(Date.now() / 1000) + 10; // 10 seconds from now
  console.log("Deadline set to:", new Date(deadline * 1000).toISOString());

  const maxPerWallet = ethers.parseEther("0.1"); // 0.1 BNB cap
  const feeBps = 0;

  const usd8 = (s) => ethers.parseUnits(s, 8);

  const tokenAddr = "0x0A43fC31a73013089DF59194872Ecae4cAe14444";
  const title = "TEST: Will token hit $10M mcap in 1 hour?";
  const dataSource = `https://dexscreener.com/bsc/token/${tokenAddr}`;
  const target = usd8("10000000"); // $10M

  const factory = await ethers.getContractAt("MarketFactory", factoryAddress);

  const tx = await factory.createMarket(
    resolver,
    deadline,
    maxPerWallet,
    feeBps,
    title,
    dataSource,
    target
  );
  const rc = await tx.wait();
  const ev = rc.logs.find(log => {
    try {
      const parsed = factory.interface.parseLog(log);
      return parsed && parsed.name === "MarketCreated";
    } catch (e) {
      return false;
    }
  });
  const parsedEv = factory.interface.parseLog(ev);
  const marketAddr = parsedEv.args.market;

  console.log("\n✅ Test market created at:", marketAddr);
  console.log("Title:", title);
  console.log("You can resolve this market after:", new Date(deadline * 1000).toISOString());
}

main().catch((e) => { console.error(e); process.exit(1); });


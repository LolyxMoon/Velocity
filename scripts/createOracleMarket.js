const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const factoryAddress = "0xA3a5A8c4061f3B10B275DF98A59f88Fd19Ea1b3B";
  const tellorResolverAddress = "0x162454933bD7a8f4e8186a8e34a2e2A333CdBb51";

  console.log("Creating oracle-powered market...");
  console.log("Resolver:", tellorResolverAddress);

  // Set deadline to 30 seconds from now for quick testing
  const deadline = Math.floor(Date.now() / 1000) + 30;
  console.log("Deadline:", new Date(deadline * 1000).toISOString());

  const maxPerWallet = ethers.parseEther("0.1");
  const feeBps = 0;

  const usd8 = (s) => ethers.parseUnits(s, 8);

  const tokenAddr = "0x0A43fC31a73013089DF59194872Ecae4cAe14444";
  const title = "ORACLE TEST: Will token hit $50M mcap?";
  const dataSource = `https://dexscreener.com/bsc/token/${tokenAddr}`;
  const target = usd8("50000000"); // $50M

  const factory = await ethers.getContractAt("MarketFactory", factoryAddress);

  const tx = await factory.createMarket(
    tellorResolverAddress,  // Use TellorResolver as resolver
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

  console.log("\n✅ Oracle-powered market created at:", marketAddr);
  console.log("Title:", title);
  console.log("Target market cap: $50,000,000");
  console.log("Deadline:", new Date(deadline * 1000).toISOString());
  console.log("\nNext steps:");
  console.log("1. Submit oracle data to TellorPlayground");
  console.log("2. Wait for deadline to pass");
  console.log("3. Call resolveMarket() on TellorResolver");
}

main().catch((e) => { console.error(e); process.exit(1); });


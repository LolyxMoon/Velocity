const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // 👇 paste your factory address from the previous step
  const factoryAddress = "0xA3a5A8c4061f3B10B275DF98A59f88Fd19Ea1b3B";

  // Use your current signer as resolver for MVP
  const [signer] = await ethers.getSigners();
  const resolver = await signer.getAddress();
  console.log("Creating markets from resolver:", resolver);

  // Deadline: Oct 30, 2025 23:59:59 UTC
  const deadline = Math.floor(new Date("2025-10-30T23:59:59Z").getTime() / 1000);

  const maxPerWallet = ethers.parseEther("0.1"); // 0.1 BNB cap
  const feeBps = 0; // keep 0 for MVP

  // Helper for USD with 8 decimals (pass STRINGs to avoid JS precision issues)
  const usd8 = (s) => ethers.parseUnits(s, 8);

  // --- Market A ---
  // Will 0x0A43fC31a73013089DF59194872Ecae4cAe14444 hit $444M mcap before Oct 30?
  const tokenA = "0x0A43fC31a73013089DF59194872Ecae4cAe14444";
  const titleA = "Will 0x0A43fC31a73013089DF59194872Ecae4cAe14444 hit $444M mcap before Oct 30?";
  const dsA = `https://dexscreener.com/bsc/token/${tokenA}`;
  const targetA = usd8("444000000"); // $444,000,000

  // --- Market B ---
  // Will 0x82Ec31D69b3c289E541b50E30681FD1ACAd24444 reach $100M mcap before Oct 30?
  const tokenB = "0x82Ec31D69b3c289E541b50E30681FD1ACAd24444";
  const titleB = "Will 0x82Ec31D69b3c289E541b50E30681FD1ACAd24444 reach $100M mcap before Oct 30?";
  const dsB = `https://dexscreener.com/bsc/token/${tokenB}`;
  const targetB = usd8("100000000"); // $100,000,000

  const factory = await ethers.getContractAt("MarketFactory", factoryAddress);

  // Create Market A
  const tx1 = await factory.createMarket(
    resolver,        // resolver address
    deadline,        // cutoff for betting
    maxPerWallet,    // 0.1 BNB cap
    feeBps,          // 0 for now
    titleA,          // tokenName field used as question/title
    dsA,             // data source URL
    targetA          // target MCAP (8 decimals)
  );
  const rc1 = await tx1.wait();
  const ev1 = rc1.logs.find(log => {
    try {
      const parsed = factory.interface.parseLog(log);
      return parsed && parsed.name === "MarketCreated";
    } catch (e) {
      return false;
    }
  });
  const parsedEv1 = factory.interface.parseLog(ev1);
  const marketA = parsedEv1.args.market;
  console.log("Market A deployed at:", marketA);

  // Create Market B
  const tx2 = await factory.createMarket(
    resolver,
    deadline,
    maxPerWallet,
    feeBps,
    titleB,
    dsB,
    targetB
  );
  const rc2 = await tx2.wait();
  const ev2 = rc2.logs.find(log => {
    try {
      const parsed = factory.interface.parseLog(log);
      return parsed && parsed.name === "MarketCreated";
    } catch (e) {
      return false;
    }
  });
  const parsedEv2 = factory.interface.parseLog(ev2);
  const marketB = parsedEv2.args.market;
  console.log("Market B deployed at:", marketB);

  console.log("\nSave these addresses:");
  console.log(" - Market A:", marketA, "=>", titleA);
  console.log(" - Market B:", marketB, "=>", titleB);
}

main().catch((e) => { console.error(e); process.exit(1); });


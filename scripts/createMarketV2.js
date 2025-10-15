const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // Update this with your deployed FactoryV2 address
  const factoryV2Address = "0x405a9f5835D881e15cbc135E7b874698Fd201814";

  const [signer] = await ethers.getSigners();
  const resolver = await signer.getAddress();
  
  console.log("Creating oracle-integrated market (V2)...");
  console.log("Resolver (fallback):", resolver);

  // Short deadline for testing (30 seconds)
  const deadline = Math.floor(Date.now() / 1000) + 30;
  console.log("Deadline:", new Date(deadline * 1000).toISOString());

  const maxPerWallet = ethers.parseEther("0.1");
  const feeBps = 0;

  const usd8 = (s) => ethers.parseUnits(s, 8);

  const tokenAddr = "0x0A43fC31a73013089DF59194872Ecae4cAe14444";
  const title = "V2 TEST: Will token hit $50M mcap?";
  const dataSource = `https://dexscreener.com/bsc/token/${tokenAddr}`;
  const target = usd8("50000000"); // $50M

  // Generate queryId
  const queryData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["string", "address"],
    ["TokenMarketCap", tokenAddr]
  );
  const queryId = ethers.keccak256(queryData);

  console.log("QueryId:", queryId);

  const factory = await ethers.getContractAt("MarketFactoryV2", factoryV2Address);

  const tx = await factory.createMarket(
    resolver,
    deadline,
    maxPerWallet,
    feeBps,
    title,
    dataSource,
    target,
    queryId
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

  console.log("\n✅ Oracle-integrated market (V2) created at:", marketAddr);
  console.log("Title:", title);
  console.log("Target: $50,000,000");
  console.log("Deadline:", new Date(deadline * 1000).toISOString());
  console.log("\n📊 Market Features:");
  console.log("  • Built-in oracle resolution (call resolveFromTellor())");
  console.log("  • Preview resolution before executing");
  console.log("  • Check oracle data anytime");
  console.log("  • Fallback manual resolution available");
  console.log("\n🔧 Next Steps:");
  console.log("1. Submit oracle data:");
  console.log("   npx hardhat run scripts/submitOracleData.js --network bsctest");
  console.log("2. Wait for deadline (30 seconds)");
  console.log("3. Resolve market:");
  console.log(`   npx hardhat run scripts/resolveMarketV2.js --network bsctest ${marketAddr}`);
  
  return marketAddr;
}

main().catch((e) => { console.error(e); process.exit(1); });


const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const tellorResolverAddress = "0x162454933bD7a8f4e8186a8e34a2e2A333CdBb51";
  const marketAddress = process.argv[2] || "YOUR_MARKET_ADDRESS_HERE";
  
  if (marketAddress === "YOUR_MARKET_ADDRESS_HERE") {
    console.log("Usage: npx hardhat run scripts/resolveOracleMarket.js --network bsctest <marketAddress>");
    process.exit(1);
  }
  
  // Create queryId (same as in submitOracleData.js)
  const tokenAddr = "0x0A43fC31a73013089DF59194872Ecae4cAe14444";
  const queryData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["string", "address"],
    ["TokenMarketCap", tokenAddr]
  );
  const queryId = ethers.keccak256(queryData);
  
  console.log("Attempting to resolve market with Tellor oracle...");
  console.log("Market:", marketAddress);
  console.log("QueryId:", queryId);
  
  const resolver = await ethers.getContractAt("TellorResolver", tellorResolverAddress);
  
  // Check if market can be resolved
  const canResolve = await resolver.canResolve(marketAddress);
  console.log("Can resolve:", canResolve);
  
  if (!canResolve) {
    console.log("\n⚠️  Market cannot be resolved yet. Possible reasons:");
    console.log("- Deadline hasn't passed");
    console.log("- Buffer period (1 hour) not elapsed");
    console.log("- Market already resolved");
    console.log("- Wrong resolver");
    process.exit(0);
  }
  
  // Preview what the resolution will be
  const market = await ethers.getContractAt("BinaryMarket", marketAddress);
  const deadline = await market.deadline();
  const targetMcap = await market.targetMcapUsd();
  
  const [outcome, mcapValue, timestamp] = await resolver.previewResolution(
    queryId,
    deadline,
    targetMcap
  );
  
  console.log("\n📊 Preview Resolution:");
  console.log("Oracle Market Cap:", ethers.formatUnits(mcapValue, 8), "USD");
  console.log("Target Market Cap:", ethers.formatUnits(targetMcap, 8), "USD");
  console.log("Outcome will be:", outcome ? "YES (target reached)" : "NO (target not reached)");
  console.log("Oracle data timestamp:", new Date(Number(timestamp) * 1000).toISOString());
  
  // Resolve the market
  console.log("\n⏳ Resolving market...");
  const tx = await resolver.resolveMarket(marketAddress, queryId);
  await tx.wait();
  
  console.log("✅ Market resolved successfully!");
  console.log("Final outcome:", outcome ? "YES" : "NO");
}

main().catch((e) => { console.error(e); process.exit(1); });


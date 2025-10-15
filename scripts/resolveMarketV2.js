const hre = require("hardhat");
const { ethers} = hre;

async function main() {
  const marketAddress = process.argv[2] || "MARKET_ADDRESS_HERE";
  
  if (marketAddress === "MARKET_ADDRESS_HERE") {
    console.log("Usage: npx hardhat run scripts/resolveMarketV2.js --network bsctest <marketAddress>");
    process.exit(1);
  }
  
  console.log("Resolving market (V2) with built-in oracle...");
  console.log("Market:", marketAddress);
  
  const market = await ethers.getContractAt("BinaryMarketV2", marketAddress);
  
  // Check if market can be resolved
  const canResolve = await market.canResolveFromOracle();
  console.log("Can resolve from oracle:", canResolve);
  
  if (!canResolve) {
    console.log("\n⚠️  Market cannot be resolved yet. Checking reasons...");
    
    const state = await market.state();
    const deadline = await market.deadline();
    const now = Math.floor(Date.now() / 1000);
    
    console.log("State:", state === 0 ? "Open" : state === 1 ? "Resolved" : "Cancelled");
    console.log("Current time:", new Date(now * 1000).toISOString());
    console.log("Deadline:", new Date(Number(deadline) * 1000).toISOString());
    console.log("Time until deadline:", Math.max(0, Number(deadline) - now), "seconds");
    
    const bufferEnd = Number(deadline) + 3600; // 1 hour
    console.log("Buffer ends:", new Date(bufferEnd * 1000).toISOString());
    console.log("Time until buffer ends:", Math.max(0, bufferEnd - now), "seconds");
    
    process.exit(0);
  }
  
  // Preview resolution
  console.log("\n📊 Previewing resolution...");
  const [outcome, mcapValue, timestamp] = await market.previewOracleResolution();
  const targetMcap = await market.targetMcapUsd();
  
  console.log("Oracle Market Cap:", ethers.formatUnits(mcapValue, 8), "USD");
  console.log("Target Market Cap:", ethers.formatUnits(targetMcap, 8), "USD");
  console.log("Outcome:", outcome ? "YES (target reached ✅)" : "NO (target not reached ❌)");
  console.log("Oracle data timestamp:", new Date(Number(timestamp) * 1000).toISOString());
  
  // Resolve the market
  console.log("\n⏳ Resolving market via built-in oracle...");
  const tx = await market.resolveFromTellor();
  const receipt = await tx.wait();
  
  // Find Resolved event
  const resolvedEvent = receipt.logs.find(log => {
    try {
      const parsed = market.interface.parseLog(log);
      return parsed && parsed.name === "Resolved";
    } catch (e) {
      return false;
    }
  });
  
  if (resolvedEvent) {
    const parsed = market.interface.parseLog(resolvedEvent);
    const finalOutcome = parsed.args.outcome;
    const fromOracle = parsed.args.fromOracle;
    const mcap = parsed.args.mcapValue;
    
    console.log("\n✅ Market resolved successfully!");
    console.log("Final Outcome:", finalOutcome === 1 ? "YES" : "NO");
    console.log("Resolved via Oracle:", fromOracle);
    console.log("Market Cap Value:", ethers.formatUnits(mcap, 8), "USD");
  } else {
    console.log("\n✅ Market resolved!");
  }
  
  console.log("\nTransaction hash:", receipt.hash);
  console.log("Gas used:", receipt.gasUsed.toString());
}

main().catch((e) => { console.error(e); process.exit(1); });


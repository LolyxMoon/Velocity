const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const marketAddress = "0x99991c4a14e1EBDBDdcd7bfb571542D43F355634";
  
  console.log("Previewing V2 Market...");
  console.log("Market:", marketAddress);
  
  const market = await ethers.getContractAt("BinaryMarketV2", marketAddress);
  
  // Get market info
  const state = await market.state();
  const deadline = await market.deadline();
  const targetMcap = await market.targetMcapUsd();
  const queryId = await market.queryId();
  const tokenName = await market.tokenName();
  
  const now = Math.floor(Date.now() / 1000);
  
  console.log("\n📊 Market Info:");
  console.log("Title:", tokenName);
  const stateMap = ["Open", "Resolved", "Cancelled"];
  console.log("State:", stateMap[Number(state)] || "Unknown");
  console.log("Target Market Cap:", ethers.formatUnits(targetMcap, 8), "USD");
  console.log("QueryId:", queryId);
  console.log("Deadline:", new Date(Number(deadline) * 1000).toISOString());
  console.log("Current time:", new Date(now * 1000).toISOString());
  
  if (now < Number(deadline)) {
    console.log("⏰ Time until deadline:", Number(deadline) - now, "seconds");
  } else {
    const bufferEnd = Number(deadline) + 3600;
    console.log("✅ Deadline passed");
    console.log("⏰ Time until buffer ends:", Math.max(0, bufferEnd - now), "seconds");
  }
  
  // Get pools
  const yesPool = await market.yesPool();
  const noPool = await market.noPool();
  console.log("\n💰 Pools:");
  console.log("YES:", ethers.formatEther(yesPool), "BNB");
  console.log("NO:", ethers.formatEther(noPool), "BNB");
  
  // Get odds
  const [pYes, pNo] = await market.viewOdds();
  console.log("\n📈 Odds:");
  console.log("YES:", (Number(pYes) / 100).toFixed(2), "%");
  console.log("NO:", (Number(pNo) / 100).toFixed(2), "%");
  
  // Check if can resolve
  const canResolve = await market.canResolveFromOracle();
  console.log("\n🔮 Oracle Resolution:");
  console.log("Can resolve now:", canResolve);
  
  // Get current oracle data
  try {
    const [currentMcap, timestamp] = await market.getCurrentOracleData();
    if (timestamp > 0) {
      console.log("Current Oracle Market Cap:", ethers.formatUnits(currentMcap, 8), "USD");
      console.log("Oracle data timestamp:", new Date(Number(timestamp) * 1000).toISOString());
    } else {
      console.log("No oracle data available yet");
    }
  } catch (e) {
    console.log("Could not fetch current oracle data");
  }
  
  // Preview resolution if deadline passed
  if (now >= Number(deadline)) {
    try {
      const [outcome, mcapValue, timestamp] = await market.previewOracleResolution();
      if (timestamp > 0) {
        console.log("\n✨ Resolution Preview:");
        console.log("Oracle Market Cap at deadline:", ethers.formatUnits(mcapValue, 8), "USD");
        console.log("Target:", ethers.formatUnits(targetMcap, 8), "USD");
        console.log("Predicted Outcome:", outcome ? "YES ✅ (target reached)" : "NO ❌ (target not reached)");
        console.log("Data timestamp:", new Date(Number(timestamp) * 1000).toISOString());
      }
    } catch (e) {
      console.log("\nCould not preview resolution:", e.message);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


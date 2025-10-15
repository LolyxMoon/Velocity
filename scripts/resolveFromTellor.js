const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // V2 market with built-in oracle resolution
  const market = "0x99991c4a14e1EBDBDdcd7bfb571542D43F355634"; 

  const m = await ethers.getContractAt("BinaryMarketV2", market);
  console.log("Resolving from Tellor for:", market);

  // Check if can resolve
  const canResolve = await m.canResolveFromOracle();
  console.log("Can resolve:", canResolve);
  
  if (!canResolve) {
    console.log("⚠️  Market not ready to resolve yet. Check:");
    console.log("  - Deadline passed?");
    console.log("  - Buffer period (1 hour) elapsed?");
    console.log("  - Oracle data available?");
    
    const state = await m.state();
    const deadline = await m.deadline();
    const now = Math.floor(Date.now() / 1000);
    
    console.log("\nStatus:");
    console.log("  State:", state === 0n ? "Open" : state === 1n ? "Resolved" : "Cancelled");
    console.log("  Deadline:", new Date(Number(deadline) * 1000).toISOString());
    console.log("  Current time:", new Date(now * 1000).toISOString());
    console.log("  Buffer ends:", new Date((Number(deadline) + 3600) * 1000).toISOString());
    
    process.exit(0);
  }

  // Preview before resolving
  const [outcome, mcapValue, timestamp] = await m.previewOracleResolution();
  const targetMcap = await m.targetMcapUsd();
  
  console.log("\n📊 Resolution Preview:");
  console.log("  Oracle Market Cap:", ethers.formatUnits(mcapValue, 8), "USD");
  console.log("  Target:", ethers.formatUnits(targetMcap, 8), "USD");
  console.log("  Will resolve to:", outcome ? "YES ✅" : "NO ❌");
  
  // Resolve via Tellor oracle
  console.log("\n⏳ Calling resolveFromTellor()...");
  const tx = await m.resolveFromTellor();   // pulls the oracle's value and finalizes YES/NO
  const rc = await tx.wait();

  console.log("\n✅ Resolved via Tellor!");
  console.log("Transaction hash:", rc.hash);
  console.log("Gas used:", rc.gasUsed.toString());
  console.log("Final outcome:", outcome ? "YES" : "NO");
}

main().catch((e) => { console.error(e); process.exit(1); });


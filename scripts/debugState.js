const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const marketAddr = "0x99991c4a14e1EBDBDdcd7bfb571542D43F355634";
  const market = await ethers.getContractAt("BinaryMarketV2", marketAddr);
  
  const state = await market.state();
  const factory = await market.factory();
  const resolver = await market.resolver();
  const deadline = await market.deadline();
  
  console.log("Market:", marketAddr);
  console.log("State (raw):", state);
  console.log("State (number):", Number(state));
  console.log("Factory:", factory);
  console.log("Resolver:", resolver);
  console.log("Deadline:", deadline);
  
  // 0 = Open, 1 = Resolved, 2 = Cancelled
  const stateMap = ["Open", "Resolved", "Cancelled"];
  console.log("State (decoded):", stateMap[Number(state)] || "Unknown");
}

main().catch(e => { console.error(e); process.exit(1); });


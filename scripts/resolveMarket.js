const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const market = "0x2e8079FA54C38bF286D38f4413ac343b7E7E3465"; // Test Market
  const m = await ethers.getContractAt("BinaryMarket", market);

  // Simulate that the outcome is YES
  const tx = await m.resolve(true);
  await tx.wait();

  console.log("✅ Market resolved to YES (simulated resolution)");
}

main().catch(e => { console.error(e); process.exit(1); });


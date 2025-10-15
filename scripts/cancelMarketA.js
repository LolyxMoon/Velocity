const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const market = "0x5173680ab1aC105bF07061FB302570d42D8338A0"; // Market A
  const m = await ethers.getContractAt("BinaryMarket", market);
  const tx = await m.cancel();        // resolver can cancel anytime
  await tx.wait();
  console.log("✅ Market A cancelled");
}
main().catch(e => { console.error(e); process.exit(1); });


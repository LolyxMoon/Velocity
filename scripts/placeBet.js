const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const market = "0x5173680ab1aC105bF07061FB302570d42D8338A0"; // Market A
  const contract = await ethers.getContractAt("BinaryMarket", market);

  // bet YES for 0.05 BNB
  const tx = await contract.bet(true, { value: ethers.parseEther("0.05") });
  await tx.wait();

  console.log("✅ Placed 0.05 BNB bet on YES for Market A");
}

main().catch(e => { console.error(e); process.exit(1); });


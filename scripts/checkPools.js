const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const marketA = "0x5173680ab1aC105bF07061FB302570d42D8338A0"; // your Market A
  const marketB = "0x097c65F0f40b89feAb37e52B080eF18ceA92e5Ad"; // your Market B

  const a = await ethers.getContractAt("BinaryMarket", marketA);
  const b = await ethers.getContractAt("BinaryMarket", marketB);

  const [yesA, noA] = await Promise.all([a.yesPool(), a.noPool()]);
  const [yesB, noB] = await Promise.all([b.yesPool(), b.noPool()]);

  console.log("Market A pool: YES =", ethers.formatEther(yesA), "BNB | NO =", ethers.formatEther(noA), "BNB");
  console.log("Market B pool: YES =", ethers.formatEther(yesB), "BNB | NO =", ethers.formatEther(noB), "BNB");
}

main().catch(e => { console.error(e); process.exit(1); });


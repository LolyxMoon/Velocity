const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const market = "0x5173680ab1aC105bF07061FB302570d42D8338A0"; // Market A
  const m = await ethers.getContractAt("BinaryMarket", market);
  
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();
  
  console.log("Claiming refund from cancelled Market A");
  console.log("Claimer:", address);
  
  // Check stakes
  const yesStake = await m.yesStake(address);
  const noStake = await m.noStake(address);
  
  console.log("\n💰 Your Stakes:");
  console.log("  YES:", ethers.formatEther(yesStake), "BNB");
  console.log("  NO:", ethers.formatEther(noStake), "BNB");
  
  const totalRefund = yesStake + noStake;
  console.log("  Total refund:", ethers.formatEther(totalRefund), "BNB");
  
  if (totalRefund === 0n) {
    console.log("\n❌ No stakes to refund");
    return;
  }
  
  // Get balance before
  const balanceBefore = await ethers.provider.getBalance(address);
  
  console.log("\n⏳ Calling claim()...");
  const tx = await m.claim();
  const receipt = await tx.wait();
  
  // Get balance after
  const balanceAfter = await ethers.provider.getBalance(address);
  const netReceived = balanceAfter - balanceBefore + (receipt.gasUsed * receipt.gasPrice);
  
  console.log("\n✅ Refund claimed!");
  console.log("Transaction:", receipt.hash);
  console.log("Gas used:", receipt.gasUsed.toString());
  console.log("Net received:", ethers.formatEther(netReceived), "BNB");
}

main().catch(e => { console.error(e); process.exit(1); });


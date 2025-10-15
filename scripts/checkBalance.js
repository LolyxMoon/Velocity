const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("🔍 Checking your BSC Mainnet balance...\n");
  console.log("Network:", hre.network.name);
  
  const [deployer] = await ethers.getSigners();
  const address = deployer.address;
  const balance = await ethers.provider.getBalance(address);
  const balanceBNB = ethers.formatEther(balance);

  console.log("\n📍 Your Wallet Address:", address);
  console.log("💰 Balance:", balanceBNB, "BNB");
  console.log("");

  // Check if enough for deployment
  const requiredBNB = 0.5;
  if (parseFloat(balanceBNB) >= requiredBNB) {
    console.log("✅ You have enough BNB for deployment!");
    console.log(`   Required: ~${requiredBNB} BNB`);
    console.log(`   You have: ${balanceBNB} BNB`);
  } else {
    console.log("❌ WARNING: You might not have enough BNB!");
    console.log(`   Required: ~${requiredBNB} BNB`);
    console.log(`   You have: ${balanceBNB} BNB`);
    console.log(`   You need: ${(requiredBNB - parseFloat(balanceBNB)).toFixed(4)} more BNB`);
  }

  console.log("\n💡 If you need more BNB:");
  console.log("   1. Buy on Binance/any exchange");
  console.log("   2. Withdraw to:", address);
  console.log("   3. Network: BNB Smart Chain (BSC)");
  console.log("   4. Wait for confirmation (~3 minutes)");
  console.log("   5. Run this script again to check");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


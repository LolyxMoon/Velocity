const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("🚀 Deploying to BSC MAINNET...");
  console.log("Network:", hre.network.name);
  
  if (hre.network.name !== "bsc") {
    console.log("⚠️  WARNING: You are not on BSC mainnet!");
    console.log("Current network:", hre.network.name);
    console.log("To deploy to mainnet, use: --network bsc");
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("\n📍 Deployer address:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "BNB");

  if (balance < ethers.parseEther("0.1")) {
    console.log("⚠️  WARNING: Low BNB balance! You need at least 0.1 BNB for deployment.");
  }

  console.log("\n⏳ Step 1: Using Real Tellor Oracle on BSC Mainnet...");
  
  // Real Tellor Oracle address on BSC Mainnet
  const tellorAddress = "0xD9157453E2668B2fc45b7A803D3FEF3642430cC0";

  console.log("✅ Using Real Tellor Oracle:", tellorAddress);
  console.log("   This is the official Tellor oracle with real data reporters!");

  console.log("\n⏳ Step 2: Deploying MarketFactoryV2...");
  
  const MarketFactoryV2 = await ethers.getContractFactory("MarketFactoryV2");
  const factory = await MarketFactoryV2.deploy(tellorAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log("✅ MarketFactoryV2 deployed:", factoryAddress);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 MAINNET DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  
  console.log("\n📦 Deployed Contracts:");
  console.log("  Real Tellor Oracle (official):", tellorAddress);
  console.log("  MarketFactoryV2:", factoryAddress);
  
  console.log("\n🔗 BSCScan Links:");
  console.log("  Tellor Oracle:", `https://bscscan.com/address/${tellorAddress}`);
  console.log("  MarketFactoryV2:", `https://bscscan.com/address/${factoryAddress}`);

  console.log("\n✅ Next Steps:");
  console.log("1. Update createProductionMarket.js with factory address:");
  console.log(`   factoryV2Address = "${factoryAddress}"`);
  console.log("\n2. Verify MarketFactoryV2 on BSCScan:");
  console.log(`   npx hardhat verify --network bsc ${factoryAddress} ${tellorAddress}`);
  console.log("\n3. Create production markets:");
  console.log("   npx hardhat run scripts/createProductionMarket.js --network bsc");

  console.log("\n📋 Save these addresses for your frontend:");
  console.log(JSON.stringify({
    network: "BSC Mainnet",
    chainId: 56,
    contracts: {
      tellorOracle: tellorAddress,
      marketFactory: factoryAddress
    }
  }, null, 2));

  return {
    tellorOracle: tellorAddress,
    marketFactory: factoryAddress
  };
}

main()
  .then((addresses) => {
    console.log("\n✅ Deployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });


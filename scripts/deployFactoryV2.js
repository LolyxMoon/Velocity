const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const tellorPlaygroundAddress = "0x0346C9998600Fde7bE073b72902b70cfDc671908";
  
  console.log("Deploying MarketFactoryV2...");
  console.log("Tellor Oracle:", tellorPlaygroundAddress);
  
  const FactoryV2 = await ethers.getContractFactory("MarketFactoryV2");
  const factory = await FactoryV2.deploy(tellorPlaygroundAddress);
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("\n✅ MarketFactoryV2 deployed at:", factoryAddress);
  console.log("\nThis factory creates oracle-integrated markets that resolve automatically!");
  console.log("Each market has built-in resolveFromTellor() function.");
  
  return factoryAddress;
}

main().catch((e) => { console.error(e); process.exit(1); });


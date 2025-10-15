const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("Deploying TellorPlayground for testing...");
  
  // Get the TellorPlayground contract
  const TellorPlayground = await ethers.getContractFactory("TellorPlayground");
  
  // Deploy TellorPlayground
  const playground = await TellorPlayground.deploy();
  await playground.waitForDeployment();
  
  const playgroundAddress = await playground.getAddress();
  console.log("✅ TellorPlayground deployed at:", playgroundAddress);
  console.log("\nThis is a testing oracle where you can submit mock data.");
  console.log("Use this address when deploying TellorResolver for testing.");
  
  return playgroundAddress;
}

main().catch((e) => { console.error(e); process.exit(1); });


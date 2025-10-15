const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // BSC Testnet Tellor Oracle address (TellorPlayground for testing)
  const tellorAddress = "0x0346C9998600Fde7bE073b72902b70cfDc671908";
  
  console.log("Deploying TellorResolver...");
  console.log("Tellor Oracle address:", tellorAddress);
  
  const TellorResolver = await ethers.getContractFactory("TellorResolver");
  const resolver = await TellorResolver.deploy(tellorAddress);
  await resolver.waitForDeployment();
  
  const resolverAddress = await resolver.getAddress();
  console.log("✅ TellorResolver deployed at:", resolverAddress);
  console.log("\nIMPORTANT: Use this address as the 'resolver' when creating markets");
  console.log("Markets created with this resolver will be automatically resolvable via Tellor oracle");
  
  return resolverAddress;
}

main().catch((e) => { console.error(e); process.exit(1); });


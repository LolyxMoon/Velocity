const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const tellorPlaygroundAddress = "0x0346C9998600Fde7bE073b72902b70cfDc671908";
  
  // Create a queryId for our token market cap
  // In production, use Tellor's queryId generation tools
  // For testing, we'll create a simple one
  const tokenAddr = "0x0A43fC31a73013089DF59194872Ecae4cAe14444";
  const queryData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["string", "address"],
    ["TokenMarketCap", tokenAddr]
  );
  const queryId = ethers.keccak256(queryData);
  
  console.log("Submitting oracle data to TellorPlayground...");
  console.log("Token:", tokenAddr);
  console.log("QueryId:", queryId);
  
  const playground = await ethers.getContractAt("TellorPlayground", tellorPlaygroundAddress);
  
  // Helper function for USD with 8 decimals
  const usd8 = (s) => ethers.parseUnits(s, 8);
  
  // Submit market cap data
  // Let's submit $60M to test the "YES" outcome (target is $50M)
  const mcapValue = usd8("60000000"); // $60,000,000
  
  const valueBytes = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256"],
    [mcapValue]
  );
  
  const tx = await playground.submitValue(queryId, valueBytes, 0, queryData);
  await tx.wait();
  
  console.log("\n✅ Oracle data submitted!");
  console.log("Market Cap:", "$60,000,000");
  console.log("This exceeds the $50M target, so market should resolve to YES");
  console.log("\nQueryId to use for resolution:", queryId);
  
  // Verify the data was submitted
  try {
    const result = await playground.getDataBefore(queryId, ethers.MaxUint256);
    // result is [bool, bytes, uint256]
    const value = result[1];
    const timestamp = result[2];
    const decodedValue = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], value)[0];
    console.log("\nVerified submitted value:", ethers.formatUnits(decodedValue, 8), "USD");
    console.log("Timestamp:", new Date(Number(timestamp) * 1000).toISOString());
  } catch (e) {
    console.log("\n✅ Data submitted successfully (verification skipped)");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


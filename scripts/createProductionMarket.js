const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // ✅ Updated with Real Tellor Oracle factory address
  const factoryV2Address = "0xe8D17FDcddc3293bDD4568198d25E9657Fd23Fe9";

  const [signer] = await ethers.getSigners();
  const resolver = await signer.getAddress();
  
  console.log("Creating production market on BSC Mainnet...");
  console.log("Resolver (fallback):", resolver);
  console.log("Network:", hre.network.name);

  // Production deadline - October 30, 2025
  const deadline = Math.floor(new Date("2025-10-30T23:59:59Z").getTime() / 1000);
  console.log("Deadline:", new Date(deadline * 1000).toISOString());

  const maxPerWallet = ethers.parseEther("0.1"); // 0.1 BNB max per wallet
  const feeBps = 200; // 2% fee

  const usd8 = (s) => ethers.parseUnits(s, 8);

  // ✅ Token: 哈基米 (Hakimi)
  const tokenAddr = "0x82Ec31D69b3c289E541b50E30681FD1ACAd24444";
  const tokenName = "哈基米"; // Hakimi
  const title = `Will 哈基米 reach $100M mcap before October 30?`;
  const dataSource = `https://dexscreener.com/bsc/${tokenAddr}`;
  const target = usd8("100000000"); // $100M

  // Generate queryId for Tellor oracle
  const queryData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["string", "address"],
    ["TokenMarketCap", tokenAddr]
  );
  const queryId = ethers.keccak256(queryData);

  console.log("\n📊 Market Details:");
  console.log("  Token:", tokenAddr);
  console.log("  Name:", tokenName);
  console.log("  Target Market Cap: $100,000,000");
  console.log("  Max Bet per Wallet: 0.1 BNB");
  console.log("  Fee: 2%");
  console.log("  QueryId:", queryId);

  const factory = await ethers.getContractAt("MarketFactoryV2", factoryV2Address);

  console.log("\n⏳ Creating market...");
  const tx = await factory.createMarket(
    resolver,
    deadline,
    maxPerWallet,
    feeBps,
    title,
    dataSource,
    target,
    queryId
  );
  
  console.log("Transaction submitted:", tx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const rc = await tx.wait();
  const ev = rc.logs.find(log => {
    try {
      const parsed = factory.interface.parseLog(log);
      return parsed && parsed.name === "MarketCreated";
    } catch (e) {
      return false;
    }
  });
  const parsedEv = factory.interface.parseLog(ev);
  const marketAddr = parsedEv.args.market;

  console.log("\n✅ ✅ ✅ PRODUCTION MARKET CREATED! ✅ ✅ ✅");
  console.log("\n📍 Market Address:", marketAddr);
  console.log("🔗 BSCScan:", `https://bscscan.com/address/${marketAddr}`);
  console.log("\n📋 Market Configuration:");
  console.log("  Title:", title);
  console.log("  Token:", tokenAddr);
  console.log("  Target: $100,000,000");
  console.log("  Deadline:", new Date(deadline * 1000).toLocaleString());
  console.log("  Max per wallet: 0.1 BNB");
  console.log("  Platform fee: 2%");
  console.log("  QueryId:", queryId);

  console.log("\n🎯 Integration Info for Frontend:");
  console.log("  Market Contract:", marketAddr);
  console.log("  Network: BSC Mainnet (Chain ID: 56)");
  console.log("  Token Address:", tokenAddr);
  
  console.log("\n💡 Next Steps:");
  console.log("1. Update your website with this market address");
  console.log("2. Verify contract on BSCScan (optional):");
  console.log(`   npx hardhat verify --network bsc ${marketAddr}`);
  console.log("3. Monitor oracle data for automatic resolution");
  console.log("4. Market will auto-resolve after deadline using Tellor oracle");
  
  return {
    marketAddress: marketAddr,
    tokenAddress: tokenAddr,
    tokenName: "哈基米",
    targetMcap: "100000000",
    deadline: deadline,
    queryId: queryId
  };
}

main()
  .then((result) => {
    console.log("\n✅ Script completed successfully!");
    console.log("Market Address:", result.marketAddress);
    process.exit(0);
  })
  .catch((e) => { 
    console.error("\n❌ Error:", e.message);
    console.error(e);
    process.exit(1); 
  });


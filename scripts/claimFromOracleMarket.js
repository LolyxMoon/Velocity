const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // V2 market that was resolved via Tellor
  const marketAddress = "0x99991c4a14e1EBDBDdcd7bfb571542D43F355634";
  
  const [signer] = await ethers.getSigners();
  const claimerAddress = await signer.getAddress();
  
  console.log("Attempting to claim from market:", marketAddress);
  console.log("Claimer address:", claimerAddress);
  
  const market = await ethers.getContractAt("BinaryMarketV2", marketAddress);
  
  // Check market state
  const state = await market.state();
  const stateMap = ["Open", "Resolved", "Cancelled"];
  console.log("\n📊 Market State:", stateMap[Number(state)]);
  
  if (state === 0n) {
    console.log("❌ Market still open - cannot claim yet");
    process.exit(0);
  }
  
  // Get outcome
  const finalOutcome = await market.finalOutcome();
  const outcomeMap = ["Undecided", "Yes", "No"];
  console.log("Final Outcome:", outcomeMap[Number(finalOutcome)]);
  
  // Check user's stakes
  const yesStake = await market.yesStake(claimerAddress);
  const noStake = await market.noStake(claimerAddress);
  
  console.log("\n💰 Your Stakes:");
  console.log("  YES stake:", ethers.formatEther(yesStake), "BNB");
  console.log("  NO stake:", ethers.formatEther(noStake), "BNB");
  
  if (yesStake === 0n && noStake === 0n) {
    console.log("\n❌ You have no stakes in this market - nothing to claim");
    process.exit(0);
  }
  
  // Check pools
  const yesPool = await market.yesPool();
  const noPool = await market.noPool();
  
  console.log("\n📊 Pool Totals:");
  console.log("  YES pool:", ethers.formatEther(yesPool), "BNB");
  console.log("  NO pool:", ethers.formatEther(noPool), "BNB");
  
  // Determine if winner
  const isWinner = (finalOutcome === 1n && yesStake > 0n) || (finalOutcome === 2n && noStake > 0n);
  
  if (state === 2n) {
    // Cancelled - everyone gets refund
    console.log("\n💸 Market was cancelled - claiming refund...");
  } else if (isWinner) {
    console.log("\n🎉 You are a WINNER! Claiming payout...");
  } else {
    console.log("\n😔 You bet on the losing side - nothing to claim");
    process.exit(0);
  }
  
  // Get balance before
  const balanceBefore = await ethers.provider.getBalance(claimerAddress);
  
  // Claim
  console.log("\n⏳ Calling claim()...");
  const tx = await market.claim();
  const receipt = await tx.wait();
  
  // Get balance after
  const balanceAfter = await ethers.provider.getBalance(claimerAddress);
  const received = balanceAfter - balanceBefore + receipt.gasUsed * receipt.gasPrice;
  
  console.log("\n✅ Claim successful!");
  console.log("Transaction hash:", receipt.hash);
  console.log("Gas used:", receipt.gasUsed.toString());
  console.log("Amount received:", ethers.formatEther(received), "BNB");
  
  // Find Claimed event
  const claimedEvent = receipt.logs.find(log => {
    try {
      const parsed = market.interface.parseLog(log);
      return parsed && parsed.name === "Claimed";
    } catch (e) {
      return false;
    }
  });
  
  if (claimedEvent) {
    const parsed = market.interface.parseLog(claimedEvent);
    const amount = parsed.args.amount;
    console.log("Claimed amount (from event):", ethers.formatEther(amount), "BNB");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


const hre = require("hardhat");
const { ethers } = hre;

function fmt(x) { return Number(ethers.formatEther(x)).toFixed(4); }

async function preview(marketAddr) {
  const m = await ethers.getContractAt("BinaryMarket", marketAddr);

  const yes = await m.yesPool();
  const no  = await m.noPool();
  const [pYesBps, pNoBps] = await m.viewOdds();

  console.log(`\nMarket ${marketAddr}`);
  console.log(`Pools -> YES: ${fmt(yes)} BNB | NO: ${fmt(no)} BNB`);
  console.log(`Odds   -> YES: ${(Number(pYesBps)/100).toFixed(2)}% | NO: ${(Number(pNoBps)/100).toFixed(2)}%`);

  // Payout preview for a 0.05 BNB bet (exact settlement math)
  const bet = ethers.parseEther("0.05");
  const feeBps = 0; // you created markets with 0% fee for MVP

  // If you bet YES now and YES wins:
  const grossYes = (yes + bet) === 0n ? bet
    : bet + (no * bet) / (yes + bet);
  const feeYes = (grossYes - bet) * BigInt(feeBps) / 10000n;
  const netYes = grossYes - feeYes;

  // If you bet NO now and NO wins:
  const grossNo = (no + bet) === 0n ? bet
    : bet + (yes * bet) / (no + bet);
  const feeNo = (grossNo - bet) * BigInt(feeBps) / 10000n;
  const netNo = grossNo - feeNo;

  console.log(`If you bet 0.05 BNB on YES and it wins -> payout: ${fmt(netYes)} BNB`);
  console.log(`If you bet 0.05 BNB on  NO and it wins -> payout: ${fmt(netNo)} BNB`);
}

async function main() {
  await preview("0x5173680ab1aC105bF07061FB302570d42D8338A0"); // Market A
  await preview("0x097c65F0f40b89feAb37e52B080eF18ceA92e5Ad"); // Market B
}

main().catch(e=>{ console.error(e); process.exit(1); });


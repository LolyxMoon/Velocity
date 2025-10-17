# Platform Fees

## Fee Structure

VelocityBets has a simple, transparent fee structure:

| Fee Type | Amount | When Charged | Who Pays |
|----------|--------|--------------|----------|
| **Platform Fee** | 2% | On winnings only | Winners |
| **Gas Fee** | ~$0.10-0.20 | Per transaction | User (always) |
| **Deposit Fee** | 0% | Never | Nobody |
| **Withdrawal Fee** | 0% | Never | Nobody |

---

## Platform Fee (2%)

### How It Works

The platform charges **2% of winnings** only:

```
Example:
You bet 1 BNB on YES
YES wins
Losing pool share allocated to you: 0.5 BNB
Platform fee: 2% × 0.5 = 0.01 BNB
You receive: 1 BNB (stake) + 0.5 - 0.01 = 1.49 BNB
```

### Key Points

✅ **Only on winnings**, not on your initial stake  
✅ **Only if you win** - losers pay no fee (they lose their bet)  
✅ **Transparent** - deducted automatically by smart contract  
✅ **No hidden fees** - 2% is the total platform fee  

### Comparison

| Platform | Fee |
|----------|-----|
| **VelocityBets** | 2% on winnings |
| Traditional sportsbook | 4-10% house edge |
| Centralized prediction market | 2-5% on all bets |
| DEX trading fees | 0.3-1% per trade |

---

## Gas Fees

### What Are Gas Fees?

**Gas fees** are transaction costs on the BSC blockchain. Every blockchain interaction (bet, claim, etc.) requires gas.

### VelocityBets Gas Costs

Approximate costs on **BSC Mainnet**:

| Action | Gas Used | Cost (@ 3 Gwei) | Cost (USD @ $600 BNB) |
|--------|----------|-----------------|----------------------|
| **Place Bet** | ~100,000 gas | 0.0003 BNB | ~$0.18 |
| **Claim Winnings** | ~80,000 gas | 0.00024 BNB | ~$0.14 |
| **Check Odds** | 0 gas | Free | Free |
| **View Stakes** | 0 gas | Free | Free |

### Why BSC?

We chose BSC over Ethereum because:

| Network | Gas Cost | Speed |
|---------|----------|-------|
| **Ethereum** | $10-50 per tx | 15-60 sec |
| **BSC** | $0.10-0.20 per tx | 3-5 sec |
| **Polygon** | $0.01-0.05 per tx | 2-3 sec |

BSC offers the best balance of:
- ✅ Low fees
- ✅ Fast confirmation
- ✅ Proven security
- ✅ Large user base

### Gas Price Fluctuations

Gas fees vary based on network congestion:

**Low congestion** (night, off-peak):
- ~3 Gwei
- $0.10-0.15 per transaction

**High congestion** (day, busy times):
- ~5 Gwei
- $0.20-0.30 per transaction

**Extreme congestion** (very rare):
- ~10 Gwei
- $0.40-0.60 per transaction

💡 **Tip**: Transact during off-peak hours to save on gas.

---

## Total Cost Breakdown

### Example 1: Small Bet

```
Bet: 0.01 BNB on YES
Outcome: YES wins
Winning share: 0.005 BNB

Costs:
- Bet transaction gas: 0.0003 BNB ($0.18)
- Platform fee: 2% × 0.005 = 0.0001 BNB ($0.06)
- Claim transaction gas: 0.00024 BNB ($0.14)
- Total fees: 0.00064 BNB ($0.38)

Payout:
- Stake returned: 0.01 BNB
- Winnings after fee: 0.0049 BNB
- Total received: 0.0149 BNB

Net profit: 0.0149 - 0.01 = 0.0049 BNB
After gas: 0.0049 - 0.00054 = 0.00436 BNB (~$2.62)

ROI: 43.6%
```

### Example 2: Max Bet

```
Bet: 0.1 BNB on NO
Outcome: NO wins
Winning share: 0.15 BNB (NO was minority)

Costs:
- Bet transaction gas: 0.0003 BNB ($0.18)
- Platform fee: 2% × 0.15 = 0.003 BNB ($1.80)
- Claim transaction gas: 0.00024 BNB ($0.14)
- Total fees: 0.00354 BNB ($2.12)

Payout:
- Stake returned: 0.1 BNB
- Winnings after fee: 0.147 BNB
- Total received: 0.247 BNB

Net profit: 0.247 - 0.1 = 0.147 BNB
After gas: 0.147 - 0.00054 = 0.14646 BNB (~$87.88)

ROI: 146.46%
```

### Example 3: Losing Bet

```
Bet: 0.05 BNB on YES
Outcome: NO wins

Costs:
- Bet transaction gas: 0.0003 BNB ($0.18)
- Platform fee: 0 (you didn't win)
- Claim transaction: 0 (nothing to claim)
- Total fees: 0.0003 BNB ($0.18)

Payout: 0 BNB

Loss: -0.05 BNB (-$30)
Total lost including gas: -0.0503 BNB (-$30.18)

ROI: -100.6%
```

---

## Fee Destination

### Where Does the 2% Go?

Platform fees are used for:

1. **Platform Development** (40%)
   - New features
   - UI improvements
   - Bug fixes

2. **Infrastructure Costs** (30%)
   - Hosting
   - RPC nodes
   - Monitoring

3. **Security** (20%)
   - Audits
   - Bug bounties
   - Insurance fund

4. **Marketing & Growth** (10%)
   - Community building
   - Partnerships
   - User acquisition

### Transparency

All fee collection is **on-chain and visible**:
- Check BSCScan
- See feeCollected variable in contract
- Track withdrawals by platform

---

## Fee Comparison

### VelocityBets vs Competitors

| Platform | Type | Fee | Notes |
|----------|------|-----|-------|
| **VelocityBets** | Prediction market | 2% on winnings | Transparent, on-chain |
| Polymarket | Prediction market | 2% on orders | Centralized, crypto bets |
| PredictIt | Prediction market | 5% + 10% withdrawal | Fiat, US-regulated |
| Augur | Prediction market | ~1-2% + gas | High Ethereum gas |
| DraftKings | Sports betting | 15-20% edge | Not transparent |
| FanDuel | Sports betting | 15-20% edge | Not transparent |

### VelocityBets Advantages

✅ Lower fees than traditional betting  
✅ Lower fees than regulated prediction markets  
✅ Transparent (on-chain)  
✅ No withdrawal fees  
✅ BSC low gas costs  

---

## Gas Optimization

We've optimized contracts to minimize gas:

### Optimizations Implemented

1. **Efficient Data Storage**
   - Use uint96 instead of uint256 where possible
   - Pack variables into single storage slots
   - Saves ~50% gas on state updates

2. **Minimal External Calls**
   - Batch operations where possible
   - Reduce oracle queries
   - Saves ~30% gas

3. **Simple Logic**
   - No complex loops
   - Direct calculations
   - Predictable gas costs

### Result

Our contracts use **less gas than typical DeFi protocols**:

| Protocol Type | Avg Gas per Transaction |
|---------------|-------------------------|
| Uniswap swap | ~150,000 gas |
| **VelocityBets bet** | **~100,000 gas** |
| **VelocityBets claim** | **~80,000 gas** |
| NFT mint | ~200,000 gas |

---

## Future Fee Optimizations

Potential improvements:

### 1. Gas Rebates
For high-volume users:
- Bet >1 BNB cumulative → 10% gas rebate
- Bet >5 BNB cumulative → 25% gas rebate

### 2. Fee Staking
Stake platform tokens to reduce fees:
- Stake 100 tokens → 1.8% fee (instead of 2%)
- Stake 1000 tokens → 1.5% fee

### 3. Volume Discounts
Lower fees for bigger bets:
- 0.01-0.05 BNB → 2% fee
- 0.05-0.1 BNB → 1.5% fee

### 4. Layer 2
If BSC gas gets expensive:
- Migrate to BSC Layer 2 or sidechain
- Could reduce gas 10x

---

## Fee FAQs

### Do I pay fees if I lose?
No platform fee. You only pay gas for the bet transaction (~$0.18).

### Can I avoid the 2% fee?
No. It's automatically deducted by the smart contract from all winning payouts.

### Why is there a fee at all?
To sustain platform development, infrastructure, and growth. 2% is industry-low.

### Are there hidden fees?
No. Only 2% on winnings + BSC gas. That's it.

### Can fees change?
Current markets have 2% fixed. Future markets could have different fees, but always disclosed upfront.

### Who sets the gas price?
Not VelocityBets. Gas is set by the BSC network based on congestion. You can adjust gas price in your wallet.

---

## Cost Examples at Different BNB Prices

### If BNB = $300

| Action | Cost (BNB) | Cost (USD) |
|--------|------------|------------|
| Bet | 0.0003 | $0.09 |
| Claim | 0.00024 | $0.07 |
| **Total** | **0.00054** | **$0.16** |

### If BNB = $600 (current)

| Action | Cost (BNB) | Cost (USD) |
|--------|------------|------------|
| Bet | 0.0003 | $0.18 |
| Claim | 0.00024 | $0.14 |
| **Total** | **0.00054** | **$0.32** |

### If BNB = $1,000

| Action | Cost (BNB) | Cost (USD) |
|--------|------------|------------|
| Bet | 0.0003 | $0.30 |
| Claim | 0.00024 | $0.24 |
| **Total** | **0.00054** | **$0.54** |

💡 Gas fees in BNB stay constant. USD cost scales with BNB price.

---

## Maximize Your Returns

### Tips to Minimize Costs

1. **Batch Your Activity**
   - Don't bet $0.01 ten times (10× gas)
   - Bet $0.1 once (1× gas)

2. **Transact During Off-Peak**
   - Late night UTC hours
   - Lower BSC congestion
   - Potentially 30-50% cheaper gas

3. **Larger Bets = Better ROI**
   - $0.18 gas on $6 bet (3% cost)
   - $0.18 gas on $60 bet (0.3% cost)

4. **Only Claim Meaningful Wins**
   - Don't claim $1 win and pay $0.32 gas
   - Wait to accumulate or bet bigger

---

## Next Steps

Learn more:

🎯 [Parimutuel System](parimutuel.md) - How payouts work  
📋 [Market Rules](../markets/rules.md) - Betting rules  
💡 [Quick Start](../getting-started/quick-start.md) - Place your first bet  

---

**Ready to bet?** [Get Started →]()


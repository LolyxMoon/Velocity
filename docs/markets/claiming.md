# Claiming Winnings

How to claim your winnings after a market resolves in your favor.

---

## When Can You Claim?

You can claim winnings **immediately** after a market resolves, if you bet on the winning side.

### Resolution Process

```
1. Deadline Passes
   ↓
2. 1-Hour Buffer Period
   ↓
3. Market Resolves (via oracle or manually)
   ↓
4. Claims Open ✅
```

### Check Market Status

Visit the market page to see:
```
Status: RESOLVED
Outcome: YES (or NO)
Your winnings: X BNB
```

---

## Step-by-Step: How to Claim

### Step 1: Navigate to Market

1. Go to [velocitybets.com](https://velocitybets.com)
2. Click on the resolved market
3. Connect your wallet (if not already connected)

### Step 2: Verify You Won

Check market outcome:
- If you bet **YES** and outcome is **YES** → You won! ✅
- If you bet **NO** and outcome is **NO** → You won! ✅
- If you bet on the losing side → No winnings ❌

**Your Winnings** section shows:
```
Your YES stake: 0.05 BNB
Outcome: YES
Your payout: 0.089 BNB
Your profit: 0.039 BNB (+78%)
```

### Step 3: Click "Claim Winnings"

**The button appears only if**:
- Market is resolved
- You bet on the winning side
- You haven't claimed yet

Click the green **"Claim Winnings"** button.

### Step 4: Confirm Transaction

Your wallet pops up:
```
Function: claim()
Value: 0 BNB (you're receiving, not sending)
Gas Fee: ~0.00024 BNB (~$0.14)
```

**Review**:
- No BNB being sent (value = 0)
- Gas fee is reasonable (~$0.14)
- Destination is correct contract

**Confirm**:
- Click **"Confirm"** in wallet
- Wait for transaction (~3-5 seconds)

### Step 5: Receive BNB

**Success!** ✅

- BNB sent to your wallet
- Check wallet balance
- Transaction hash displayed
- "Claimed" status appears on market page

---

## Payout Calculation

### How Much Do You Get?

```
Your Payout = Your Stake + Your Share of Losing Pool - Platform Fee

Where:
- Your Stake = What you bet
- Your Share = (Your Stake / Winning Pool) × Losing Pool
- Platform Fee = 2% of your share of losing pool
```

### Example Calculation

```
Market: 哈基米 → Resolved YES

Your bet: 0.05 BNB on YES
YES Pool total: 0.5 BNB
NO Pool total: 0.3 BNB

Step 1: Calculate your share of YES pool
Your share = 0.05 / 0.5 = 10%

Step 2: Calculate your winnings from NO pool
Winnings = 0.3 × 10% = 0.03 BNB

Step 3: Calculate platform fee
Fee = 2% × 0.03 = 0.0006 BNB

Step 4: Calculate total payout
Payout = 0.05 (stake) + 0.03 (winnings) - 0.0006 (fee)
Payout = 0.0794 BNB

Step 5: Calculate profit
Profit = 0.0794 - 0.05 = 0.0294 BNB
ROI = 58.8%
```

---

## Multiple Markets

### If You Bet on Multiple Markets

You must claim **each market separately**:

```
Market A: Won 0.15 BNB → Click "Claim" on Market A
Market B: Won 0.08 BNB → Click "Claim" on Market B
Market C: Lost → No claim button
```

**Note**: Each claim requires a separate gas fee (~$0.14 each).

---

## Claiming Timeline

### When to Claim

**Immediately**:
- No time limit on claims
- Claim whenever convenient
- Your winnings are reserved

**Consider waiting if**:
- Gas fees are high (network congestion)
- Amount is very small
- You plan to bet on new markets soon

### No Expiration

Claims **never expire**. Your winnings will always be available.

You can claim:
- 1 hour after resolution
- 1 day after resolution
- 1 year after resolution

---

## Verification

### Verify on BSCScan

All claims are transparent:

1. **Go to BSCScan**
   ```
   https://bscscan.com/address/YOUR_WALLET_ADDRESS
   ```

2. **Find claim transaction**
   - Look for "claim" function call
   - To: BinaryMarket contract
   - Value In: Your payout amount

3. **Verify payout**
   - Check BNB received
   - Verify gas paid
   - Confirm timestamp

### Check Contract State

**Before claiming**:
```
claimedYes[your_address] = false
claimedNo[your_address] = false
```

**After claiming**:
```
claimedYes[your_address] = true (if you claimed YES winnings)
```

This prevents double-claiming.

---

## Claim Status

### Track Your Claims

Each market shows your claim status:

**Not Resolved Yet**:
```
Status: ACTIVE
Your Stakes: 0.05 BNB on YES
Action: Wait for resolution
```

**Resolved - You Won**:
```
Status: RESOLVED (YES)
Your Winnings: 0.089 BNB
Action: [Claim Winnings] button
```

**Claimed**:
```
Status: RESOLVED (YES)
Claimed: ✅ 0.089 BNB
Action: None (already claimed)
```

**Resolved - You Lost**:
```
Status: RESOLVED (YES)
Your Stakes: 0.05 BNB on NO
Result: Lost
Action: None
```

---

## Gas Optimization

### Save on Gas Fees

**1. Batch Claims**
- If multiple markets resolved → Claim all at once
- Currently requires separate transactions
- Future: Batch claim function

**2. Wait for Low Gas**
- Check BSC gas prices
- Claim during off-peak hours (late night UTC)
- Can save 30-50% on gas

**3. Don't Claim Tiny Amounts**
- If you won $1 and gas is $0.30 → Wait
- If gas drops or you accumulate more wins → Claim then

---

## Common Issues

### ❌ "Already Claimed" Error

**Cause**: You've already claimed this market's winnings.

**Solution**: Check BSCScan for previous claim transaction.

### ❌ "Not Resolved" Error

**Cause**: Market hasn't resolved yet.

**Solution**: Wait for resolution. Check deadline countdown.

### ❌ "No Winnings" Error

**Cause**: You bet on the losing side.

**Solution**: Unfortunately, you lost this bet. Try again!

### ❌ Transaction Failed

**Possible causes**:
- Insufficient BNB for gas
- Network congestion
- Wrong network (not BSC Mainnet)

**Solution**:
- Add BNB to wallet for gas
- Try again
- Verify you're on BSC Mainnet

### ❌ Claim Button Not Appearing

**Checklist**:
- Is market resolved? (Check status)
- Did you bet on winning side?
- Have you already claimed?
- Are you using correct wallet?

---

## Claiming Examples

### Example 1: Single Winning Bet

```
Market: 哈基米 (Resolved YES)

Your bet: 0.08 BNB on YES
Total YES pool: 1.2 BNB
Total NO pool: 0.8 BNB

Calculation:
Your share = 0.08 / 1.2 = 6.67%
Winnings = 0.8 × 6.67% = 0.0533 BNB
Fee = 2% × 0.0533 = 0.00107 BNB
Payout = 0.08 + 0.0533 - 0.00107 = 0.13223 BNB

Process:
1. See "Claim 0.13223 BNB" button
2. Click button
3. Confirm in wallet (pay ~$0.14 gas)
4. Receive 0.13223 BNB
5. Net profit: 0.05223 BNB (+65.3%)
```

### Example 2: Hedged Bet (Won One Side)

```
Market: $4 (Resolved NO)

Your bets:
- 0.06 BNB on YES (lost)
- 0.04 BNB on NO (won!)

Total YES pool: 1.5 BNB
Total NO pool: 0.5 BNB

Calculation (NO side only):
Your share = 0.04 / 0.5 = 8%
Winnings = 1.5 × 8% = 0.12 BNB
Fee = 2% × 0.12 = 0.0024 BNB
Payout = 0.04 + 0.12 - 0.0024 = 0.1576 BNB

Net result:
Received from NO: 0.1576 BNB
Lost on YES: 0.06 BNB
Net profit: 0.0976 BNB (+97.6% on total $0.10 wagered)
```

---

## Tax Considerations

### Record Keeping

Keep records for tax purposes:

**Track**:
- Date and time of bets
- Amount wagered
- Market details
- Date and time of claims
- Amount received
- Gas fees paid
- Net profit/loss

**Use**:
- BSCScan transaction history
- Personal spreadsheet
- Tax software

**Note**: Tax laws vary by jurisdiction. Consult a tax professional.

---

## What If...?

### What if I forget to claim?

**No problem!** Claims never expire. Claim whenever you remember.

### What if the claim transaction fails?

**Try again**. Make sure you have BNB for gas. If repeated failures, contact support.

### What if I lost my private key?

**Your winnings are lost**. We cannot recover funds if you lose wallet access. Always backup your seed phrase!

### What if the market was resolved incorrectly?

**Verify on-chain**. All resolution data is public on BSCScan. Check oracle data or resolver's manual resolution proof.

### What if I claimed but didn't receive BNB?

**Check BSCScan**:
- Was transaction successful?
- Did BNB arrive in wallet?
- Are you checking correct wallet?

If transaction succeeded but no BNB, contact support with transaction hash.

---

## After Claiming

### What Happens to Your BNB?

- ✅ **It's in your wallet** - Do whatever you want with it!
- Withdraw to exchange
- Bet on another market
- Hold
- Spend

### Bet Again?

Feeling lucky? Browse new markets and bet again!

[View Active Markets →](active-markets.md)

---

## Next Steps

📊 [Active Markets](active-markets.md) - Find new betting opportunities  
📋 [Market Rules](rules.md) - Review the rules  
💡 [How to Bet](how-to-bet.md) - Place another bet  

---

**Congratulations on your win!** 🎉

[Return to VelocityBets →](https://velocitybets.com)


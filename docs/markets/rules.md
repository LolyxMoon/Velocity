# Market Rules

Complete rules for participating in VelocityBets prediction markets.

---

## Eligibility

### Who Can Participate?

✅ **Anyone** with:
- A Web3 wallet (MetaMask, Rabby, WalletConnect)
- BNB on BSC Mainnet for betting and gas
- Age 18 or older

❌ **Restrictions**:
- Must comply with local laws and regulations
- Geographic restrictions may apply
- Not available where prohibited by law

---

## Betting Rules

### Bet Limits

**Minimum Bet**: 0.001 BNB  
**Maximum Bet**: 0.1 BNB per wallet per side

**Example**:
```
✅ Allowed: 0.1 BNB on YES + 0.1 BNB on NO = 0.2 BNB total
❌ Not allowed: 0.15 BNB on YES (exceeds max)
```

### Why Max Bet Limits?

- Prevents whale manipulation
- Ensures fair markets
- Protects small bettors
- Maintains liquidity balance

### Bet Timing

✅ **Before deadline**: Bets allowed  
❌ **After deadline**: Bets rejected

**No grace period**. The deadline is strict.

---

## How to Bet

### Placing a Bet

1. **Connect wallet** to ()
2. **Choose market** from active markets
3. **Enter amount** (0.001 - 0.1 BNB)
4. **Click YES or NO**
5. **Confirm transaction** in wallet
6. **Wait for confirmation** (~5 seconds)

### Bet Finality

⚠️ **Bets are final and cannot be cancelled or withdrawn**

Once a transaction is confirmed:
- Your BNB is locked in the market
- You cannot change your bet
- You cannot withdraw until resolution
- Exception: If market is cancelled before deadline

### Multiple Bets

You can place multiple bets **up to the maximum**:

```
Scenario 1: Single bet
- Bet 0.1 BNB on YES
- ✅ Allowed
- ❌ Cannot bet more on YES

Scenario 2: Multiple small bets
- Bet 0.03 BNB on YES
- Bet 0.04 BNB on YES
- Bet 0.03 BNB on YES
- Total: 0.1 BNB
- ✅ Allowed
- ❌ Cannot bet more on YES

Scenario 3: Both sides
- Bet 0.1 BNB on YES
- Bet 0.1 BNB on NO
- ✅ Allowed (hedging strategy)
```

---

## Market Resolution

### Resolution Timeline

1. **Market Created** → Betting opens
2. **Deadline** → Betting closes
3. **Buffer Period** (1 hour) → Waiting for oracle data
4. **Resolution** → Market outcome determined
5. **Claims Open** → Winners can claim payouts

### Resolution Methods

#### Primary: Tellor Oracle
- Automatic resolution via Tellor Oracle
- Fetches real-world market cap data
- Compares to target market cap
- Returns YES or NO

#### Fallback: Manual Resolution
- If oracle data unavailable or disputed
- Resolver manually resolves with verifiable proof
- Community can verify on BSCScan

[Learn more about oracle resolution →](../how-it-works/oracle-resolution.md)

### Outcome Determination

**YES wins if**: Token market cap ≥ Target market cap at deadline  
**NO wins if**: Token market cap < Target market cap at deadline

**Examples**:
```
Market: Will 哈基米 reach $100M by Oct 30?

Scenario A:
- At deadline: $115M market cap
- Outcome: YES ✅

Scenario B:
- At deadline: $95M market cap
- Outcome: NO ✅

Scenario C:
- At deadline: Exactly $100M
- Outcome: YES ✅ (>= target)
```

---

## Payouts

### Winner Payouts

**Formula**:
```
Your Payout = Your Stake + (Losing Pool × Your Share) - 2% Fee

Where:
Your Share = Your Stake / Total Winning Pool
```

**Example**:
```
You bet: 0.05 BNB on YES
YES Pool: 0.5 BNB total
NO Pool: 0.3 BNB total
Outcome: YES wins

Your share: 0.05 / 0.5 = 10%
Your winnings from losing pool: 0.3 × 10% = 0.03 BNB
Platform fee: 2% × 0.03 = 0.0006 BNB
Your payout: 0.05 + 0.03 - 0.0006 = 0.0794 BNB

Profit: 0.0294 BNB (58.8% ROI)
```

### Loser Payouts

**If you bet on the losing side**: 0 BNB

Your entire stake goes to the winning pool.

### Claiming

**When**: Immediately after market resolves  
**How**: Click "Claim Winnings" button on market page  
**Cost**: Gas fee (~$0.14)

⚠️ **You must claim manually**. Payouts are not automatic.

[Learn more about claiming →](claiming.md)

---

## Market Cancellation

### When Markets Can Be Cancelled

Only **before the deadline** and only by the **resolver** (market creator).

**Valid reasons**:
- Technical issues with oracle
- Token contract compromised
- Regulatory issues
- Force majeure

### Cancellation Process

1. Resolver calls `cancel()` function
2. Market marked as cancelled
3. All bettors can claim 100% refunds
4. No fees charged

### Refunds

If a market is cancelled:
- ✅ Get 100% of your stake back
- ✅ No platform fee
- ❌ Pay gas fee to claim refund (~$0.14)

---

## Prohibited Actions

### ❌ Market Manipulation

Prohibited activities include:
- Wash trading (betting against yourself from multiple wallets)
- Coordinated pump-and-dump schemes
- Oracle manipulation attempts
- Sybil attacks (multiple wallets to exceed max bet)

**Consequences**:
- On-chain activity is permanent and traceable
- Community reputation damage
- Potential legal action for large-scale fraud

### ❌ Exploits

Do not attempt to:
- Exploit smart contract bugs
- Frontrun oracle data
- DoS attack the contracts
- Manipulate gas prices to advantage

**Bug Bounty**: If you find a vulnerability, report it responsibly for a reward.

---

## Fair Play

### Market Integrity

VelocityBets markets are designed to be fair:

✅ **Max bet limits** prevent whale dominance  
✅ **Parimutuel system** ensures fair odds  
✅ **Oracle resolution** removes human bias  
✅ **Open-source code** allows community audits  
✅ **On-chain transparency** enables verification  

### Self-Balancing

Markets naturally balance themselves:
- High YES odds → More people bet NO
- High NO odds → More people bet YES
- Result: Odds tend toward fair value

---

## Fees

### Platform Fee: 2%

- Charged on **winnings only** (not on stake)
- Deducted automatically by smart contract
- Used for platform development and operations

### Gas Fees

- **~$0.18** to place bet
- **~$0.14** to claim winnings
- Paid to BSC network (not VelocityBets)
- Varies with network congestion

[Learn more about fees →](../how-it-works/fees.md)

---

## Market Information

### Required Information

Each market displays:
- ✅ Market question (e.g., "Will 哈基米 reach $100M?")
- ✅ Token address
- ✅ Target market cap
- ✅ Deadline (date and time in UTC)
- ✅ Max bet limit
- ✅ Platform fee
- ✅ Live odds (YES and NO percentages)
- ✅ Pool sizes (YES pool, NO pool)
- ✅ Your stakes (if you've bet)

### Verification

All data is **on-chain** and verifiable:
- Check contract on BSCScan
- Read public variables
- View transaction history
- Audit code on GitHub

---

## User Responsibilities

### Your Obligations

✅ **Understand the risks**  
✅ **Verify market details** before betting  
✅ **Secure your wallet** and private keys  
✅ **Comply with local laws**  
✅ **Only bet what you can afford to lose**  

❌ **VelocityBets does not**:
- Provide financial advice
- Guarantee profits
- Insure against losses
- Custody your funds

---

## Dispute Resolution

### If You Disagree with Resolution

1. **Verify on-chain**: Check BSCScan for oracle data used
2. **Compare to sources**: Check DEXScreener, CoinGecko, etc.
3. **Community discussion**: Discuss on social media
4. **Future improvement**: DAO voting for disputes (coming soon)

**Current process**: Resolver has final say on manual resolutions, but all data is public for community verification.

---

## Changes to Rules

### Rule Updates

VelocityBets may update these rules:
- Changes apply to **new markets** only
- Existing markets follow rules at time of creation
- Major changes announced in advance
- Always check rules before betting

### Market-Specific Rules

Individual markets may have additional rules:
- Different max bets (though currently all 0.1 BNB)
- Different fees (though currently all 2%)
- Special resolution criteria

Always check market details before betting.

---

## Legal

### Disclaimer

⚠️ **Important**: 
- Prediction markets involve risk
- You can lose your entire bet
- Not financial advice
- No guarantees of any kind
- Use at your own risk

[Read full legal disclaimer →](../legal/disclaimer.md)  
[Read risk factors →](../legal/risk-factors.md)  

---

## Summary

**Key Rules to Remember**:

1. ✅ Max 0.1 BNB per wallet per side
2. ✅ Bets are final (no cancellation)
3. ✅ Betting closes at deadline (strict)
4. ✅ Winners split losing pool proportionally
5. ✅ 2% fee on winnings only
6. ✅ Must manually claim payouts
7. ✅ Markets resolve via Tellor Oracle
8. ✅ Refunds if cancelled before deadline
9. ✅ Age 18+, comply with local laws
10. ✅ Only bet what you can afford to lose

---

## Next Steps

📚 [How to Bet](how-to-bet.md) - Step-by-step betting guide  
💰 [Claiming Winnings](claiming.md) - How to claim payouts  
❓ [FAQ](../getting-started/faq.md) - Common questions  

---

**Ready to bet?** [Visit VelocityBets →]()


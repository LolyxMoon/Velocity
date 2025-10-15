# Understanding Odds

## How Odds Work on VelocityBets

VelocityBets uses a **parimutuel system** where odds are determined by the total pool of bets, not by a house or bookmaker.

### Real-Time Calculations

Odds update continuously as bets come in:

```
YES Odds = (Total Pool) / (YES Pool)
NO Odds = (Total Pool) / (NO Pool)
```

### Example

Market: "Will $4 hit $444M mcap?"

**Current Pool:**
- YES Pool: 1 BNB
- NO Pool: 2 BNB
- Total Pool: 3 BNB

**Current Odds:**
- YES Odds: 3.0x (3 ÷ 1)
- NO Odds: 1.5x (3 ÷ 2)

If you bet **0.1 BNB on YES** and it wins:
- Your payout: 0.3 BNB (0.1 × 3.0x)
- Your profit: 0.2 BNB (minus 2% fee)

### Dynamic Nature

Odds **constantly change** as more bets are placed:

1. **Early bets** get better odds (smaller pool)
2. **Popular side** sees odds decrease
3. **Unpopular side** sees odds increase
4. **Last-minute bets** lock in final odds

### What This Means

✅ **No house edge** - You're betting against other users  
✅ **Market-driven** - Odds reflect collective opinion  
✅ **Transparent** - All pools visible on-chain  
✅ **Fair** - Everyone sees the same odds at the same time  

### Viewing Odds

On VelocityBets, you can see:

- **Current odds** for YES and NO
- **Pool sizes** for both sides
- **Your potential payout** before betting
- **Live updates** as new bets come in

### Strategic Considerations

**Early betting:**
- Better odds
- More risk (smaller sample size)

**Late betting:**
- Worse odds
- More information (see market consensus)

**Contrarian betting:**
- Bet against the crowd
- Higher potential returns
- Requires conviction in your thesis


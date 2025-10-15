# API Reference

Complete reference for VelocityBets smart contract functions and events.

---

## BinaryMarketV2_Fixed Contract

### Write Functions

#### `bet(bool yes) payable`

Place a bet on the market.

**Parameters**:
- `yes` (bool): `true` for YES, `false` for NO

**Payable**: Send BNB with transaction (your bet amount)

**Requirements**:
- Market must be open (`state == 0`)
- Current time < deadline
- msg.value >= minBet (0.001 BNB)
- User's total stake on this side <= maxPerWallet (0.1 BNB)

**Emits**: `Bet(address user, bool yes, uint256 amount)`

**Example**:
```javascript
const tx = await market.bet(true, { 
  value: ethers.parseEther('0.05') 
});
await tx.wait();
```

---

#### `claim()`

Claim winnings after market resolves.

**Parameters**: None

**Requirements**:
- Market must be resolved (`state == 1`)
- User must have bet on winning side
- User hasn't claimed yet

**Emits**: `Claimed(address user, uint256 amount)`

**Example**:
```javascript
const tx = await market.claim();
await tx.wait();
```

---

#### `resolveFromTellor()`

Resolve market using Tellor Oracle data.

**Parameters**: None

**Requirements**:
- Current time >= deadline + 1 hour
- Market not already resolved

**Emits**: `Resolved(uint8 outcome, bool fromOracle, uint256 mcapValue)`

**Example**:
```javascript
const tx = await market.resolveFromTellor();
await tx.wait();
```

---

#### `resolveManual(bool _outcome)` (Resolver only)

Manually resolve market if oracle unavailable.

**Parameters**:
- `_outcome` (bool): `true` for YES wins, `false` for NO wins

**Requirements**:
- Only callable by resolver
- Current time >= deadline
- Market not already resolved

**Emits**: `Resolved(uint8 outcome, bool fromOracle, uint256 mcapValue)`

---

#### `cancel()` (Resolver only)

Cancel market before deadline (emergency only).

**Parameters**: None

**Requirements**:
- Only callable by resolver
- Current time < deadline
- Market not resolved

**Emits**: Market status updated

---

### Read Functions

#### `viewOdds() → (uint256, uint256, uint256, uint256)`

Get current odds and pool sizes.

**Returns**:
- `pYes_bps` (uint256): YES probability in basis points (e.g., 6700 = 67%)
- `pNo_bps` (uint256): NO probability in basis points (e.g., 3300 = 33%)
- `totalYes` (uint256): Total BNB in YES pool (wei)
- `totalNo` (uint256): Total BNB in NO pool (wei)

**Example**:
```javascript
const [yesOdds, noOdds, yesPool, noPool] = await market.viewOdds();
console.log('YES:', Number(yesOdds) / 100, '%');
console.log('NO:', Number(noOdds) / 100, '%');
console.log('YES Pool:', ethers.formatEther(yesPool), 'BNB');
console.log('NO Pool:', ethers.formatEther(noPool), 'BNB');
```

---

#### `yesStake(address user) → uint256`

Get user's total stake on YES.

**Parameters**:
- `user` (address): User's wallet address

**Returns**: Amount in wei

**Example**:
```javascript
const stake = await market.yesStake(userAddress);
console.log('User YES stake:', ethers.formatEther(stake), 'BNB');
```

---

#### `noStake(address user) → uint256`

Get user's total stake on NO.

**Parameters**:
- `user` (address): User's wallet address

**Returns**: Amount in wei

---

#### `state() → uint8`

Get market state.

**Returns**:
- `0`: Open (accepting bets)
- `1`: Resolved
- `2`: Cancelled

**Example**:
```javascript
const state = await market.state();
if (state === 0n) console.log('Market is open');
if (state === 1n) console.log('Market is resolved');
if (state === 2n) console.log('Market is cancelled');
```

---

#### `finalOutcome() → uint8`

Get final outcome (only after resolution).

**Returns**:
- `0`: Not resolved yet
- `1`: YES won
- `2`: NO won

**Example**:
```javascript
const outcome = await market.finalOutcome();
if (outcome === 1n) console.log('YES won!');
if (outcome === 2n) console.log('NO won!');
```

---

#### `deadline() → uint256`

Get market deadline timestamp.

**Returns**: Unix timestamp (seconds)

**Example**:
```javascript
const deadline = await market.deadline();
const date = new Date(Number(deadline) * 1000);
console.log('Deadline:', date.toISOString());
```

---

#### `maxPerWallet() → uint256`

Get maximum bet per wallet.

**Returns**: Amount in wei (currently 0.1 BNB)

---

#### `minBet() → uint256`

Get minimum bet amount.

**Returns**: Amount in wei (currently 0.001 BNB)

---

#### `feeBps() → uint256`

Get platform fee in basis points.

**Returns**: Fee (200 = 2%)

---

#### `title() → string`

Get market question.

**Returns**: String (e.g., "Will 哈基米 reach $100M mcap before October 30?")

---

#### `targetMarketCap() → uint256`

Get target market cap.

**Returns**: Market cap in 8 decimals (e.g., 10000000000000000 = $100M)

---

#### `claimedYes(address user) → bool`

Check if user has claimed YES winnings.

**Parameters**:
- `user` (address): User's wallet address

**Returns**: `true` if claimed, `false` if not

---

#### `claimedNo(address user) → bool`

Check if user has claimed NO winnings.

---

### Events

#### `Bet`

```solidity
event Bet(address indexed user, bool yes, uint256 amount)
```

Emitted when a bet is placed.

**Parameters**:
- `user`: Address of bettor
- `yes`: `true` if YES bet, `false` if NO bet
- `amount`: Amount bet in wei

**Listen**:
```javascript
market.on('Bet', (user, yes, amount) => {
  console.log(`${user} bet ${ethers.formatEther(amount)} on ${yes ? 'YES' : 'NO'}`);
});
```

---

#### `Resolved`

```solidity
event Resolved(uint8 outcome, bool fromOracle, uint256 mcapValue)
```

Emitted when market resolves.

**Parameters**:
- `outcome`: `1` = YES, `2` = NO
- `fromOracle`: `true` if resolved by oracle, `false` if manual
- `mcapValue`: Market cap value used (in 8 decimals)

---

#### `Claimed`

```solidity
event Claimed(address indexed user, uint256 amount)
```

Emitted when user claims winnings.

**Parameters**:
- `user`: Address of claimer
- `amount`: Amount claimed in wei

---

## MarketFactoryV2 Contract

### Write Functions

#### `createMarket(...)`

Create a new prediction market (only factory owner).

**Parameters**: Multiple (see contract)

---

### Read Functions

#### `allMarkets(uint256 index) → address`

Get market address by index.

**Parameters**:
- `index` (uint256): Market index (0-based)

**Returns**: Market contract address

---

#### `marketCount() → uint256`

Get total number of markets created.

**Returns**: Count

**Example**:
```javascript
const count = await factory.marketCount();
console.log('Total markets:', count);

// Loop through all markets
for (let i = 0; i < count; i++) {
  const marketAddr = await factory.allMarkets(i);
  console.log('Market', i, ':', marketAddr);
}
```

---

## Error Codes

### Common Revert Reasons

| Error | Meaning | Solution |
|-------|---------|----------|
| "Deadline passed" | Betting period ended | Can't bet anymore |
| "Exceeds cap" | Bet exceeds max (0.1 BNB) | Reduce bet amount |
| "Below min" | Bet below min (0.001 BNB) | Increase bet amount |
| "Already resolved" | Market already resolved | Can't bet anymore |
| "Not resolved" | Market not resolved yet | Wait for resolution |
| "Already claimed" | You already claimed | Can't claim again |
| "Nothing to claim" | No winnings to claim | You bet on losing side |
| "Not resolver" | Only resolver can call | You're not authorized |

---

## Gas Estimates

| Function | Estimated Gas | Cost @ 3 Gwei | Cost (USD @ $600 BNB) |
|----------|---------------|---------------|----------------------|
| `bet()` | ~100,000 | 0.0003 BNB | ~$0.18 |
| `claim()` | ~80,000 | 0.00024 BNB | ~$0.14 |
| `viewOdds()` | 0 (read) | 0 | $0 |
| `resolveFromTellor()` | ~150,000 | 0.00045 BNB | ~$0.27 |

---

## ABI Snippets

### Minimal ABI (Common Functions)

```javascript
const MINIMAL_ABI = [
  "function bet(bool yes) external payable",
  "function claim() external",
  "function viewOdds() external view returns (uint256, uint256, uint256, uint256)",
  "function yesStake(address) external view returns (uint256)",
  "function noStake(address) external view returns (uint256)",
  "function state() external view returns (uint8)",
  "function finalOutcome() external view returns (uint8)",
  "function deadline() external view returns (uint256)",
  "function title() external view returns (string)",
  "event Bet(address indexed user, bool yes, uint256 amount)",
  "event Resolved(uint8 outcome, bool fromOracle, uint256 mcapValue)",
  "event Claimed(address indexed user, uint256 amount)"
];
```

### Full ABI

Available on BSCScan for each deployed contract.

---

## TypeScript Types

```typescript
export interface ViewOddsResult {
  yesOdds: bigint;  // Basis points (e.g., 6700n)
  noOdds: bigint;   // Basis points (e.g., 3300n)
  yesPool: bigint;  // Wei
  noPool: bigint;   // Wei
}

export enum MarketState {
  Open = 0,
  Resolved = 1,
  Cancelled = 2
}

export enum Outcome {
  NotResolved = 0,
  YesWon = 1,
  NoWon = 2
}

export interface MarketData {
  title: string;
  deadline: bigint;
  state: MarketState;
  finalOutcome: Outcome;
  yesOdds: number;  // Percentage (0-100)
  noOdds: number;   // Percentage (0-100)
  yesPool: string;  // Formatted BNB
  noPool: string;   // Formatted BNB
}
```

---

## Next Steps

📖 [Integration Guide](integration.md) - How to integrate  
🔧 [Smart Contracts](smart-contracts.md) - Contract architecture  
🔗 [Contract Addresses](contract-addresses.md) - Deployed addresses  

---

**Questions?** Reach out on Twitter [@wearetellor](https://twitter.com/wearetellor)


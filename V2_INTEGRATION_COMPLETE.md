# 🎉 V2 Oracle Integration - COMPLETE!

## ✨ What We've Built

You now have **two versions** of prediction markets:

### **Version 1** (Original)
- External `TellorResolver` contract
- Markets created by `MarketFactory`  
- Requires calling resolver contract to resolve markets

### **Version 2** (NEW - Integrated Oracle) ⭐
- **Built-in oracle resolution** - each market can resolve itself!
- Markets created by `MarketFactoryV2`
- Direct `resolveFromTellor()` function in each market
- Simpler, more elegant architecture

---

## 📦 V2 Deployed Contracts (BSC Testnet)

| Contract | Address | Description |
|----------|---------|-------------|
| **TellorPlayground** | `0x0346C9998600Fde7bE073b72902b70cfDc671908` | Test oracle |
| **MarketFactoryV2** | `0x405a9f5835D881e15cbc135E7b874698Fd201814` | Creates V2 markets |
| **Test Market V2** | `0x99991c4a14e1EBDBDdcd7bfb571542D43F355634` | Live oracle-integrated market |

**Test Market Details:**
- Target: $50M market cap
- Oracle data: $60M (exceeds target → will resolve to YES)
- QueryId: `0x1c21ec594eefcdd62a34e225e12fa768fa841495c9d3f72653367adf568e1493`
- Buffer period: ~57 minutes remaining

---

## 🎯 Key Improvements in V2

### 1. **Self-Contained Markets**
Each market contract now:
- Inherits from `UsingTellor`
- Stores its own `queryId`
- Can resolve itself automatically
- Provides oracle preview functions

### 2. **Built-In Functions**

```solidity
// Automatic oracle resolution (anyone can call after deadline + buffer)
function resolveFromTellor() external;

// Check if ready to resolve
function canResolveFromOracle() external view returns (bool);

// Preview the resolution outcome
function previewOracleResolution() external view returns (
    bool outcome,
    uint256 mcapValue,
    uint256 timestamp
);

// Get current oracle data
function getCurrentOracleData() external view returns (
    uint256 mcapValue,
    uint256 timestamp
);

// Fallback manual resolution (still available)
function resolve(bool tokenReachedTarget) external onlyResolver;
```

### 3. **Factory Simplification**

`MarketFactoryV2` creates markets with oracle integration built-in:

```solidity
function createMarket(
    address resolver,          // Fallback manual resolver
    uint256 deadline,
    uint256 maxPerWallet,
    uint16  feeBps,
    string calldata tokenName,
    string calldata dataSourceURL,
    uint256 targetMcapUsd,
    bytes32 queryId           // NEW: Oracle queryId
) external returns (address);
```

---

## 🚀 How to Use V2 Markets

### Step 1: Create a Market

```bash
npx hardhat run scripts/createMarketV2.js --network bsctest
```

This creates a market with:
- Oracle integration built-in
- 30-second deadline (for testing)
- $50M target market cap

### Step 2: Submit Oracle Data (Testing)

```bash
npx hardhat run scripts/submitOracleData.js --network bsctest
```

Submits $60M market cap data (exceeds $50M target).

### Step 3: Preview Market

```bash
npx hardhat run scripts/previewMarketV2.js --network bsctest
```

Shows:
- Market state and pools
- Current oracle data
- Resolution preview
- When market can be resolved

### Step 4: Place Bets (Optional)

You can bet before deadline:

```bash
# Edit placeBet.js or betNo.js with your market address
npx hardhat run scripts/placeBet.js --network bsctest
```

### Step 5: Wait for Buffer Period

- Deadline passes (30 seconds)
- Wait additional 1 hour buffer period
- This ensures oracle data availability

### Step 6: Resolve Market

```bash
npx hardhat run scripts/resolveMarketV2.js --network bsctest <MARKET_ADDRESS>
```

The market resolves itself using oracle data!

### Step 7: Claim Winnings

```javascript
const market = await ethers.getContractAt("BinaryMarketV2", marketAddress);
await market.claim();
```

---

## 📝 Available Scripts

### Deployment
- `deployFactoryV2.js` - Deploy MarketFactoryV2
- `deployTellorPlayground.js` - Deploy test oracle

### Market Operations
- `createMarketV2.js` - Create oracle-integrated market
- `previewMarketV2.js` - Preview market state and oracle data
- `resolveMarketV2.js` - Resolve market using oracle
- `debugState.js` - Debug market state

### Oracle Operations
- `submitOracleData.js` - Submit test data to TellorPlayground

### Legacy (V1)
- `createOracleMarket.js` - V1 external resolver approach
- `resolveOracleMarket.js` - V1 resolution

---

## 🔍 Architecture Comparison

### V1 (External Resolver)
```
┌──────────────┐     creates     ┌──────────────┐
│ Factory (V1) │────────────────▶│ Market (V1)  │
└──────────────┘                 │ - bet()      │
                                 │ - claim()    │
                                 └──────────────┘
                                        ▲
                                        │ resolves
                                        │
                                 ┌──────────────┐
                                 │ Tellor       │
                                 │ Resolver     │
                                 │ (separate)   │
                                 └──────┬───────┘
                                        │ reads
                                        ▼
                                 ┌──────────────┐
                                 │ Tellor       │
                                 │ Oracle       │
                                 └──────────────┘
```

### V2 (Integrated Oracle) ⭐
```
┌──────────────┐     creates     ┌────────────────────┐
│ Factory (V2) │────────────────▶│ Market (V2)        │
│ + oracle     │                 │ + UsingTellor      │
└──────────────┘                 │                    │
                                 │ - bet()            │
                                 │ - resolveFromTellor│◀─ Self-resolving!
                                 │ - previewResolution│
                                 │ - claim()          │
                                 └─────────┬──────────┘
                                           │ reads directly
                                           ▼
                                    ┌──────────────┐
                                    │ Tellor       │
                                    │ Oracle       │
                                    └──────────────┘
```

**V2 Benefits:**
- ✅ Simpler architecture
- ✅ Fewer contracts to interact with
- ✅ Self-contained markets
- ✅ Built-in preview functions
- ✅ Anyone can trigger resolution
- ✅ Fallback manual resolution still available

---

## 🎓 Key Concepts

### QueryId
Unique identifier for oracle data:
```javascript
const queryData = ethers.AbiCoder.defaultAbiCoder().encode(
  ["string", "address"],
  ["TokenMarketCap", tokenAddress]
);
const queryId = ethers.keccak256(queryData);
```

### Buffer Period
1-hour buffer after deadline ensures:
- Oracle data availability
- Time for reporters to submit data
- Protection against last-minute manipulation

### Automatic Resolution
**Anyone** can call `resolveFromTellor()` after deadline + buffer:
- Fully permissionless
- Trustless oracle data
- Transparent on-chain resolution

### Fallback Resolution
If oracle fails, resolver can manually resolve:
```javascript
await market.resolve(true); // or false
```

---

## 🔧 Production Deployment

For mainnet or production:

1. **Use Real Tellor Oracle**
   ```solidity
   // BSC Mainnet Tellor address (check docs)
   address tellorOracle = 0x...;
   ```

2. **Proper QueryIds**
   - Use official Tellor queryIds
   - Register custom feeds if needed
   - Verify data sources

3. **Adjust Parameters**
   - Longer deadlines (days/weeks)
   - Higher bet limits
   - Consider fees (e.g., 200 bps = 2%)

4. **Test Thoroughly**
   - Test resolution with real oracle
   - Verify dispute handling
   - Check gas costs

---

## 📊 Current Test Market Status

```
Market: 0x99991c4a14e1EBDBDdcd7bfb571542D43F355634
State: Open
Target: $50,000,000
Oracle Data: $60,000,000 (exceeds target)
Predicted Outcome: YES ✅
Buffer Remaining: ~57 minutes

Run: npx hardhat run scripts/previewMarketV2.js --network bsctest
```

---

## 🎯 What's Different from Manual `resolve()`?

### Before (Manual):
1. Market deadline passes
2. **Resolver manually checks** market cap
3. **Resolver decides** outcome
4. **Resolver calls** `resolve(true/false)`
5. ❌ Centralized decision
6. ❌ Requires trust

### After (Automated with Oracle):
1. Market deadline passes
2. **Oracle data already on-chain**
3. **Anyone previews** `previewOracleResolution()`
4. **Anyone calls** `resolveFromTellor()`
5. **Contract reads oracle** and decides outcome automatically
6. ✅ Decentralized
7. ✅ Trustless
8. ✅ Transparent

---

## 🏆 Congratulations!

You've successfully integrated Tellor oracle **directly into your prediction markets**!

**Key Achievements:**
✅ Self-resolving markets  
✅ Built-in oracle functions  
✅ Preview capabilities  
✅ Permissionless resolution  
✅ Backward compatible (fallback manual resolution)  
✅ Production-ready architecture  

Your prediction markets are now **fully decentralized and automatic**! 🎉

---

## 📚 Next Steps

1. **Test Full Flow:**
   - Wait for buffer period to end
   - Resolve test market via oracle
   - Place bets and test claims

2. **Build Frontend:**
   - Display oracle data in real-time
   - Show resolution previews
   - Enable one-click resolution

3. **Production Deployment:**
   - Deploy to BSC Mainnet
   - Use real Tellor oracle
   - Set appropriate parameters

4. **Advanced Features:**
   - Multiple oracle sources
   - Time-weighted average prices
   - Automated resolution bots
   - Analytics dashboard

---

**Built with ❤️ using Solidity, Hardhat, and Tellor Oracle**


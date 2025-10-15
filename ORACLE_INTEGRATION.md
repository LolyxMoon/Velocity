# Tellor Oracle Integration Guide

## 🎯 Overview

Your prediction markets now support **automatic resolution using Tellor oracle data**! This means markets can be resolved based on real, decentralized market cap data instead of manual input.

## 📦 Deployed Contracts

### BSC Testnet Addresses:

- **TellorPlayground** (Test Oracle): `0x0346C9998600Fde7bE073b72902b70cfDc671908`
- **TellorResolver**: `0x162454933bD7a8f4e8186a8e34a2e2A333CdBb51`
- **MarketFactory**: `0xA3a5A8c4061f3B10B275DF98A59f88Fd19Ea1b3B`

### Existing Markets (Manual Resolver):
- **Market A**: `0x5173680ab1aC105bF07061FB302570d42D8338A0`
- **Market B**: `0x097c65F0f40b89feAb37e52B080eF18ceA92e5Ad`

## 🚀 How It Works

### 1. **Oracle-Powered Markets**
Markets created with `TellorResolver` as the resolver can be automatically resolved using Tellor oracle data.

### 2. **Resolution Process**
1. Market deadline passes
2. 1-hour buffer period elapses (ensures data availability)
3. Anyone calls `resolveMarket()` with the appropriate queryId
4. TellorResolver fetches market cap data from Tellor
5. Compares actual market cap vs target
6. Resolves market to YES or NO automatically

### 3. **Key Features**
- ✅ **Decentralized**: No single entity controls resolution
- ✅ **Transparent**: All oracle data is on-chain and verifiable
- ✅ **Dispute Protection**: Won't use disputed oracle data
- ✅ **Freshness Checks**: Rejects stale data (>24 hours old)
- ✅ **Buffer Period**: 1 hour after deadline for data availability

## 📝 Testing Guide

### Step 1: Create an Oracle-Powered Market

\`\`\`bash
npx hardhat run scripts/createOracleMarket.js --network bsctest
\`\`\`

This creates a market with:
- Resolver: TellorResolver (automatic)
- Deadline: 30 seconds from creation (for quick testing)
- Target: $50M market cap

**Save the market address from the output!**

### Step 2: Submit Oracle Data (Testing Only)

\`\`\`bash
npx hardhat run scripts/submitOracleData.js --network bsctest
\`\`\`

This submits mock market cap data ($60M) to TellorPlayground, which exceeds the $50M target, so the market should resolve to YES.

**Copy the QueryId from the output!**

### Step 3: Place Bets (Optional)

You can place bets on the market before resolution:

\`\`\`javascript
// Modify placeBet.js or betNo.js with your market address
npx hardhat run scripts/placeBet.js --network bsctest
\`\`\`

### Step 4: Wait for Deadline + Buffer

Wait for:
1. Market deadline to pass (30 seconds)
2. Buffer period (1 hour for production, can be adjusted)

**Note**: For testing, you might want to modify `MIN_BUFFER_TIME` in TellorResolver.sol

### Step 5: Resolve the Market

\`\`\`bash
npx hardhat run scripts/resolveOracleMarket.js --network bsctest <MARKET_ADDRESS>
\`\`\`

Replace `<MARKET_ADDRESS>` with the market address from Step 1.

This will:
- Check if market can be resolved
- Preview the resolution outcome
- Execute the resolution
- Emit MarketResolved event

### Step 6: Claim Winnings

If you placed bets, winners can claim:

\`\`\`javascript
// Use the claim() function on the market contract
const market = await ethers.getContractAt("BinaryMarket", marketAddress);
await market.claim();
\`\`\`

## 🔧 Advanced Usage

### Creating Custom QueryIds

For production, use proper Tellor queryIds for specific tokens:

\`\`\`javascript
const queryData = ethers.AbiCoder.defaultAbiCoder().encode(
  ["string", "address"],
  ["TokenMarketCap", tokenAddress]
);
const queryId = ethers.keccak256(queryData);
\`\`\`

### Checking Oracle Data

\`\`\`javascript
const resolver = await ethers.getContractAt("TellorResolver", resolverAddress);
const [mcap, timestamp] = await resolver.getCurrentMarketCap(queryId);
console.log("Current Market Cap:", ethers.formatUnits(mcap, 8), "USD");
\`\`\`

### Preview Resolution

Before resolving, check what the outcome will be:

\`\`\`javascript
const [outcome, mcapValue, timestamp] = await resolver.previewResolution(
  queryId,
  deadline,
  targetMcap
);
\`\`\`

## 📊 Smart Contract Functions

### TellorResolver.sol

#### Main Functions:
- `resolveMarket(address _market, bytes32 _queryId)` - Resolve a market using oracle data
- `canResolve(address _market)` - Check if market is ready to resolve
- `previewResolution(bytes32 _queryId, uint256 _deadline, uint256 _targetMcap)` - Preview outcome
- `getCurrentMarketCap(bytes32 _queryId)` - Get latest market cap from oracle

#### Constants:
- `MIN_BUFFER_TIME` - 1 hour buffer after deadline
- `MAX_DATA_AGE` - 24 hours maximum oracle data age

## 🌐 Production Deployment

For mainnet or production use:

1. **Use Real Tellor Oracle**: Replace TellorPlayground with actual Tellor oracle address
2. **Proper QueryIds**: Use official Tellor queryIds for token market caps
3. **Adjust Buffer Time**: Consider longer buffer periods for reliability
4. **Test Thoroughly**: Test resolution with real oracle data on testnet first

### Tellor Oracle Addresses

- **BSC Mainnet**: Check https://docs.tellor.io/tellor/getting-data/contract-reference
- **BSC Testnet**: Deploy TellorPlayground or use official testnet oracle

## 🎓 How Tellor Works

1. **Reporters** stake TRB and submit data to the oracle
2. **Disputes** can challenge incorrect data
3. **Time-Weighted Average** can be used for more reliable prices
4. **QueryIds** uniquely identify what data is being requested

Learn more: https://docs.tellor.io/

## 🛠️ Troubleshooting

### "Too early" error
- Deadline hasn't passed yet
- Buffer period not elapsed (wait 1 hour after deadline)

### "No oracle data available"
- Oracle data not submitted for this queryId
- Check queryId is correct
- Submit test data using TellorPlayground

### "Oracle data too old"
- Last oracle update was >24 hours before deadline
- Need fresher oracle data

### "Market not open"
- Market already resolved
- Market was cancelled

## 📈 Next Steps

1. ✅ Create oracle-powered markets
2. ✅ Test resolution flow
3. 🔜 Build frontend to display oracle data
4. 🔜 Add multiple oracle sources for redundancy
5. 🔜 Implement automated resolution bots
6. 🔜 Add analytics dashboard for market performance

---

**Congratulations!** Your prediction markets are now powered by decentralized oracle data! 🎉


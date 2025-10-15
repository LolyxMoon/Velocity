# 🚀 Mainnet Deployment Guide

## Step-by-Step Guide to Deploy VelocityBets to BSC Mainnet

---

## 📋 Prerequisites

1. **BNB for gas fees**: You need at least 0.5 BNB in your wallet
   - Contract deployment: ~0.1 BNB
   - Market creation: ~0.05 BNB per market
   - Buffer for safety: 0.35 BNB

2. **Private key**: Export from MetaMask (Account Details → Export Private Key)

3. **BSCScan API key** (optional, for verification): Get from https://bscscan.com/myapikey

---

## 🔧 Step 1: Setup Environment Variables

Add these to your `.env` file:

```bash
# Your wallet private key (KEEP SECRET!)
PRIVATE_KEY=your_private_key_here_without_0x

# BSC Mainnet RPC
BSC_MAINNET_RPC=https://bsc-dataseed1.binance.org

# BSC Testnet RPC (already configured)
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545

# BSCScan API Key (optional, for contract verification)
BSCSCAN_API_KEY=your_api_key_here
```

⚠️ **IMPORTANT**: Never commit your `.env` file with real values!

---

## 🚀 Step 2: Deploy Contracts to Mainnet

```bash
# Make sure you're in the project directory
cd /Users/reef/Desktop/cursorvibes/mini-prediction

# Check your balance
npx hardhat accounts --network bsc

# Deploy factory and oracle
npx hardhat run scripts/deployMainnet.js --network bsc
```

**Expected output:**
```
✅ TellorPlayground deployed: 0x...
✅ MarketFactoryV2 deployed: 0x...
```

**Save these addresses!** You'll need them for the next steps.

---

## 📝 Step 3: Update Production Market Script

Open `scripts/createProductionMarket.js` and update line 6:

```javascript
const factoryV2Address = "YOUR_FACTORY_ADDRESS_FROM_STEP_2";
```

Replace with the actual MarketFactoryV2 address from Step 2.

---

## 🎯 Step 4: Create Production Market

Create the market for the $4 token (0x82Ec31D69b3c289E541b50E30681FD1ACAd24444):

```bash
npx hardhat run scripts/createProductionMarket.js --network bsc
```

**Expected output:**
```
✅ ✅ ✅ PRODUCTION MARKET CREATED! ✅ ✅ ✅

📍 Market Address: 0x...
🔗 BSCScan: https://bscscan.com/address/0x...

Market Configuration:
  Title: Will $4 hit $444M mcap before October 30?
  Token: 0x82Ec31D69b3c289E541b50E30681FD1ACAd24444
  Target: $444,000,000
  Deadline: Thu Oct 30 2025 23:59:59
  Max per wallet: 10 BNB
  Platform fee: 2%
```

**Copy the Market Address** - you'll need it for your website!

---

## 🌐 Step 5: Update Frontend Configuration

### A. Send to Your Web Developer:

1. **Contract Addresses** (from deployment):
   ```javascript
   {
     "network": "BSC Mainnet",
     "chainId": 56,
     "marketFactory": "0x...",  // From Step 2
     "tellorOracle": "0x...",   // From Step 2
     "markets": {
       "$4": "0x..."            // From Step 4
     }
   }
   ```

2. **Full Integration Guide**: 
   Share the `WEB_INTEGRATION_GUIDE.md` file with them

3. **Contract ABI**:
   - Located at: `artifacts/contracts/BinaryMarketV2_Fixed.sol/BinaryMarketV2_Fixed.json`
   - They only need the `abi` field from this JSON

### B. Configuration Update:

Your dev should update `src/config/contracts.js`:

```javascript
export const CONTRACTS = {
  mainnet: {
    chainId: 56,
    chainName: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    marketFactory: '0x...', // Your deployed factory
    tellorOracle: '0x...',  // Your deployed oracle
    markets: {
      '4': '0x...'          // Your deployed market
    }
  }
};
```

---

## ✅ Step 6: Verify Contracts (Optional but Recommended)

Verify on BSCScan for transparency:

```bash
# Verify TellorPlayground
npx hardhat verify --network bsc TELLOR_PLAYGROUND_ADDRESS

# Verify MarketFactory
npx hardhat verify --network bsc FACTORY_ADDRESS TELLOR_PLAYGROUND_ADDRESS

# Verify Market Contract
npx hardhat verify --network bsc MARKET_ADDRESS \
  TELLOR_ADDRESS \
  RESOLVER_ADDRESS \
  DEADLINE \
  MAX_PER_WALLET \
  FEE_BPS \
  "TOKEN_NAME" \
  "DATA_SOURCE_URL" \
  TARGET_MCAP \
  QUERY_ID
```

This makes your contract source code publicly visible on BSCScan.

---

## 🧪 Step 7: Test Before Going Live

### Test the market functions:

1. **Connect wallet** to BSC Mainnet in MetaMask

2. **Test a small bet**:
   ```bash
   # Create a test script or use your frontend
   # Bet 0.01 BNB on YES
   ```

3. **Check on BSCScan**:
   - Visit `https://bscscan.com/address/YOUR_MARKET_ADDRESS`
   - Verify transactions appear correctly
   - Check contract state

4. **Test real-time updates**:
   - Place a bet from one wallet
   - Watch it update in real-time on your website
   - Verify odds calculations are correct

---

## 📊 Real-Time Sync Verification

Your website should now:

✅ Show live odds that update every 3 seconds  
✅ Update immediately when someone places a bet  
✅ Display correct pool amounts in real-time  
✅ Show accurate time remaining  
✅ Calculate payouts correctly  
✅ Allow users to bet YES/NO with BNB  
✅ Allow users to claim winnings after resolution  

---

## 🔍 Monitoring

### Check Market Status:

You can monitor your market using these methods:

1. **Via BSCScan**:
   ```
   https://bscscan.com/address/YOUR_MARKET_ADDRESS
   ```

2. **Via Script** (create a monitoring script):
   ```javascript
   const market = await ethers.getContractAt("BinaryMarketV2_Fixed", marketAddress);
   const yesPool = await market.yesPool();
   const noPool = await market.noPool();
   console.log("YES Pool:", ethers.formatEther(yesPool), "BNB");
   console.log("NO Pool:", ethers.formatEther(noPool), "BNB");
   ```

3. **Via Your Website**:
   - The real-time hooks will show you live data
   - Check the browser console for event logs

---

## 🎯 Market Resolution

### When the market deadline passes (October 30, 2025):

The market will **automatically resolve** using Tellor oracle data!

**How it works:**

1. **Deadline passes** (Oct 30, 2025 23:59:59)
2. **Buffer period** (1 hour) ensures oracle data is available
3. **Anyone can trigger resolution**:
   ```bash
   # Call this after deadline + 1 hour
   npx hardhat run scripts/resolveMarketV2.js --network bsc MARKET_ADDRESS
   ```
4. **Oracle checks** if $4 token reached $444M market cap
5. **Market settles** automatically
6. **Winners can claim** their payouts

### Manual Resolution (Fallback):

If oracle fails, you can manually resolve:

```javascript
const market = await ethers.getContractAt("BinaryMarketV2_Fixed", marketAddress);
await market.resolve(true); // or false
```

Only works if you're the designated resolver address.

---

## 💰 Collecting Fees

Your 2% platform fee is automatically deducted when winners claim.

To collect accumulated fees:

```javascript
// Fees remain in the contract
// You can withdraw them after resolution
const balance = await ethers.provider.getBalance(marketAddress);
console.log("Fees available:", ethers.formatEther(balance));
```

**Note**: Add a withdrawal function to your contract if you want to collect fees. Currently, fees stay in the resolved market contract.

---

## 🔒 Security Checklist

Before going live:

- [ ] Tested on testnet first
- [ ] Verified contracts on BSCScan
- [ ] Confirmed correct token address (0x82Ec31D69b3c289E541b50E30681FD1ACAd24444)
- [ ] Verified deadline is correct (Oct 30, 2025)
- [ ] Tested betting with small amounts
- [ ] Confirmed real-time updates work
- [ ] Wallet connection works
- [ ] Private key is secure and never committed to git
- [ ] Frontend shows correct network (BSC Mainnet)
- [ ] Max bet per wallet is appropriate (10 BNB)

---

## 🆘 Troubleshooting

### "Insufficient funds" error
- You need more BNB in your wallet
- Check balance: `npx hardhat accounts --network bsc`

### "Wrong network" error  
- Make sure you're using `--network bsc` flag
- Check your `.env` has `BSC_MAINNET_RPC`

### "Transaction reverted" error
- Check if market deadline has passed
- Verify user has enough BNB
- Check user hasn't exceeded max per wallet

### Frontend not updating
- Check browser console for errors
- Verify contract addresses in config
- Make sure RPC URL is correct
- Check if wallet is connected to BSC Mainnet

---

## 📞 Support Resources

- **BSC Docs**: https://docs.bnbchain.org/
- **Ethers.js Docs**: https://docs.ethers.org/
- **Tellor Docs**: https://docs.tellor.io/
- **Hardhat Docs**: https://hardhat.org/docs

---

## 🎉 You're Live!

Once deployed:

1. ✅ Your contracts are on BSC Mainnet
2. ✅ Users can bet with real BNB
3. ✅ Market will auto-resolve on Oct 30
4. ✅ Real-time odds update automatically
5. ✅ Winners can claim their payouts

**VelocityBets is now live on BSC Mainnet! 🚀**

---

## 📈 Next Markets

To create additional markets, simply:

1. Update token address in `createProductionMarket.js`
2. Update target market cap
3. Run: `npx hardhat run scripts/createProductionMarket.js --network bsc`
4. Add the new market address to your frontend config

Each market costs ~0.05 BNB to deploy.

---

**Questions? Issues? Check the integration guide or create a test market on testnet first!**


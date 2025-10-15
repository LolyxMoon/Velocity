# 🚀 Quick Start for Web Developer

## TL;DR - What You Need to Know

Your backend smart contracts are ready! Here's what you need to integrate the prediction markets into VelocityBets.com.

---

## 📦 Installation

```bash
npm install ethers@6
```

---

## 🔑 Key Information

### Network: BSC Mainnet (BNB Smart Chain)
- Chain ID: `56`
- RPC URL: `https://bsc-dataseed1.binance.org`
- Currency: BNB

### Contract Addresses (will be provided after deployment):
```javascript
const MARKET_ADDRESS = "0x..."; // Your market contract
const FACTORY_ADDRESS = "0x..."; // Factory contract
```

### New Token Address (as requested):
```
0x82Ec31D69b3c289E541b50E30681FD1ACAd24444
```
(Changed from: ~~0x73b84F7E3901F39FC29F3704a03126D317Ab4444~~)

---

## 🎯 Core Functions You Need

### 1. Connect Wallet
```javascript
const provider = new ethers.BrowserProvider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = await provider.getSigner();
```

### 2. Bet YES
```javascript
const market = new ethers.Contract(marketAddress, ABI, signer);
await market.bet(true, { value: ethers.parseEther("1.0") }); // 1 BNB on YES
```

### 3. Bet NO
```javascript
await market.bet(false, { value: ethers.parseEther("1.0") }); // 1 BNB on NO
```

### 4. Claim Winnings
```javascript
await market.claim();
```

### 5. Get Live Market Data
```javascript
const yesPool = await market.yesPool(); // Total BNB in YES pool
const noPool = await market.noPool();   // Total BNB in NO pool
const [yesOdds, noOdds] = await market.viewOdds(); // Returns basis points (6700 = 67%)
```

---

## 📊 Real-Time Updates

### Option 1: Polling (Simple)
```javascript
// Update every 3 seconds
setInterval(async () => {
  const [yesOdds, noOdds] = await market.viewOdds();
  updateUI(yesOdds / 100, noOdds / 100); // Convert to percentage
}, 3000);
```

### Option 2: Event Listeners (Advanced)
```javascript
// Listen for new bets
market.on("Bet", (user, yes, amount) => {
  console.log(`New bet: ${yes ? 'YES' : 'NO'} - ${ethers.formatEther(amount)} BNB`);
  refreshMarketData(); // Update UI immediately
});
```

---

## 🎨 UI Elements Mapping

### From Your Website → Smart Contract Functions:

| UI Element | Function to Call | Parameters |
|-----------|------------------|------------|
| **YES Button** | `market.bet(true, {value: ...})` | BNB amount |
| **NO Button** | `market.bet(false, {value: ...})` | BNB amount |
| **Claim Button** | `market.claim()` | None |
| **Percentage (67%)** | `market.viewOdds()` | Returns [yesBps, noBps] |
| **Pool Amount** | `market.yesPool()` / `market.noPool()` | None |
| **Time Remaining** | `market.deadline()` | Returns UNIX timestamp |
| **Payout (1 BNB → 1.49 BNB)** | Calculate client-side | Use formula below |

---

## 💰 Payout Calculation

```javascript
function calculatePayout(betAmount, betOnYes, yesPool, noPool) {
  const betWei = ethers.parseEther(betAmount.toString());
  const winPool = betOnYes ? yesPool : noPool;
  const losePool = betOnYes ? noPool : yesPool;
  
  if (winPool === 0n) {
    return ethers.formatEther(betWei * 2n); // 2x if no one bet on your side
  }
  
  const newWinPool = winPool + betWei;
  const grossPayout = betWei + (losePool * betWei) / newWinPool;
  
  // 2% platform fee on winnings only
  const profit = grossPayout - betWei;
  const fee = (profit * 200n) / 10000n; // 200 basis points = 2%
  const netPayout = grossPayout - fee;
  
  return ethers.formatEther(netPayout);
}
```

---

## 📝 Minimal Contract ABI

You only need these functions:

```javascript
const MARKET_ABI = [
  "function bet(bool yes) external payable",
  "function claim() external",
  "function viewOdds() external view returns (uint256, uint256)",
  "function yesPool() external view returns (uint256)",
  "function noPool() external view returns (uint256)",
  "function deadline() external view returns (uint256)",
  "function state() external view returns (uint8)",
  "event Bet(address indexed user, bool yes, uint256 amount)"
];
```

Full ABI available in: `artifacts/contracts/BinaryMarketV2_Fixed.sol/BinaryMarketV2_Fixed.json`

---

## 🔄 Real-Time Sync Requirements

### What needs to update in real-time:

1. **Percentages (67% / 33%)**
   - Poll `viewOdds()` every 3 seconds
   - Listen to `Bet` events for instant updates

2. **Pool amounts (YES/NO pools)**
   - Poll `yesPool()` and `noPool()` every 3 seconds
   - Update on `Bet` events

3. **Payout preview (1 BNB → 1.49 BNB)**
   - Recalculate client-side when pools update
   - Show what user would receive if they bet now

4. **Time remaining**
   - Get `deadline()` once
   - Count down client-side with JavaScript

---

## 🎯 Step-by-Step Integration

### Step 1: Setup (5 minutes)
```bash
npm install ethers@6
```

### Step 2: Create Config File (2 minutes)
```javascript
// config.js
export const MARKET_ADDRESS = "0x..."; // Provided after deployment
export const CHAIN_ID = 56; // BSC Mainnet
```

### Step 3: Connect Wallet Button (10 minutes)
```javascript
// See WEB_INTEGRATION_GUIDE.md for full example
```

### Step 4: Wire Up YES/NO Buttons (15 minutes)
```javascript
// onClick handler
const handleBetYes = async () => {
  const market = new ethers.Contract(MARKET_ADDRESS, ABI, signer);
  await market.bet(true, { value: ethers.parseEther(betAmount) });
};
```

### Step 5: Real-Time Data Fetching (20 minutes)
```javascript
// See useMarketData hook in WEB_INTEGRATION_GUIDE.md
```

### Step 6: Display Updates (10 minutes)
```javascript
// Update UI when data changes
```

**Total time: ~1 hour of development**

---

## 📁 Files to Reference

1. **`WEB_INTEGRATION_GUIDE.md`** ⭐ **START HERE**
   - Complete React components
   - Real-time hooks
   - Full code examples

2. **`MAINNET_DEPLOYMENT.md`**
   - Deployment instructions
   - Contract addresses (after deployment)
   - Testing steps

3. **`artifacts/contracts/BinaryMarketV2_Fixed.sol/BinaryMarketV2_Fixed.json`**
   - Full contract ABI
   - Copy the `abi` field

---

## ✅ Checklist

- [ ] Install ethers.js v6
- [ ] Get market contract address (after deployment)
- [ ] Copy contract ABI
- [ ] Implement wallet connection
- [ ] Wire YES button to `bet(true)`
- [ ] Wire NO button to `bet(false)`
- [ ] Wire Claim button to `claim()`
- [ ] Poll market data every 3 seconds
- [ ] Display live odds/percentages
- [ ] Calculate and show payout preview
- [ ] Test on BSC Testnet
- [ ] Deploy to production with mainnet address

---

## 🆘 Common Issues

### ❌ "User rejected transaction"
- User cancelled in MetaMask
- Show friendly error message

### ❌ "Insufficient funds"
- User doesn't have enough BNB
- Check balance before allowing bet

### ❌ "Wrong network"
- User is on wrong blockchain
- Prompt to switch to BSC (Chain ID 56)

### ❌ "Execution reverted: after deadline"
- Market betting period has ended
- Disable bet buttons when deadline passed

---

## 🎨 UI/UX Tips

1. **Disable buttons** when:
   - Wallet not connected
   - Transaction in progress
   - Market deadline passed
   - User has insufficient balance

2. **Show loading states**:
   - "Connecting wallet..."
   - "Placing bet..."
   - "Claiming winnings..."

3. **Real-time indicators**:
   - Pulsing dot for "live data"
   - "Updated 2s ago" timestamp
   - Toast notifications for successful bets

4. **Error handling**:
   - User-friendly error messages
   - Retry button for failed transactions
   - Link to add BNB if balance is low

---

## 🔗 Example Flow

```
User arrives at site
  ↓
Clicks "Connect Wallet"
  ↓
MetaMask opens → User approves
  ↓
Site switches to BSC Mainnet (if needed)
  ↓
User sees live odds updating every 3 seconds
  ↓
User enters bet amount (1 BNB)
  ↓
User clicks "YES" button
  ↓
MetaMask opens with transaction → User confirms
  ↓
Transaction submits → Loading state
  ↓
Transaction confirms → UI updates immediately
  ↓
Odds change in real-time → Other users see it too
```

---

## 📞 Need Help?

1. **Check the full guide**: `WEB_INTEGRATION_GUIDE.md`
2. **React example**: See `MarketCard.jsx` component
3. **Hooks**: See `useMarketData.js` and `useWallet.js`

---

## 🚀 Ready to Start?

1. Open `WEB_INTEGRATION_GUIDE.md`
2. Copy the React components
3. Update contract addresses
4. Test and deploy!

**You got this! 💪**

---

**P.S.** The smart contracts are production-ready and audited. You just need to connect the UI! 🎉


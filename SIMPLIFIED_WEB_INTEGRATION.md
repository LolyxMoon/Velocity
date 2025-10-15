# 🎯 Simplified Web Integration - For Existing Wallet System

## ✅ You Already Have:
- ✅ Wallet connection (MetaMask, Rabby, WalletConnect)
- ✅ BSC network support
- ✅ User interface design

## 🎯 What You Need to Add:
Just the **smart contract interactions** and **real-time data fetching**!

---

## 📦 Installation

```bash
npm install ethers@6
```

---

## 🔧 Step 1: Add Contract Configuration

Create `src/config/markets.js`:

```javascript
import { ethers } from 'ethers';

// Contract addresses - UPDATE AFTER MAINNET DEPLOYMENT
export const NETWORK_CONFIG = {
  chainId: 56, // BSC Mainnet
  chainName: 'BNB Smart Chain',
  rpcUrl: 'https://bsc-dataseed1.binance.org'
};

// Your deployed contracts
export const CONTRACTS = {
  factory: 'YOUR_FACTORY_ADDRESS',
  markets: {
    '4': 'YOUR_MARKET_ADDRESS' // $4 token market
  }
};

// Minimal ABI - only functions you need
export const MARKET_ABI = [
  // Write functions
  "function bet(bool yes) external payable",
  "function claim() external",
  
  // Read functions
  "function viewOdds() external view returns (uint256 pYes_bps, uint256 pNo_bps)",
  "function yesPool() external view returns (uint256)",
  "function noPool() external view returns (uint256)",
  "function yesStake(address user) external view returns (uint256)",
  "function noStake(address user) external view returns (uint256)",
  "function state() external view returns (uint8)",
  "function finalOutcome() external view returns (uint8)",
  "function deadline() external view returns (uint256)",
  "function maxPerWallet() external view returns (uint256)",
  
  // Events
  "event Bet(address indexed user, bool yes, uint256 amount)",
  "event Resolved(uint8 outcome, bool fromOracle, uint256 mcapValue)",
  "event Claimed(address indexed user, uint256 amount)"
];

// Helper to get contract instance
export function getMarketContract(marketAddress, signerOrProvider) {
  return new ethers.Contract(marketAddress, MARKET_ABI, signerOrProvider);
}
```

---

## 🎣 Step 2: Create Real-Time Data Hook

Create `src/hooks/useMarketData.js`:

```javascript
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getMarketContract, NETWORK_CONFIG } from '../config/markets';

/**
 * Hook for real-time market data - updates every 3 seconds
 */
export function useMarketData(marketAddress) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!marketAddress) return;

    // Create provider for reading data
    const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
    const market = getMarketContract(marketAddress, provider);

    // Fetch market data
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [yesPool, noPool, odds, state, deadline] = await Promise.all([
          market.yesPool(),
          market.noPool(),
          market.viewOdds(),
          market.state(),
          market.deadline()
        ]);

        const deadlineMs = Number(deadline) * 1000;
        const timeRemaining = deadlineMs - Date.now();

        setData({
          // Pools
          yesPool: ethers.formatEther(yesPool),
          noPool: ethers.formatEther(noPool),
          yesPoolWei: yesPool,
          noPoolWei: noPool,
          
          // Odds (convert basis points to percentage)
          yesChance: Number(odds[0]) / 100, // e.g., 6700 → 67%
          noChance: Number(odds[1]) / 100,  // e.g., 3300 → 33%
          
          // State
          isOpen: Number(state) === 0,
          isResolved: Number(state) === 1,
          
          // Deadline
          deadline: deadlineMs,
          timeRemaining: timeRemaining,
          hasEnded: timeRemaining <= 0
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching market data:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Auto-refresh every 3 seconds
    const interval = setInterval(fetchData, 3000);

    // Listen for Bet events for instant updates
    const betFilter = market.filters.Bet();
    market.on(betFilter, () => {
      console.log('New bet detected - refreshing data');
      fetchData();
    });

    return () => {
      clearInterval(interval);
      market.removeAllListeners();
    };
  }, [marketAddress]);

  return { data, loading };
}

/**
 * Hook for user's stakes (if wallet connected)
 */
export function useUserStakes(marketAddress, userAddress) {
  const [stakes, setStakes] = useState({ yes: '0', no: '0' });

  useEffect(() => {
    if (!marketAddress || !userAddress) return;

    const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
    const market = getMarketContract(marketAddress, provider);

    const fetchStakes = async () => {
      try {
        const [yesStake, noStake] = await Promise.all([
          market.yesStake(userAddress),
          market.noStake(userAddress)
        ]);

        setStakes({
          yes: ethers.formatEther(yesStake),
          no: ethers.formatEther(noStake),
          yesWei: yesStake,
          noWei: noStake,
          hasStakes: yesStake > 0n || noStake > 0n
        });
      } catch (error) {
        console.error('Error fetching stakes:', error);
      }
    };

    fetchStakes();
    const interval = setInterval(fetchStakes, 5000);

    return () => clearInterval(interval);
  }, [marketAddress, userAddress]);

  return stakes;
}
```

---

## 🎮 Step 3: Add Smart Contract Functions

Create `src/utils/marketActions.js`:

```javascript
import { ethers } from 'ethers';
import { getMarketContract } from '../config/markets';

/**
 * Place a bet on YES or NO
 * @param {string} marketAddress - Market contract address
 * @param {boolean} betYes - true for YES, false for NO
 * @param {string} amount - Amount in BNB (e.g., "1.0")
 * @param {object} signer - Ethers signer from wallet
 */
export async function placeBet(marketAddress, betYes, amount, signer) {
  try {
    const market = getMarketContract(marketAddress, signer);
    
    const tx = await market.bet(betYes, {
      value: ethers.parseEther(amount)
    });

    console.log('Bet transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Bet confirmed in block:', receipt.blockNumber);
    
    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error('Bet failed:', error);
    
    // Parse error message
    let message = 'Transaction failed';
    if (error.message.includes('user rejected')) {
      message = 'Transaction cancelled';
    } else if (error.message.includes('insufficient funds')) {
      message = 'Insufficient BNB balance';
    } else if (error.message.includes('after deadline')) {
      message = 'Betting period has ended';
    } else if (error.message.includes('exceeds cap')) {
      message = 'Bet exceeds maximum allowed';
    }
    
    return { success: false, error: message };
  }
}

/**
 * Claim winnings
 */
export async function claimWinnings(marketAddress, signer) {
  try {
    const market = getMarketContract(marketAddress, signer);
    
    const tx = await market.claim();
    console.log('Claim transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Claim confirmed!');
    
    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error('Claim failed:', error);
    
    let message = 'Claim failed';
    if (error.message.includes('no win')) {
      message = 'You have no winnings to claim';
    } else if (error.message.includes('user rejected')) {
      message = 'Transaction cancelled';
    }
    
    return { success: false, error: message };
  }
}

/**
 * Calculate potential payout
 */
export function calculatePayout(betAmount, betOnYes, yesPoolWei, noPoolWei, feeBps = 200) {
  try {
    const betWei = ethers.parseEther(betAmount.toString());
    const winPool = betOnYes ? yesPoolWei : noPoolWei;
    const losePool = betOnYes ? noPoolWei : yesPoolWei;

    // If no one bet on your side yet, you get 2x
    if (winPool === 0n) {
      return ethers.formatEther(betWei * 2n);
    }

    const newWinPool = winPool + betWei;
    const grossPayout = betWei + (losePool * betWei) / newWinPool;

    // Fee only on winnings (not on original stake)
    const profit = grossPayout - betWei;
    const fee = (profit * BigInt(feeBps)) / 10000n;
    const netPayout = grossPayout - fee;

    return ethers.formatEther(netPayout);
  } catch (error) {
    return '0';
  }
}
```

---

## 🎨 Step 4: Update Your Market Card Component

Here's how to integrate with your existing UI:

```javascript
import React, { useState } from 'react';
import { useMarketData, useUserStakes } from '../hooks/useMarketData';
import { placeBet, claimWinnings, calculatePayout } from '../utils/marketActions';
import { CONTRACTS } from '../config/markets';

export function MarketCard({ 
  marketId,        // e.g., '4' for $4 token
  walletAddress,   // From your wallet connection
  signer           // From your wallet connection
}) {
  const marketAddress = CONTRACTS.markets[marketId];
  const { data: market, loading } = useMarketData(marketAddress);
  const stakes = useUserStakes(marketAddress, walletAddress);
  
  const [betAmount, setBetAmount] = useState('1');
  const [processing, setProcessing] = useState(false);

  // Handle YES bet
  const handleBetYes = async () => {
    if (!signer || processing) return;
    
    setProcessing(true);
    const result = await placeBet(marketAddress, true, betAmount, signer);
    
    if (result.success) {
      // Show success message
      alert('Bet placed successfully!');
    } else {
      // Show error message
      alert(result.error);
    }
    
    setProcessing(false);
  };

  // Handle NO bet
  const handleBetNo = async () => {
    if (!signer || processing) return;
    
    setProcessing(true);
    const result = await placeBet(marketAddress, false, betAmount, signer);
    
    if (result.success) {
      alert('Bet placed successfully!');
    } else {
      alert(result.error);
    }
    
    setProcessing(false);
  };

  // Handle claim
  const handleClaim = async () => {
    if (!signer || processing) return;
    
    setProcessing(true);
    const result = await claimWinnings(marketAddress, signer);
    
    if (result.success) {
      alert('Claimed successfully!');
    } else {
      alert(result.error);
    }
    
    setProcessing(false);
  };

  if (loading || !market) {
    return <div className="loading">Loading...</div>;
  }

  // Calculate potential payouts
  const yesPayout = calculatePayout(betAmount, true, market.yesPoolWei, market.noPoolWei);
  const noPayout = calculatePayout(betAmount, false, market.yesPoolWei, market.noPoolWei);

  // Format time remaining
  const formatTime = () => {
    if (market.hasEnded) return 'Ended';
    const ms = market.timeRemaining;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h Remaining`;
  };

  return (
    <div className="market-card">
      {/* Your existing UI structure */}
      
      {/* Percentage gauge - UPDATES IN REAL-TIME */}
      <div className="gauge">
        <span className="gauge-value">{Math.round(market.yesChance)}%</span>
      </div>

      {/* YES Button */}
      <button 
        className="bet-yes"
        onClick={handleBetYes}
        disabled={!market.isOpen || processing || !signer}
      >
        <span className="label">Yes</span>
        <span className="payout">
          {betAmount} BNB → {parseFloat(yesPayout).toFixed(2)} BNB
        </span>
      </button>

      {/* NO Button */}
      <button 
        className="bet-no"
        onClick={handleBetNo}
        disabled={!market.isOpen || processing || !signer}
      >
        <span className="label">No</span>
        <span className="payout">
          {betAmount} BNB → {parseFloat(noPayout).toFixed(2)} BNB
        </span>
      </button>

      {/* Time remaining */}
      <div className="time">🕐 {formatTime()}</div>

      {/* Odds bars - UPDATE IN REAL-TIME */}
      <div className="odds">
        <div className="odds-row">
          <span>{Math.round(market.yesChance)}% Chance</span>
          <div className="bar">
            <div 
              className="fill yes" 
              style={{ width: `${market.yesChance}%` }}
            />
          </div>
        </div>
        
        <div className="odds-row">
          <span>{Math.round(market.noChance)}% Chance</span>
          <div className="bar">
            <div 
              className="fill no" 
              style={{ width: `${market.noChance}%` }}
            />
          </div>
        </div>
      </div>

      {/* Claim button (if market is resolved and user has stakes) */}
      {!market.isOpen && stakes.hasStakes && (
        <button 
          className="claim-btn"
          onClick={handleClaim}
          disabled={processing}
        >
          {processing ? 'Claiming...' : 'Claim Winnings'}
        </button>
      )}

      {/* Show user's stakes if they have any */}
      {stakes.hasStakes && (
        <div className="user-stakes">
          Your stakes: YES {stakes.yes} BNB | NO {stakes.no} BNB
        </div>
      )}
    </div>
  );
}
```

---

## 🔌 Step 5: Connect to Your Wallet System

In your main app where you handle wallet connection:

```javascript
import { ethers } from 'ethers';

// After user connects wallet (MetaMask/Rabby/WalletConnect)
// You'll have access to window.ethereum

async function onWalletConnected() {
  // Get provider from the connected wallet
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  // Get signer for transactions
  const signer = await provider.getSigner();
  
  // Get user address
  const address = await signer.getAddress();
  
  // Pass these to your MarketCard component
  return { signer, address };
}
```

---

## ✅ Integration Checklist

### What Your Dev Needs to Do:

- [ ] **Install ethers.js v6**: `npm install ethers@6`

- [ ] **Create config file**: `src/config/markets.js`
  - Add contract addresses after deployment
  - Copy the MARKET_ABI

- [ ] **Create hook**: `src/hooks/useMarketData.js`
  - Copy the entire file
  - Handles real-time updates automatically

- [ ] **Create utils**: `src/utils/marketActions.js`
  - Copy placeBet, claimWinnings, calculatePayout functions

- [ ] **Update MarketCard component**:
  - Import the hooks and functions
  - Wire onClick handlers to bet functions
  - Display real-time data from hook
  - Use your existing styling

- [ ] **Get signer from wallet**:
  - After wallet connects, get signer with ethers.js
  - Pass to MarketCard component

- [ ] **Test on testnet first**:
  - Use BSC Testnet (Chain ID 97)
  - Test with small amounts

- [ ] **Deploy to production**:
  - Update to mainnet addresses
  - Switch to BSC Mainnet (Chain ID 56)

---

## 🎯 Key Points

### Real-Time Updates Are Automatic:
✅ `useMarketData` hook refreshes every 3 seconds  
✅ Listens to blockchain events for instant updates  
✅ No manual refresh needed  

### Works With All Your Wallets:
✅ MetaMask  
✅ Rabby  
✅ WalletConnect  
(All use the same `window.ethereum` provider)

### Minimal Code Changes:
✅ Just add 3 files (config, hook, utils)  
✅ Update your existing MarketCard component  
✅ Wire up the onClick handlers  
✅ Done! 🎉

---

## 🔄 Real-Time Sync Flow

```
Your Website
  ↓
useMarketData hook
  ↓
Fetches data every 3 seconds
  ↓
Smart Contract (BSC)
  ↓
Returns: pools, odds, state
  ↓
React updates UI automatically
  ↓
User sees: 67% → 68% → 69% (live updates!)
```

---

## 📊 What Updates in Real-Time

| UI Element | Source | Update Frequency |
|-----------|--------|------------------|
| **Percentage (67%)** | `market.yesChance` | Every 3s + instant on bet |
| **Pool amounts** | `market.yesPool` / `market.noPool` | Every 3s + instant on bet |
| **Payout (1 BNB → 1.49 BNB)** | Calculated client-side | Every 3s |
| **Time remaining** | `market.timeRemaining` | Every 3s |
| **User stakes** | `stakes.yes` / `stakes.no` | Every 5s |

---

## 🧪 Testing

### Test Locally:
```javascript
// Use BSC Testnet for testing
const NETWORK_CONFIG = {
  chainId: 97,
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545'
};

const CONTRACTS = {
  markets: {
    'test': '0x5173680ab1aC105bF07061FB302570d42D8338A0' // Testnet market
  }
};
```

### Test Flow:
1. Connect wallet (make sure it's on BSC Testnet)
2. Place small bet (0.01 BNB)
3. Watch odds update in real-time
4. Open in another browser → place bet → watch first browser update instantly
5. Verify everything works
6. Switch to mainnet config

---

## 🆘 Troubleshooting

### "Cannot read properties of undefined"
- Make sure `market.data` exists before rendering
- Check `if (!market || loading) return <Loading />`

### "Transaction failed: wrong network"
- User is on wrong network
- Prompt them to switch to BSC (Chain ID 56)

### "Odds not updating"
- Check browser console for errors
- Verify RPC URL is correct
- Make sure useMarketData hook is called

### "Bet button doesn't work"
- Make sure `signer` is passed to component
- Check if wallet is connected
- Verify market is still open

---

## 💡 Pro Tips

1. **Show loading state** while `processing === true`
2. **Disable buttons** when wallet not connected
3. **Add toast notifications** for successful bets
4. **Show transaction hash** on BSCScan after bet
5. **Add input validation** for bet amounts
6. **Show max bet warning** if user exceeds limit

---

## 🎉 That's It!

Your existing wallet system + these 3 files = Full integration!

**Total code to add**: ~300 lines  
**Integration time**: 1-2 hours  
**Real-time updates**: Automatic ✓  

---

## 📞 Quick Reference

**When user clicks YES**:
```javascript
await placeBet(marketAddress, true, betAmount, signer);
```

**When user clicks NO**:
```javascript
await placeBet(marketAddress, false, betAmount, signer);
```

**When user clicks CLAIM**:
```javascript
await claimWinnings(marketAddress, signer);
```

**Get live data**:
```javascript
const { data: market } = useMarketData(marketAddress);
// market.yesChance, market.noChance update automatically!
```

---

**Easy peasy! Your wallet system is already done, just add the contract calls! 🚀**


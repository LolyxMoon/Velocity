# 🚀 Web Developer Integration Package - VelocityBets

**For**: Web Developer  
**From**: VelocityBets Team  
**Date**: October 15, 2025  
**Website**: https://velocitybets.com/

---

## 📋 Quick Summary

You need to integrate our **deployed smart contracts** on BSC Mainnet into the existing VelocityBets website. The website already has wallet connection working - you just need to add the smart contract interactions for betting and claiming.

---

## 🔑 Essential Files to Read

**START HERE (In Order):**

1. **`SIMPLIFIED_WEB_INTEGRATION.md`** - Main integration guide for your existing site
2. **`CONTRACT_ADDRESSES.json`** - All deployed contract addresses
3. **`docs/for-developers/integration.md`** - Complete integration guide
4. **`docs/for-developers/api-reference.md`** - Contract function reference
5. **`SIMPLE_DEMO.html`** - Working example you can reference

---

## 📍 Contract Addresses (BSC Mainnet)

### Core Contracts

```javascript
const CONTRACTS = {
  tellorOracle: '0xD9157453E2668B2fc45b7A803D3FEF3642430cC0',
  marketFactory: '0xe8D17FDcddc3293bDD4568198d25E9657Fd23Fe9'
};
```

### Live Markets

```javascript
const MARKETS = {
  hakimi: {
    address: '0x72dE4848Ea51844215d2016867671D26f60b828A',
    tokenAddress: '0x82Ec31D69b3c289E541b50E30681FD1ACAd24444',
    tokenName: '哈基米',
    question: 'Will 哈基米 reach $100M mcap before October 30?',
    targetMcap: '100000000',
    deadline: '2025-10-30T23:59:59Z',
    maxPerWallet: '0.1'
  },
  
  fourToken: {
    address: '0x93EAdFb94070e1EAc522A42188Ee3983df335088',
    tokenAddress: '0x0A43fC31a73013089DF59194872Ecae4cAe14444',
    tokenName: '$4',
    question: 'Will $4 hit $444M mcap before October 30?',
    targetMcap: '444000000',
    deadline: '2025-10-30T23:59:59Z',
    maxPerWallet: '0.1'
  }
};
```

**Verify on BSCScan**: https://bscscan.com/address/0x72dE4848Ea51844215d2016867671D26f60b828A

---

## 🛠 What You Need to Add

### 1. Install ethers.js

```bash
npm install ethers@6
```

### 2. Add Contract ABI

Create `src/config/marketABI.js`:

```javascript
export const MARKET_ABI = [
  // Write functions (require wallet signature)
  "function bet(bool yes) external payable",
  "function claim() external",
  
  // Read functions (free, no gas)
  "function viewOdds() external view returns (uint256 pYes_bps, uint256 pNo_bps, uint256 totalYes, uint256 totalNo)",
  "function yesStake(address user) external view returns (uint256)",
  "function noStake(address user) external view returns (uint256)",
  "function state() external view returns (uint8)",
  "function finalOutcome() external view returns (uint8)",
  "function deadline() external view returns (uint256)",
  "function title() external view returns (string)",
  
  // Events (for real-time updates)
  "event Bet(address indexed user, bool yes, uint256 amount)",
  "event Resolved(uint8 outcome, bool fromOracle, uint256 mcapValue)",
  "event Claimed(address indexed user, uint256 amount)"
];
```

### 3. Create Market Data Hook

Create `src/hooks/useMarketData.js`:

```javascript
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MARKET_ABI } from '../config/marketABI';

export function useMarketData(marketAddress) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org');
    const market = new ethers.Contract(marketAddress, MARKET_ABI, provider);

    const fetchData = async () => {
      try {
        const [odds, state, deadline] = await Promise.all([
          market.viewOdds(),
          market.state(),
          market.deadline()
        ]);

        setData({
          yesChance: Number(odds[0]) / 100, // 6700 -> 67%
          noChance: Number(odds[1]) / 100,   // 3300 -> 33%
          yesPool: ethers.formatEther(odds[2]),
          noPool: ethers.formatEther(odds[3]),
          isOpen: Number(state) === 0,
          isResolved: Number(state) === 1,
          deadline: Number(deadline) * 1000,
          timeRemaining: Number(deadline) * 1000 - Date.now()
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [marketAddress]);

  return { data, loading };
}
```

### 4. Add Betting Functions

Create `src/utils/betting.js`:

```javascript
import { ethers } from 'ethers';
import { MARKET_ABI } from '../config/marketABI';

export async function placeBet(marketAddress, betYes, amountBNB) {
  try {
    // Get signer from user's wallet
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Create contract instance
    const market = new ethers.Contract(marketAddress, MARKET_ABI, signer);
    
    // Place bet
    const tx = await market.bet(betYes, {
      value: ethers.parseEther(amountBNB.toString())
    });
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    return { success: true, receipt };
  } catch (error) {
    console.error('Bet failed:', error);
    return { success: false, error: error.message };
  }
}

export async function claimWinnings(marketAddress) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const market = new ethers.Contract(marketAddress, MARKET_ABI, signer);
    
    const tx = await market.claim();
    const receipt = await tx.wait();
    
    return { success: true, receipt };
  } catch (error) {
    console.error('Claim failed:', error);
    return { success: false, error: error.message };
  }
}
```

### 5. Update Your Market Cards

Wire up your existing YES/NO buttons:

```javascript
import { useMarketData } from './hooks/useMarketData';
import { placeBet } from './utils/betting';

function MarketCard({ marketAddress }) {
  const { data, loading } = useMarketData(marketAddress);
  const [amount, setAmount] = useState('0.01');
  const [betting, setBetting] = useState(false);

  const handleBet = async (betYes) => {
    setBetting(true);
    const result = await placeBet(marketAddress, betYes, amount);
    
    if (result.success) {
      alert('Bet placed successfully!');
    } else {
      alert('Bet failed: ' + result.error);
    }
    setBetting(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="market-card">
      {/* Your existing UI */}
      <h3>{data.title}</h3>
      
      {/* Real-time odds from blockchain */}
      <div className="odds">
        <div>YES: {data.yesChance}%</div>
        <div>NO: {data.noChance}%</div>
      </div>

      {/* Your existing bet input */}
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0.001"
        max="0.1"
      />

      {/* Wire up your YES/NO buttons */}
      <button 
        onClick={() => handleBet(true)}
        disabled={betting || !data.isOpen}
      >
        Bet YES
      </button>
      
      <button 
        onClick={() => handleBet(false)}
        disabled={betting || !data.isOpen}
      >
        Bet NO
      </button>
    </div>
  );
}
```

---

## 📊 Real-Time Updates

Your website should update odds every 3 seconds. The `useMarketData` hook already does this!

**What updates automatically:**
- YES/NO percentages
- Pool sizes
- Time remaining
- Market status (open/resolved)

---

## 🎨 UI Integration Points

### On Your Homepage (velocitybets.com):

**For each market card, replace hardcoded data with:**

```javascript
// Replace this static data:
const staticData = { yesChance: 67, noChance: 33 };

// With this live blockchain data:
const { data } = useMarketData('0x72dE4848Ea51844215d2016867671D26f60b828A');
// data.yesChance = 67 (updates every 3 seconds)
// data.noChance = 33 (updates every 3 seconds)
```

---

## 🔐 Network Configuration

Make sure users are on **BSC Mainnet**:

```javascript
async function ensureBSC() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== 56n) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }] // 56 in hex
      });
    } catch (error) {
      // Network not added, add it
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x38',
          chainName: 'BNB Smart Chain',
          nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
          rpcUrls: ['https://bsc-dataseed1.binance.org'],
          blockExplorerUrls: ['https://bscscan.com']
        }]
      });
    }
  }
}
```

---

## ⚠️ Important Notes

### Wallet Connection
✅ You already have this working! Just use the existing signer.

### Gas Fees
- ~$0.18 per bet
- ~$0.14 per claim
- Show users estimated gas before confirming

### Error Handling

Common errors to handle:

```javascript
if (error.message.includes('Exceeds cap')) {
  alert('Maximum bet is 0.1 BNB per wallet!');
} else if (error.message.includes('Deadline passed')) {
  alert('Betting period has ended!');
} else if (error.message.includes('insufficient funds')) {
  alert('Not enough BNB in wallet!');
}
```

### Max Bet Limit
- **0.1 BNB per wallet per side**
- Enforce this in your UI
- Contract will reject if exceeded

---

## 🧪 Testing Checklist

Before going live:

- [ ] Test on BSC Mainnet with small amount (0.001 BNB)
- [ ] Verify odds update every 3 seconds
- [ ] Test betting on YES
- [ ] Test betting on NO
- [ ] Test with wrong network (should prompt to switch)
- [ ] Test with insufficient BNB (should show error)
- [ ] Test exceeding 0.1 BNB limit (should fail gracefully)
- [ ] Verify transaction on BSCScan after bet

---

## 📚 Full Documentation

All files in this repo for reference:

1. **`SIMPLIFIED_WEB_INTEGRATION.md`** - Your main guide
2. **`docs/for-developers/integration.md`** - Complete integration guide
3. **`docs/for-developers/api-reference.md`** - All contract functions
4. **`docs/for-developers/contract-addresses.md`** - All addresses
5. **`SIMPLE_DEMO.html`** - Working standalone example
6. **`CONTRACT_ADDRESSES.json`** - JSON format addresses

---

## 🆘 Need Help?

**Questions?** Contact the team:
- Twitter: [@wearetellor](https://twitter.com/wearetellor)
- Check the docs in `/docs` folder

**Common Issues:**
- Wrong network → Prompt user to switch to BSC
- Transaction fails → Check error message and handle gracefully
- Odds not updating → Verify RPC endpoint is working

---

## ✅ Summary for Quick Implementation

**Minimum changes needed:**

1. `npm install ethers@6`
2. Copy `marketABI.js` (contract interface)
3. Copy `useMarketData.js` (real-time data hook)
4. Copy `betting.js` (bet and claim functions)
5. Wire up your YES/NO buttons to call `placeBet()`
6. Replace static odds with `data.yesChance` and `data.noChance`

**That's it!** Your site will be fully integrated with live blockchain data.

---

## 🚀 Launch Checklist

Before announcing:

- [ ] Test all functions on mainnet with real BNB
- [ ] Verify contract addresses match documentation
- [ ] Test on mobile (MetaMask mobile app)
- [ ] Test with different wallets (Rabby, WalletConnect)
- [ ] Double-check max bet enforcement (0.1 BNB)
- [ ] Ensure error messages are user-friendly
- [ ] Add loading states for transactions
- [ ] Test claiming winnings (after a market resolves)

---

**Good luck with the integration!** 🎉

The contracts are live, tested, and ready to go!


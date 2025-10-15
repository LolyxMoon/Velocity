# Integration Guide

Complete guide for integrating VelocityBets prediction markets into your website or application.

---

## Prerequisites

### What You Need

✅ **Basic knowledge of**:
- JavaScript/TypeScript
- React (or similar framework)
- Web3/Ethereum development
- ethers.js library

✅ **Tools**:
- Node.js 16+ and npm/yarn
- Modern web browser
- Code editor

✅ **Existing setup** (assumed):
- Wallet connection (MetaMask, Rabby, WalletConnect)
- BSC network support

---

## Quick Start

### 1. Install Dependencies

```bash
npm install ethers@6
```

### 2. Configure Contracts

```javascript
// src/config/velocitybets.js
export const VELOCITYBETS_CONFIG = {
  network: {
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed1.binance.org'
  },
  contracts: {
    tellorOracle: '0xD9157453E2668B2fc45b7A803D3FEF3642430cC0',
    marketFactory: '0xe8D17FDcddc3293bDD4568198d25E9657Fd23Fe9'
  },
  markets: {
    hakimi: '0x72dE4848Ea51844215d2016867671D26f60b828A',
    fourToken: '0x93EAdFb94070e1EAc522A42188Ee3983df335088'
  }
};
```

### 3. Add Contract ABI

```javascript
// src/config/marketABI.js
export const MARKET_ABI = [
  // Write functions
  "function bet(bool yes) external payable",
  "function claim() external",
  
  // Read functions
  "function viewOdds() external view returns (uint256 pYes_bps, uint256 pNo_bps, uint256 totalYes, uint256 totalNo)",
  "function yesStake(address user) external view returns (uint256)",
  "function noStake(address user) external view returns (uint256)",
  "function state() external view returns (uint8)",
  "function finalOutcome() external view returns (uint8)",
  "function deadline() external view returns (uint256)",
  "function title() external view returns (string)",
  
  // Events
  "event Bet(address indexed user, bool yes, uint256 amount)",
  "event Resolved(uint8 outcome, bool fromOracle, uint256 mcapValue)",
  "event Claimed(address indexed user, uint256 amount)"
];
```

### 4. Create Market Hook

```javascript
// src/hooks/useMarketData.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { VELOCITYBETS_CONFIG } from '../config/velocitybets';
import { MARKET_ABI } from '../config/marketABI';

export function useMarketData(marketAddress) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(
      VELOCITYBETS_CONFIG.network.rpcUrl
    );
    const market = new ethers.Contract(marketAddress, MARKET_ABI, provider);

    const fetchData = async () => {
      try {
        const [odds, state, deadline, title] = await Promise.all([
          market.viewOdds(),
          market.state(),
          market.deadline(),
          market.title()
        ]);

        setData({
          yesChance: Number(odds[0]) / 100, // Basis points to percentage
          noChance: Number(odds[1]) / 100,
          yesPool: ethers.formatEther(odds[2]),
          noPool: ethers.formatEther(odds[3]),
          isOpen: Number(state) === 0,
          isResolved: Number(state) === 1,
          deadline: Number(deadline) * 1000,
          title
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); // Update every 3s

    return () => clearInterval(interval);
  }, [marketAddress]);

  return { data, loading };
}
```

### 5. Implement Betting

```javascript
// src/hooks/useBetting.js
import { ethers } from 'ethers';
import { MARKET_ABI } from '../config/marketABI';

export function useBetting() {
  const placeBet = async (marketAddress, betYes, amountBNB, signer) => {
    try {
      const market = new ethers.Contract(marketAddress, MARKET_ABI, signer);
      
      const tx = await market.bet(betYes, {
        value: ethers.parseEther(amountBNB)
      });
      
      const receipt = await tx.wait();
      console.log('Bet placed!', receipt);
      return { success: true, receipt };
    } catch (error) {
      console.error('Bet failed:', error);
      return { success: false, error };
    }
  };

  const claimWinnings = async (marketAddress, signer) => {
    try {
      const market = new ethers.Contract(marketAddress, MARKET_ABI, signer);
      const tx = await market.claim();
      const receipt = await tx.wait();
      console.log('Claimed!', receipt);
      return { success: true, receipt };
    } catch (error) {
      console.error('Claim failed:', error);
      return { success: false, error };
    }
  };

  return { placeBet, claimWinnings };
}
```

### 6. Build UI Component

```jsx
// src/components/MarketCard.jsx
import React, { useState } from 'react';
import { useMarketData } from '../hooks/useMarketData';
import { useBetting } from '../hooks/useBetting';
import { ethers } from 'ethers';

export function MarketCard({ marketAddress }) {
  const { data, loading } = useMarketData(marketAddress);
  const { placeBet } = useBetting();
  const [amount, setAmount] = useState('0.01');

  if (loading) return <div>Loading...</div>;

  const handleBet = async (betYes) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    await placeBet(marketAddress, betYes, amount, signer);
  };

  return (
    <div className="market-card">
      <h3>{data.title}</h3>
      
      <div className="odds">
        <div>YES: {data.yesChance}%</div>
        <div>NO: {data.noChance}%</div>
      </div>

      <div className="pools">
        <div>YES Pool: {data.yesPool} BNB</div>
        <div>NO Pool: {data.noPool} BNB</div>
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0.001"
        max="0.1"
        step="0.001"
      />

      <button onClick={() => handleBet(true)}>Bet YES</button>
      <button onClick={() => handleBet(false)}>Bet NO</button>
    </div>
  );
}
```

---

## Core Functions

### Read Data (No Gas Cost)

```javascript
// Get live odds
const [yesOdds, noOdds, yesPool, noPool] = await market.viewOdds();
console.log('YES odds:', Number(yesOdds) / 100, '%');
console.log('NO odds:', Number(noOdds) / 100, '%');

// Get user's stakes
const userYesStake = await market.yesStake(userAddress);
const userNoStake = await market.noStake(userAddress);

// Get market state
const state = await market.state();
// 0 = Open, 1 = Resolved

// Get deadline
const deadline = await market.deadline();
const deadlineDate = new Date(Number(deadline) * 1000);
```

### Write Functions (Requires Gas)

```javascript
// Place a bet
const tx = await market.bet(
  true,  // true = YES, false = NO
  { value: ethers.parseEther('0.05') } // 0.05 BNB
);
await tx.wait();

// Claim winnings (after market resolves)
const tx = await market.claim();
await tx.wait();
```

---

## Real-Time Updates

### Polling Strategy

Update market data every 3 seconds:

```javascript
useEffect(() => {
  const fetchData = async () => {
    const odds = await market.viewOdds();
    updateUI(odds);
  };

  fetchData(); // Initial fetch
  const interval = setInterval(fetchData, 3000); // Poll every 3s

  return () => clearInterval(interval);
}, []);
```

### Event Listening

Listen for real-time events:

```javascript
// Listen for new bets
market.on('Bet', (user, yes, amount, event) => {
  console.log(`${user} bet ${ethers.formatEther(amount)} BNB on ${yes ? 'YES' : 'NO'}`);
  refreshData(); // Update UI
});

// Listen for resolution
market.on('Resolved', (outcome, fromOracle, mcapValue) => {
  console.log('Market resolved:', outcome === 1 ? 'YES' : 'NO');
  refreshData();
});

// Clean up
return () => {
  market.removeAllListeners();
};
```

---

## Error Handling

### Common Errors

```javascript
try {
  const tx = await market.bet(true, { value: ethers.parseEther('0.1') });
  await tx.wait();
} catch (error) {
  if (error.message.includes('Exceeds cap')) {
    alert('Maximum bet is 0.1 BNB per wallet!');
  } else if (error.message.includes('Deadline passed')) {
    alert('Betting period has ended!');
  } else if (error.message.includes('insufficient funds')) {
    alert('Not enough BNB in wallet!');
  } else {
    alert('Transaction failed: ' + error.message);
  }
}
```

### User-Friendly Messages

```javascript
const ERROR_MESSAGES = {
  'Exceeds cap': 'You\'ve reached the maximum bet limit (0.1 BNB)',
  'Deadline passed': 'Betting has closed for this market',
  'Already claimed': 'You\'ve already claimed your winnings',
  'insufficient funds': 'Insufficient BNB balance',
  'user rejected': 'Transaction cancelled by user'
};

function handleError(error) {
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (error.message.includes(key)) {
      return message;
    }
  }
  return 'Transaction failed. Please try again.';
}
```

---

## Network Management

### Check & Switch Network

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
    } catch (switchError) {
      // Network not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x38',
            chainName: 'BNB Smart Chain',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'BNB',
              decimals: 18
            },
            rpcUrls: ['https://bsc-dataseed1.binance.org'],
            blockExplorerUrls: ['https://bscscan.com']
          }]
        });
      }
    }
  }
}
```

---

## Testing

### Test on BSC Testnet First

```javascript
const TESTNET_CONFIG = {
  chainId: 97,
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  explorer: 'https://testnet.bscscan.com'
};

// Use testnet for development
const config = process.env.NODE_ENV === 'production' 
  ? MAINNET_CONFIG 
  : TESTNET_CONFIG;
```

### Mock Data for UI Development

```javascript
const MOCK_MARKET_DATA = {
  yesChance: 67,
  noChance: 33,
  yesPool: '5.4',
  noPool: '2.7',
  isOpen: true,
  isResolved: false,
  deadline: Date.now() + 86400000, // 1 day from now
  title: 'Will X reach $100M mcap?'
};
```

---

## Best Practices

### 1. Always Validate Inputs

```javascript
function validateBetAmount(amount) {
  const num = parseFloat(amount);
  if (isNaN(num) || num < 0.001) {
    throw new Error('Minimum bet is 0.001 BNB');
  }
  if (num > 0.1) {
    throw new Error('Maximum bet is 0.1 BNB');
  }
  return num;
}
```

### 2. Show Transaction Status

```javascript
async function placeBetWithUI(marketAddress, betYes, amount) {
  setStatus('Waiting for confirmation...');
  const tx = await market.bet(betYes, { value: ethers.parseEther(amount) });
  
  setStatus('Transaction submitted. Waiting for confirmation...');
  const receipt = await tx.wait();
  
  setStatus('Success! Bet placed.');
  return receipt;
}
```

### 3. Cache Provider Instances

```javascript
let cachedProvider = null;

function getProvider() {
  if (!cachedProvider) {
    cachedProvider = new ethers.JsonRpcProvider(
      VELOCITYBETS_CONFIG.network.rpcUrl
    );
  }
  return cachedProvider;
}
```

### 4. Implement Loading States

```javascript
const [loading, setLoading] = useState(false);

async function handleBet() {
  setLoading(true);
  try {
    await placeBet(...);
  } finally {
    setLoading(false);
  }
}
```

---

## Performance Tips

### 1. Batch Read Calls

```javascript
// ❌ Bad: Multiple separate calls
const yesPool = await market.yesPool();
const noPool = await market.noPool();
const state = await market.state();

// ✅ Good: Single batched call
const [yesPool, noPool, state] = await Promise.all([
  market.yesPool(),
  market.noPool(),
  market.state()
]);
```

### 2. Debounce User Input

```javascript
import { debounce } from 'lodash';

const debouncedCalculate = debounce(async (amount) => {
  const estimate = await calculatePayout(amount);
  setEstimate(estimate);
}, 500);
```

### 3. Use Multicall (Advanced)

For fetching data from multiple markets efficiently, consider using Multicall contracts.

---

## Security Checklist

✅ Validate all user inputs  
✅ Never expose private keys  
✅ Check transaction parameters before signing  
✅ Verify contract addresses match documentation  
✅ Implement rate limiting on API calls  
✅ Use HTTPS for RPC endpoints  
✅ Handle errors gracefully  
✅ Show clear warnings for large transactions  

---

## Example: Complete Market Page

```jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useMarketData } from './hooks/useMarketData';
import { VELOCITYBETS_CONFIG } from './config/velocitybets';
import { MARKET_ABI } from './config/marketABI';

export function MarketPage({ marketAddress }) {
  const { data, loading } = useMarketData(marketAddress);
  const [amount, setAmount] = useState('0.01');
  const [txStatus, setTxStatus] = useState('');

  const handleBet = async (betYes) => {
    try {
      setTxStatus('Connecting wallet...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      setTxStatus('Please confirm transaction...');
      const market = new ethers.Contract(marketAddress, MARKET_ABI, signer);
      const tx = await market.bet(betYes, {
        value: ethers.parseEther(amount)
      });
      
      setTxStatus('Processing...');
      await tx.wait();
      
      setTxStatus('Success! Bet placed.');
      setTimeout(() => setTxStatus(''), 3000);
    } catch (error) {
      setTxStatus('Error: ' + error.message);
    }
  };

  if (loading) return <div>Loading market...</div>;

  return (
    <div>
      <h2>{data.title}</h2>
      
      <div className="odds-display">
        <div className="yes-side">
          <span className="label">YES</span>
          <span className="percentage">{data.yesChance}%</span>
          <span className="pool">{data.yesPool} BNB</span>
        </div>
        
        <div className="no-side">
          <span className="label">NO</span>
          <span className="percentage">{data.noChance}%</span>
          <span className="pool">{data.noPool} BNB</span>
        </div>
      </div>

      <div className="bet-input">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.001"
          max="0.1"
          step="0.001"
        />
        <span>BNB</span>
      </div>

      <div className="bet-buttons">
        <button 
          onClick={() => handleBet(true)}
          disabled={!data.isOpen}
        >
          Bet YES
        </button>
        <button 
          onClick={() => handleBet(false)}
          disabled={!data.isOpen}
        >
          Bet NO
        </button>
      </div>

      {txStatus && <div className="status">{txStatus}</div>}
    </div>
  );
}
```

---

## Next Steps

📚 [API Reference](api-reference.md) - Complete API documentation  
📋 [Smart Contracts](smart-contracts.md) - Contract architecture  
🔗 [Contract Addresses](contract-addresses.md) - Deployed addresses  

---

**Need help?** Join our developer community on Twitter [@wearetellor](https://twitter.com/wearetellor)


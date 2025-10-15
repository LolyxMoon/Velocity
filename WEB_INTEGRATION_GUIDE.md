# 🌐 VelocityBets Web Integration Guide

## Complete Real-Time Sync Implementation

This guide provides everything your web developer needs to integrate the prediction markets with **real-time updates**.

---

## 📦 Installation

```bash
npm install ethers@6
```

---

## 🔧 Configuration Files

### 1. Create `src/config/contracts.js`

```javascript
// Contract addresses - UPDATE AFTER MAINNET DEPLOYMENT
export const CONTRACTS = {
  // BSC Mainnet
  mainnet: {
    chainId: 56,
    chainName: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    marketFactory: 'YOUR_MAINNET_FACTORY_ADDRESS', // After deployment
    tellorOracle: 'YOUR_MAINNET_TELLOR_ADDRESS',  // After deployment
    
    // Your production markets
    markets: {
      '4': 'MARKET_ADDRESS_FOR_$4_TOKEN',  // Will be created
    }
  },
  
  // BSC Testnet (for testing)
  testnet: {
    chainId: 97,
    chainName: 'BNB Smart Chain Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    marketFactory: '0xA3a5A8c4061f3B10B275DF98A59f88Fd19Ea1b3B',
    tellorOracle: '0x0346C9998600Fde7bE073b72902b70cfDc671908',
    markets: {
      'test': '0x5173680ab1aC105bF07061FB302570d42D8338A0'
    }
  }
};

// Use mainnet for production, testnet for development
export const ACTIVE_NETWORK = process.env.NODE_ENV === 'production' 
  ? CONTRACTS.mainnet 
  : CONTRACTS.testnet;

// Contract ABIs - Minimal versions needed for frontend
export const MARKET_ABI = [
  "function bet(bool yes) external payable",
  "function claim() external",
  "function viewOdds() external view returns (uint256 pYes_bps, uint256 pNo_bps)",
  "function yesPool() external view returns (uint256)",
  "function noPool() external view returns (uint256)",
  "function yesStake(address) external view returns (uint256)",
  "function noStake(address) external view returns (uint256)",
  "function state() external view returns (uint8)",
  "function finalOutcome() external view returns (uint8)",
  "function deadline() external view returns (uint256)",
  "function tokenName() external view returns (string)",
  "function targetMcapUsd() external view returns (uint256)",
  "function maxPerWallet() external view returns (uint256)",
  "function getCurrentOracleData() external view returns (uint256 mcapValue, uint256 timestamp)",
  "event Bet(address indexed user, bool yes, uint256 amount)",
  "event Resolved(uint8 outcome, bool fromOracle, uint256 mcapValue)",
  "event Claimed(address indexed user, uint256 amount)"
];
```

---

## 🎣 Real-Time Hooks

### 2. Create `src/hooks/useMarketData.js`

```javascript
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ACTIVE_NETWORK, MARKET_ABI } from '../config/contracts';

/**
 * Real-time market data hook - Updates every 3 seconds
 * @param {string} marketAddress - The market contract address
 * @param {object} signer - Ethers signer (optional, for write operations)
 */
export function useMarketData(marketAddress, signer = null) {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch market data
  const fetchMarketData = useCallback(async () => {
    if (!marketAddress) return;

    try {
      const provider = new ethers.JsonRpcProvider(ACTIVE_NETWORK.rpcUrl);
      const market = new ethers.Contract(marketAddress, MARKET_ABI, provider);

      // Parallel fetch all data
      const [
        yesPool,
        noPool,
        odds,
        state,
        deadline,
        tokenName,
        targetMcap,
        maxPerWallet,
        finalOutcome,
        oracleData
      ] = await Promise.all([
        market.yesPool(),
        market.noPool(),
        market.viewOdds(),
        market.state(),
        market.deadline(),
        market.tokenName(),
        market.targetMcapUsd(),
        market.maxPerWallet(),
        market.finalOutcome(),
        market.getCurrentOracleData().catch(() => [0n, 0n])
      ]);

      const totalPool = yesPool + noPool;
      const yesOdds = Number(odds[0]);
      const noOdds = Number(odds[1]);

      // Calculate time remaining
      const deadlineMs = Number(deadline) * 1000;
      const now = Date.now();
      const timeRemaining = deadlineMs - now;
      
      const data = {
        // Pool data
        yesPool: ethers.formatEther(yesPool),
        noPool: ethers.formatEther(noPool),
        totalPool: ethers.formatEther(totalPool),
        yesPoolWei: yesPool,
        noPoolWei: noPool,
        
        // Odds (in percentage)
        yesChance: yesOdds / 100,
        noChance: noOdds / 100,
        
        // State
        state: Number(state), // 0=Open, 1=Resolved, 2=Cancelled
        isOpen: Number(state) === 0,
        isResolved: Number(state) === 1,
        isCancelled: Number(state) === 2,
        
        // Outcome
        finalOutcome: Number(finalOutcome), // 0=Undecided, 1=Yes, 2=No
        
        // Market info
        tokenName,
        targetMcap: ethers.formatUnits(targetMcap, 8),
        maxPerWallet: ethers.formatEther(maxPerWallet),
        
        // Deadline
        deadline: deadlineMs,
        deadlineDate: new Date(deadlineMs),
        timeRemaining,
        hasEnded: timeRemaining <= 0,
        
        // Oracle data
        currentMcap: Number(ethers.formatUnits(oracleData[0], 8)),
        oracleTimestamp: Number(oracleData[1]),
        
        // Contract address
        address: marketAddress
      };

      setMarketData(data);
      setLastUpdate(Date.now());
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [marketAddress]);

  // Initial fetch
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  // Real-time updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarketData();
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [fetchMarketData]);

  // Listen to contract events for instant updates
  useEffect(() => {
    if (!marketAddress) return;

    const provider = new ethers.JsonRpcProvider(ACTIVE_NETWORK.rpcUrl);
    const market = new ethers.Contract(marketAddress, MARKET_ABI, provider);

    // Listen for Bet events
    const betFilter = market.filters.Bet();
    const onBet = (user, yes, amount, event) => {
      console.log('New bet detected:', { user, yes, amount: ethers.formatEther(amount) });
      fetchMarketData(); // Refresh immediately
    };

    // Listen for Resolved events
    const resolvedFilter = market.filters.Resolved();
    const onResolved = (outcome, fromOracle, mcapValue) => {
      console.log('Market resolved:', outcome);
      fetchMarketData(); // Refresh immediately
    };

    market.on(betFilter, onBet);
    market.on(resolvedFilter, onResolved);

    return () => {
      market.off(betFilter, onBet);
      market.off(resolvedFilter, onResolved);
    };
  }, [marketAddress, fetchMarketData]);

  return {
    marketData,
    loading,
    error,
    lastUpdate,
    refresh: fetchMarketData
  };
}

/**
 * Hook for user's specific stakes in a market
 */
export function useUserStakes(marketAddress, userAddress) {
  const [stakes, setStakes] = useState({ yes: '0', no: '0', total: '0' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!marketAddress || !userAddress) {
      setLoading(false);
      return;
    }

    const fetchStakes = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(ACTIVE_NETWORK.rpcUrl);
        const market = new ethers.Contract(marketAddress, MARKET_ABI, provider);

        const [yesStake, noStake] = await Promise.all([
          market.yesStake(userAddress),
          market.noStake(userAddress)
        ]);

        setStakes({
          yes: ethers.formatEther(yesStake),
          no: ethers.formatEther(noStake),
          total: ethers.formatEther(yesStake + noStake),
          yesWei: yesStake,
          noWei: noStake
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user stakes:', err);
        setLoading(false);
      }
    };

    fetchStakes();

    // Refresh every 5 seconds
    const interval = setInterval(fetchStakes, 5000);
    return () => clearInterval(interval);
  }, [marketAddress, userAddress]);

  return { stakes, loading };
}
```

---

## 🎨 React Component Example

### 3. Create `src/components/MarketCard.jsx`

```javascript
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useMarketData, useUserStakes } from '../hooks/useMarketData';
import { MARKET_ABI } from '../config/contracts';

export function MarketCard({ marketAddress, userAddress, signer }) {
  const { marketData, loading, lastUpdate } = useMarketData(marketAddress);
  const { stakes } = useUserStakes(marketAddress, userAddress);
  const [betAmount, setBetAmount] = useState('1');
  const [processing, setProcessing] = useState(false);

  // Place a bet
  const handleBet = async (betYes) => {
    if (!signer || !marketData) return;

    try {
      setProcessing(true);
      const market = new ethers.Contract(marketAddress, MARKET_ABI, signer);
      
      const tx = await market.bet(betYes, {
        value: ethers.parseEther(betAmount)
      });

      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      console.log('Bet confirmed!');
      
      // Data will auto-refresh via the hook
    } catch (error) {
      console.error('Bet failed:', error);
      alert('Bet failed: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Claim winnings
  const handleClaim = async () => {
    if (!signer) return;

    try {
      setProcessing(true);
      const market = new ethers.Contract(marketAddress, MARKET_ABI, signer);
      
      const tx = await market.claim();
      console.log('Claim transaction sent:', tx.hash);
      await tx.wait();
      console.log('Claimed successfully!');
    } catch (error) {
      console.error('Claim failed:', error);
      alert('Claim failed: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Calculate potential payout
  const calculatePayout = (betOnYes) => {
    if (!marketData) return '0';

    const betAmountWei = ethers.parseEther(betAmount);
    const winPool = betOnYes ? marketData.yesPoolWei : marketData.noPoolWei;
    const losePool = betOnYes ? marketData.noPoolWei : marketData.yesPoolWei;

    if (winPool === 0n) {
      return ethers.formatEther(betAmountWei * 2n);
    }

    const newWinPool = winPool + betAmountWei;
    const gross = betAmountWei + (losePool * betAmountWei) / newWinPool;
    
    // 2% fee on winnings
    const profit = gross - betAmountWei;
    const fee = (profit * 200n) / 10000n;
    const net = gross - fee;

    return ethers.formatEther(net);
  };

  // Format time remaining
  const formatTimeRemaining = () => {
    if (!marketData) return '';
    
    const ms = marketData.timeRemaining;
    if (ms <= 0) return 'Ended';

    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h Remaining`;
  };

  if (loading) {
    return <div className="market-card loading">Loading market data...</div>;
  }

  if (!marketData) {
    return <div className="market-card error">Failed to load market</div>;
  }

  const yesPayout = calculatePayout(true);
  const noPayout = calculatePayout(false);
  const canClaim = !marketData.isOpen && parseFloat(stakes.total) > 0;

  return (
    <div className="market-card">
      {/* Token Icon & Title */}
      <div className="market-header">
        <img src="/icon-4.png" alt="Token" className="token-icon" />
        <h3>{marketData.tokenName}</h3>
        
        {/* Circular gauge showing YES percentage */}
        <div className="gauge">
          <span className="gauge-value">{Math.round(marketData.yesChance)}%</span>
        </div>
      </div>

      {/* Bet Buttons */}
      <div className="bet-buttons">
        <button 
          className="bet-yes"
          onClick={() => handleBet(true)}
          disabled={!marketData.isOpen || processing || !signer}
        >
          <span className="bet-label">Yes</span>
          <span className="bet-payout">
            {betAmount} BNB → {parseFloat(yesPayout).toFixed(2)} BNB
          </span>
        </button>

        <button 
          className="bet-no"
          onClick={() => handleBet(false)}
          disabled={!marketData.isOpen || processing || !signer}
        >
          <span className="bet-label">No</span>
          <span className="bet-payout">
            {betAmount} BNB → {parseFloat(noPayout).toFixed(2)} BNB
          </span>
        </button>
      </div>

      {/* Time Remaining */}
      <div className="time-remaining">
        🕐 {formatTimeRemaining()}
      </div>

      {/* Odds Bars */}
      <div className="odds-display">
        <div className="odds-row">
          <span className="odds-label">{Math.round(marketData.yesChance)}% Chance</span>
          <div className="odds-bar">
            <div 
              className="odds-bar-fill yes" 
              style={{ width: `${marketData.yesChance}%` }}
            />
          </div>
        </div>

        <div className="odds-row">
          <span className="odds-label">{Math.round(marketData.noChance)}% Chance</span>
          <div className="odds-bar">
            <div 
              className="odds-bar-fill no" 
              style={{ width: `${marketData.noChance}%` }}
            />
          </div>
        </div>
      </div>

      {/* Claim Button (if applicable) */}
      {canClaim && (
        <button 
          className="claim-button"
          onClick={handleClaim}
          disabled={processing}
        >
          Claim Winnings
        </button>
      )}

      {/* User's Stakes (if connected) */}
      {userAddress && parseFloat(stakes.total) > 0 && (
        <div className="user-stakes">
          <p>Your stakes: YES {stakes.yes} BNB | NO {stakes.no} BNB</p>
        </div>
      )}

      {/* Real-time indicator */}
      <div className="live-indicator">
        <span className="live-dot"></span>
        Updated {lastUpdate ? Math.floor((Date.now() - lastUpdate) / 1000) : 0}s ago
      </div>
    </div>
  );
}
```

---

## 🔌 Wallet Connection

### 4. Create `src/hooks/useWallet.js`

```javascript
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ACTIVE_NETWORK } from '../config/contracts';

export function useWallet() {
  const [address, setAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Connect wallet
  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask!');
      alert('Please install MetaMask wallet extension');
      return;
    }

    try {
      setConnecting(true);
      setError(null);

      const provider = new ethers.BrowserProvider(window.ethereum);

      // Request account access
      await provider.send("eth_requestAccounts", []);

      // Check current network
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);

      // Switch to BSC if needed
      if (currentChainId !== ACTIVE_NETWORK.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x' + ACTIVE_NETWORK.chainId.toString(16) }],
          });
        } catch (switchError) {
          // Chain not added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x' + ACTIVE_NETWORK.chainId.toString(16),
                chainName: ACTIVE_NETWORK.chainName,
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18
                },
                rpcUrls: [ACTIVE_NETWORK.rpcUrl],
                blockExplorerUrls: ['https://bscscan.com']
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Get signer
      const newSigner = await provider.getSigner();
      const userAddress = await newSigner.getAddress();

      setSigner(newSigner);
      setAddress(userAddress);
      setConnected(true);
      setConnecting(false);

      // Save to localStorage
      localStorage.setItem('walletConnected', 'true');

      console.log('Wallet connected:', userAddress);
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
      setConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setConnected(false);
    localStorage.removeItem('walletConnected');
  }, []);

  // Auto-reconnect on page load
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected === 'true') {
      connect();
    }
  }, [connect]);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        connect();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [connect, disconnect]);

  // Format address for display
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return {
    address,
    signer,
    connected,
    connecting,
    error,
    connect,
    disconnect,
    formatAddress: () => formatAddress(address)
  };
}
```

---

## 🎯 Main App Component

### 5. Create `src/App.jsx`

```javascript
import React from 'react';
import { useWallet } from './hooks/useWallet';
import { MarketCard } from './components/MarketCard';
import { ACTIVE_NETWORK } from './config/contracts';

function App() {
  const { address, signer, connected, connecting, connect, disconnect, formatAddress } = useWallet();

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <h1>VelocityBets</h1>
          <p>Prediction Market for Four.meme</p>
        </div>

        {/* Wallet Connection Button */}
        <div className="wallet-section">
          {!connected ? (
            <button 
              className="connect-wallet-btn"
              onClick={connect}
              disabled={connecting}
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="wallet-connected">
              <span className="wallet-address">{formatAddress()}</span>
              <button className="disconnect-btn" onClick={disconnect}>
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Markets Grid */}
      <main className="markets-container">
        {/* Market 1: $4 Token */}
        <MarketCard 
          marketAddress={ACTIVE_NETWORK.markets['4']}
          userAddress={address}
          signer={signer}
        />

        {/* Add more markets here */}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Trusted by Tellor</p>
        <p>Network: {ACTIVE_NETWORK.chainName}</p>
      </footer>
    </div>
  );
}

export default App;
```

---

## 📊 Real-Time Features Summary

### ✅ What's Automated:

1. **Auto-refresh every 3 seconds**
   - Pool amounts update automatically
   - Odds/percentages recalculate in real-time
   - Time remaining updates

2. **Event-based updates**
   - Instant update when someone places a bet
   - Instant update when market resolves
   - No page refresh needed

3. **Live indicators**
   - Shows "last updated X seconds ago"
   - Visual feedback for real-time data

4. **Auto-reconnect**
   - Remembers wallet connection
   - Auto-switches to correct network

---

## 🚀 Deployment Steps

### Step 1: Deploy to Mainnet

```bash
# Add to .env file
BSC_MAINNET_RPC=https://bsc-dataseed1.binance.org
BSCSCAN_API_KEY=your_api_key_here

# Deploy contracts
npx hardhat run scripts/deployMainnet.js --network bsc

# Create production market
npx hardhat run scripts/createProductionMarket.js --network bsc
```

### Step 2: Update Frontend Config

Update `src/config/contracts.js` with deployed addresses.

### Step 3: Test

Test on testnet first, then switch to mainnet for production.

---

## 📝 Summary for Your Web Dev

**Tell them:**

1. **Install**: `npm install ethers@6`

2. **Copy these files**:
   - `src/config/contracts.js` - Contract configuration
   - `src/hooks/useMarketData.js` - Real-time market data hook
   - `src/hooks/useWallet.js` - Wallet connection hook
   - `src/components/MarketCard.jsx` - Market card component

3. **Real-time updates happen automatically**:
   - Every 3 seconds (polling)
   - On blockchain events (instant)
   - No manual refresh needed

4. **The YES/NO buttons already work**:
   - Call `bet(true)` for YES
   - Call `bet(false)` for NO
   - UI updates automatically after transaction

5. **After mainnet deployment**:
   - Update contract addresses in config
   - Switch `ACTIVE_NETWORK` to mainnet
   - Deploy website

---

## 🎨 Styling Tips

The components use these class names for styling:
- `.market-card` - Main card container
- `.bet-yes` - YES button (gold/orange)
- `.bet-no` - NO button (red)
- `.odds-bar-fill` - Progress bars for odds
- `.live-indicator` - Real-time update indicator

Match your existing VelocityBets design!

---

**Need help with anything else? Let me know! 🚀**


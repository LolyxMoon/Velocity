# Prediction Market 🎯

> Decentralized prediction markets with **automatic Tellor oracle resolution** on BSC Testnet

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## 🌟 Overview

A fully functional prediction market platform where users can:
- Bet on binary outcomes (YES/NO) for token market cap targets
- Markets automatically resolve using **Tellor oracle** data
- Winners split the losing pool proportionally
- Fully decentralized and transparent

### Key Features

✅ **Automatic Oracle Resolution** - Markets resolve themselves using Tellor price feeds  
✅ **Parimutuel Betting** - Winners share the losing pool based on their stake  
✅ **Self-Contained Markets** - Each market has built-in oracle integration  
✅ **Preview Functions** - See resolution outcome before it happens  
✅ **Permissionless** - Anyone can trigger resolution after deadline  
✅ **Secure** - ReentrancyGuard protection on all transfers  

---

## 📦 Deployed Contracts (BSC Testnet)

### Core Infrastructure
| Contract | Address | Purpose |
|----------|---------|---------|
| **TellorPlayground** | [`0x0346C9998600Fde7bE073b72902b70cfDc671908`](https://testnet.bscscan.com/address/0x0346C9998600Fde7bE073b72902b70cfDc671908) | Test oracle for market cap data |
| **MarketFactoryV2** | [`0x405a9f5835D881e15cbc135E7b874698Fd201814`](https://testnet.bscscan.com/address/0x405a9f5835D881e15cbc135E7b874698Fd201814) | Creates oracle-integrated markets |

### Legacy Contracts (V1)
| Contract | Address | Purpose |
|----------|---------|---------|
| MarketFactory | [`0xA3a5A8c4061f3B10B275DF98A59f88Fd19Ea1b3B`](https://testnet.bscscan.com/address/0xA3a5A8c4061f3B10B275DF98A59f88Fd19Ea1b3B) | Original factory |
| TellorResolver | [`0x162454933bD7a8f4e8186a8e34a2e2A333CdBb51`](https://testnet.bscscan.com/address/0x162454933bD7a8f4e8186a8e34a2e2A333CdBb51) | External resolver |

### Active Markets
| Market | Address | Status | Target |
|--------|---------|--------|--------|
| Market A | [`0x5173680ab1aC105bF07061FB302570d42D8338A0`](https://testnet.bscscan.com/address/0x5173680ab1aC105bF07061FB302570d42D8338A0) | Open | Will token hit $444M? |
| Market B | [`0x097c65F0f40b89feAb37e52B080eF18ceA92e5Ad`](https://testnet.bscscan.com/address/0x097c65F0f40b89feAb37e52B080eF18ceA92e5Ad) | Open | Will token hit $100M? |
| V2 Test Market | [`0x99991c4a14e1EBDBDdcd7bfb571542D43F355634`](https://testnet.bscscan.com/address/0x99991c4a14e1EBDBDdcd7bfb571542D43F355634) | Open | Oracle-integrated test |

---

## 🚀 Quick Start

### Prerequisites

- Node.js v16+ 
- npm or yarn
- BNB on BSC Testnet ([Get from faucet](https://testnet.bnbchain.org/faucet-smart))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mini-prediction.git
cd mini-prediction

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your private key to .env
PRIVATE_KEY=your_private_key_here
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

---

## 📝 Usage Guide

### Create a Market

```bash
# V2 (Oracle-integrated)
npx hardhat run scripts/createMarketV2.js --network bsctest
```

### Place a Bet

```javascript
const market = await ethers.getContractAt("BinaryMarketV2", marketAddress);

// Bet 0.05 BNB on YES
await market.bet(true, { value: ethers.parseEther("0.05") });

// Bet 0.05 BNB on NO
await market.bet(false, { value: ethers.parseEther("0.05") });
```

### Check Market Status

```bash
npx hardhat run scripts/previewMarketV2.js --network bsctest
```

### Resolve Market (After Deadline)

```bash
npx hardhat run scripts/resolveMarketV2.js --network bsctest <MARKET_ADDRESS>
```

### Claim Winnings

```javascript
await market.claim();
```

---

## 🏗️ Architecture

### V2 (Current - Integrated Oracle)

```
┌──────────────────┐
│ MarketFactoryV2  │
│ + Tellor Oracle  │
└────────┬─────────┘
         │ creates
         ▼
┌────────────────────────┐
│   BinaryMarketV2       │
│   + UsingTellor        │
│                        │
│ • bet()                │
│ • resolveFromTellor()  │◀─ Self-resolving!
│ • previewResolution()  │
│ • claim()              │
└───────────┬────────────┘
            │ reads oracle
            ▼
     ┌──────────────┐
     │   Tellor     │
     │   Oracle     │
     └──────────────┘
```

**Key Improvement:** Markets resolve themselves by reading oracle data directly!

---

## 🔧 Smart Contract Functions

### BinaryMarketV2.sol

#### User Functions
```solidity
// Place a bet
function bet(bool yes) external payable;

// Claim winnings or refund
function claim() external;

// Get current odds
function viewOdds() external view returns (uint256 pYes_bps, uint256 pNo_bps);
```

#### Oracle Functions
```solidity
// Resolve market using oracle (anyone can call)
function resolveFromTellor() external;

// Check if ready to resolve
function canResolveFromOracle() external view returns (bool);

// Preview resolution outcome
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
```

#### Admin Functions
```solidity
// Manual fallback resolution
function resolve(bool tokenReachedTarget) external onlyResolver;

// Cancel market and enable refunds
function cancel() external onlyResolver;
```

---

## 📊 How It Works

### 1. Market Creation
- Factory deploys a new `BinaryMarketV2` contract
- Parameters: deadline, target market cap, queryId
- Market opens for betting

### 2. Betting Period
- Users bet BNB on YES or NO
- Max bet per wallet: 0.1 BNB per side
- Odds adjust based on pool sizes

### 3. Resolution
**After Deadline + 1 Hour Buffer:**
- Anyone calls `resolveFromTellor()`
- Contract reads Tellor oracle data
- Compares actual vs target market cap
- Automatically resolves to YES or NO

### 4. Claiming
- Winners claim proportional share of losing pool
- Losers get nothing
- Cancelled markets: everyone gets refunded

### Payout Formula
```
payout = yourStake + (losingPool × yourStake / winningPool) - fees
```

---

## 🎯 Example Scenario

**Market:** "Will token X hit $50M market cap by Oct 30, 2025?"

1. **Alice bets:** 0.05 BNB on YES
2. **Bob bets:** 0.05 BNB on NO
3. **Pools:** YES = 0.05, NO = 0.05 (50/50 odds)
4. **Deadline passes**
5. **Oracle data:** Token hit $60M ✅
6. **Resolution:** Market resolves to YES
7. **Alice claims:** 0.1 BNB (her stake + Bob's stake)
8. **Bob gets:** Nothing

---

## 🔐 Security Features

- ✅ **ReentrancyGuard** - Prevents reentrancy attacks
- ✅ **Immutable Parameters** - Core settings cannot be changed
- ✅ **State Machine** - Clear state transitions (Open → Resolved/Cancelled)
- ✅ **Deadline Enforcement** - No bets after deadline
- ✅ **Dispute Protection** - Won't use disputed oracle data
- ✅ **Freshness Checks** - Rejects stale oracle data (>24h)

---

## 📚 Documentation

- [Oracle Integration Guide](./ORACLE_INTEGRATION.md) - How Tellor oracle works
- [V2 Integration Complete](./V2_INTEGRATION_COMPLETE.md) - V2 features and improvements
- [Deployment Summary](./DEPLOYMENT_SUMMARY.md) - All deployed contracts and addresses

---

## 🛠️ Development

### Project Structure

```
mini-prediction/
├── contracts/
│   ├── BinaryMarket.sol          # V1 market contract
│   ├── BinaryMarketV2.sol        # V2 with integrated oracle
│   ├── MarketFactory.sol         # V1 factory
│   ├── MarketFactoryV2.sol       # V2 factory
│   ├── TellorResolver.sol        # V1 external resolver
│   └── TellorPlayground.sol      # Test oracle wrapper
├── scripts/
│   ├── deployFactoryV2.js        # Deploy V2 factory
│   ├── createMarketV2.js         # Create V2 market
│   ├── previewMarketV2.js        # Preview market state
│   ├── resolveMarketV2.js        # Resolve via oracle
│   └── submitOracleData.js       # Submit test data
├── test/
│   └── Lock.js                   # Sample tests
├── hardhat.config.js             # Hardhat configuration
└── package.json                  # Dependencies
```

### Available Scripts

```bash
# Deployment
npx hardhat run scripts/deployFactoryV2.js --network bsctest

# Market Operations
npx hardhat run scripts/createMarketV2.js --network bsctest
npx hardhat run scripts/previewMarketV2.js --network bsctest
npx hardhat run scripts/resolveMarketV2.js --network bsctest <address>

# Oracle Operations
npx hardhat run scripts/submitOracleData.js --network bsctest

# Utilities
npx hardhat accounts --network bsctest
npx hardhat compile
npx hardhat test
```

---

## 🌐 Production Deployment

For BSC Mainnet deployment:

1. **Update Tellor Oracle Address**
   ```javascript
   const tellorOracle = "0x..."; // BSC Mainnet Tellor address
   ```

2. **Use Real QueryIds**
   - Get official Tellor queryIds for tokens
   - Or register custom data feeds

3. **Adjust Parameters**
   - Longer deadlines (days/weeks)
   - Higher bet limits
   - Add fees (e.g., 200 bps = 2%)

4. **Security Audit**
   - Get contracts audited
   - Test thoroughly on testnet
   - Implement emergency pause

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Tellor** - Decentralized oracle network
- **OpenZeppelin** - Secure smart contract libraries
- **Hardhat** - Ethereum development environment
- **BSC** - Binance Smart Chain testnet

---

## 📞 Contact

- **GitHub Issues:** [Report bugs or request features](https://github.com/YOUR_USERNAME/mini-prediction/issues)
- **Twitter:** https://x.com/Velocitybnb

---

## 🔗 Links

- [BSC Testnet Explorer](https://testnet.bscscan.com/)
- [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
- [Tellor Documentation](https://docs.tellor.io/)
- [Hardhat Documentation](https://hardhat.org/docs)

---

**Built with ❤️ for decentralized prediction markets**

*Last Updated: October 13, 2025*

# 🎯 Deployed Contract Addresses

**Date Deployed**: October 15, 2025 ✅  
**Network**: BSC Mainnet (Chain ID: 56)  
**Deployer Address**: 0x959132daf311aA5A67b7BCcFCf684e7A05b92605

---

## 📦 Core Contracts

### TellorPlayground (Oracle)
- **Address**: `0xE177E1914eb8eeC642dCFd6e91A95CA851983ef4`
- **BSCScan**: https://bscscan.com/address/0xE177E1914eb8eeC642dCFd6e91A95CA851983ef4
- **Purpose**: Oracle for market cap data

### MarketFactoryV2
- **Address**: `0xA3a5A8c4061f3B10B275DF98A59f88Fd19Ea1b3B`
- **BSCScan**: https://bscscan.com/address/0xA3a5A8c4061f3B10B275DF98A59f88Fd19Ea1b3B
- **Purpose**: Factory to create prediction markets

---

## 🎯 Production Markets

### Market 1: 哈基米 (Hakimi) ✅
- **Market Address**: `0x5173680ab1aC105bF07061FB302570d42D8338A0`
- **BSCScan**: https://bscscan.com/address/0x5173680ab1aC105bF07061FB302570d42D8338A0
- **Token**: `0x82Ec31D69b3c289E541b50E30681FD1ACAd24444`
- **Question**: Will 哈基米 reach $100M mcap before October 30?
- **Target**: $100,000,000
- **Deadline**: October 30, 2025 23:59:59 UTC
- **Max Bet**: 0.1 BNB per wallet
- **Platform Fee**: 2%

### Market 2: $4 Token ✅
- **Market Address**: `0x097c65F0f40b89feAb37e52B080eF18ceA92e5Ad`
- **BSCScan**: https://bscscan.com/address/0x097c65F0f40b89feAb37e52B080eF18ceA92e5Ad
- **Token**: `0x0A43fC31a73013089DF59194872Ecae4cAe14444`
- **Question**: Will $4 hit $444M mcap before October 30?
- **Target**: $444,000,000
- **Deadline**: October 30, 2025 23:59:59 UTC
- **Max Bet**: 0.1 BNB per wallet
- **Platform Fee**: 2%

---

## 📤 For Your Web Developer

Send them this information:

```json
{
  "network": "BSC Mainnet",
  "chainId": 56,
  "rpcUrl": "https://bsc-dataseed1.binance.org",
  "contracts": {
    "tellorOracle": "0xE177E1914eb8eeC642dCFd6e91A95CA851983ef4",
    "marketFactory": "0xA3a5A8c4061f3B10B275DF98A59f88Fd19Ea1b3B",
    "markets": {
      "hakimi": "0x5173680ab1aC105bF07061FB302570d42D8338A0",
      "4token": "0x097c65F0f40b89feAb37e52B080eF18ceA92e5Ad"
    }
  }
}
```

Also send them these files:
1. `SIMPLIFIED_WEB_INTEGRATION.md`
2. `artifacts/contracts/BinaryMarketV2_Fixed.sol/BinaryMarketV2_Fixed.json`

---

## ✅ Deployment Complete!

Your prediction market is now live on BSC Mainnet! 🚀

**Next Steps:**
1. Verify contracts on BSCScan (optional but recommended)
2. Send addresses to web developer
3. Web dev integrates (1-2 hours)
4. Test with small bets
5. Go live!

---

## 🔗 Useful Links

- **BSCScan Mainnet**: https://bscscan.com
- **Your Markets**: Check your deployer address on BSCScan
- **BNB Price**: Check on CoinGecko/CoinMarketCap
- **Network Status**: https://bscscan.com/gastracker


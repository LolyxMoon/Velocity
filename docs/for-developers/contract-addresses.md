# Contract Addresses

All deployed contract addresses for VelocityBets on BSC Mainnet.

---

## BSC Mainnet (Production)

### Network Details

```json
{
  "network": "BSC Mainnet",
  "chainId": 56,
  "rpcUrl": "https://bsc-dataseed1.binance.org",
  "explorer": "https://bscscan.com",
  "nativeCurrency": {
    "name": "BNB",
    "symbol": "BNB",
    "decimals": 18
  }
}
```

### Core Contracts

| Contract | Address | BSCScan |
|----------|---------|---------|
| **Tellor Oracle** | `0xD9157453E2668B2fc45b7A803D3FEF3642430cC0` | [View](https://bscscan.com/address/0xD9157453E2668B2fc45b7A803D3FEF3642430cC0) |
| **MarketFactoryV2** | `0xe8D17FDcddc3293bDD4568198d25E9657Fd23Fe9` | [View](https://bscscan.com/address/0xe8D17FDcddc3293bDD4568198d25E9657Fd23Fe9) |

### Active Markets

#### 哈基米 (Hakimi) Market

```json
{
  "name": "哈基米",
  "marketAddress": "0x72dE4848Ea51844215d2016867671D26f60b828A",
  "tokenAddress": "0x82Ec31D69b3c289E541b50E30681FD1ACAd24444",
  "targetMcap": "100000000",
  "deadline": "2025-10-30T23:59:59Z",
  "maxPerWallet": "0.1",
  "question": "Will 哈基米 reach $100M mcap before October 30?"
}
```

**Links**:
- [Market Contract](https://bscscan.com/address/0x72dE4848Ea51844215d2016867671D26f60b828A)
- [Token on DEXScreener](https://dexscreener.com/bsc/0x82Ec31D69b3c289E541b50E30681FD1ACAd24444)

#### $4 Token Market

```json
{
  "name": "$4",
  "marketAddress": "0x93EAdFb94070e1EAc522A42188Ee3983df335088",
  "tokenAddress": "0x0A43fC31a73013089DF59194872Ecae4cAe14444",
  "targetMcap": "444000000",
  "deadline": "2025-10-30T23:59:59Z",
  "maxPerWallet": "0.1",
  "question": "Will $4 hit $444M mcap before October 30?"
}
```

**Links**:
- [Market Contract](https://bscscan.com/address/0x93EAdFb94070e1EAc522A42188Ee3983df335088)
- [Token on DEXScreener](https://dexscreener.com/bsc/0x0A43fC31a73013089DF59194872Ecae4cAe14444)

---

## Frontend Configuration

### Complete Config for Web App

```javascript
// config.js
export const VELOCITYBETS_CONFIG = {
  network: {
    name: 'BSC Mainnet',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    explorer: 'https://bscscan.com'
  },
  
  contracts: {
    tellorOracle: '0xD9157453E2668B2fc45b7A803D3FEF3642430cC0',
    marketFactory: '0xe8D17FDcddc3293bDD4568198d25E9657Fd23Fe9'
  },
  
  markets: {
    hakimi: {
      address: '0x72dE4848Ea51844215d2016867671D26f60b828A',
      token: '0x82Ec31D69b3c289E541b50E30681FD1ACAd24444',
      name: '哈基米',
      targetMcap: '100000000',
      deadline: new Date('2025-10-30T23:59:59Z'),
      question: 'Will 哈基米 reach $100M mcap before October 30?'
    },
    
    fourToken: {
      address: '0x93EAdFb94070e1EAc522A42188Ee3983df335088',
      token: '0x0A43fC31a73013089DF59194872Ecae4cAe14444',
      name: '$4',
      targetMcap: '444000000',
      deadline: new Date('2025-10-30T23:59:59Z'),
      question: 'Will $4 hit $444M mcap before October 30?'
    }
  }
};
```

---

## TypeScript Types

```typescript
export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorer: string;
}

export interface MarketConfig {
  address: string;
  token: string;
  name: string;
  targetMcap: string;
  deadline: Date;
  question: string;
}

export interface VelocityBetsConfig {
  network: NetworkConfig;
  contracts: {
    tellorOracle: string;
    marketFactory: string;
  };
  markets: {
    [key: string]: MarketConfig;
  };
}
```

---

## Verification

All contracts are **verified** on BSCScan. You can:
- View source code
- Read contract state
- Verify constructor arguments
- Check compiler version

### Verification Status

✅ **MarketFactoryV2**: Verified  
✅ **哈基米 Market**: Verified  
✅ **$4 Market**: Verified  
✅ **Tellor Oracle**: Verified (official Tellor contract)

---

## Adding to MetaMask

### Add BSC Mainnet

```javascript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x38', // 56 in hex
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
```

### Add Tokens to Wallet

```javascript
// Add 哈基米
await window.ethereum.request({
  method: 'wallet_watchAsset',
  params: {
    type: 'ERC20',
    options: {
      address: '0x82Ec31D69b3c289E541b50E30681FD1ACAd24444',
      symbol: 'HAKIMI',
      decimals: 18
    }
  }
});

// Add $4
await window.ethereum.request({
  method: 'wallet_watchAsset',
  params: {
    type: 'ERC20',
    options: {
      address: '0x0A43fC31a73013089DF59194872Ecae4cAe14444',
      symbol: '4',
      decimals: 18
    }
  }
});
```

---

## Contract ABIs

### Where to Find ABIs

**Method 1**: From BSCScan
```
Visit: https://bscscan.com/address/CONTRACT_ADDRESS#code
Click: "Contract" tab → "Code" → Copy ABI
```

**Method 2**: From Artifacts
```bash
# In project repository
cat artifacts/contracts/BinaryMarketV2_Fixed.sol/BinaryMarketV2_Fixed.json
cat artifacts/contracts/MarketFactoryV2.sol/MarketFactoryV2.json
```

**Method 3**: Minimal ABI (for common operations)

See [API Reference](api-reference.md) for minimal ABIs.

---

## Testing Connectivity

### Check Network

```javascript
const provider = new ethers.JsonRpcProvider(
  'https://bsc-dataseed1.binance.org'
);

const network = await provider.getNetwork();
console.log('Chain ID:', network.chainId); // Should be 56
```

### Check Contract

```javascript
const marketAddress = '0x72dE4848Ea51844215d2016867671D26f60b828A';
const code = await provider.getCode(marketAddress);

if (code === '0x') {
  console.error('No contract at address!');
} else {
  console.log('Contract verified ✅');
}
```

### Read Market Data

```javascript
const market = new ethers.Contract(
  '0x72dE4848Ea51844215d2016867671D26f60b828A',
  MARKET_ABI,
  provider
);

const title = await market.title();
const deadline = await market.deadline();
const [yesOdds, noOdds, yesPool, noPool] = await market.viewOdds();

console.log('Market:', title);
console.log('Deadline:', new Date(Number(deadline) * 1000));
console.log('YES Odds:', Number(yesOdds) / 100, '%');
console.log('NO Odds:', Number(noOdds) / 100, '%');
```

---

## Security Notes

### Important Reminders

⚠️ **Never hardcode private keys** in frontend code  
⚠️ **Always validate addresses** before transactions  
⚠️ **Check network** before sending transactions  
⚠️ **Verify contract** addresses match documentation  
⚠️ **Test on testnet** first if unsure  

### Recommended RPC Endpoints

**Primary**:
```
https://bsc-dataseed1.binance.org
```

**Backups** (if primary is down):
```
https://bsc-dataseed2.binance.org
https://bsc-dataseed3.binance.org
https://bsc-dataseed4.binance.org
```

**Third-party** (faster, may require API key):
```
https://bsc-mainnet.nodereal.io/v1/YOUR_API_KEY
https://rpc.ankr.com/bsc
```

---

## Quick Reference Table

| Contract | Address |
|----------|---------|
| Tellor Oracle | `0xD9157453E2668B2fc45b7A803D3FEF3642430cC0` |
| MarketFactory | `0xe8D17FDcddc3293bDD4568198d25E9657Fd23Fe9` |
| 哈基米 Market | `0x72dE4848Ea51844215d2016867671D26f60b828A` |
| 哈基米 Token | `0x82Ec31D69b3c289E541b50E30681FD1ACAd24444` |
| $4 Market | `0x93EAdFb94070e1EAc522A42188Ee3983df335088` |
| $4 Token | `0x0A43fC31a73013089DF59194872Ecae4cAe14444` |

---

## Next Steps

📖 [Integration Guide](integration.md) - How to integrate VelocityBets  
📚 [API Reference](api-reference.md) - Complete API documentation  
🔧 [Smart Contracts](smart-contracts.md) - Contract architecture  

---

**Need help?** Contact us on Twitter [@wearetellor](https://twitter.com/wearetellor)


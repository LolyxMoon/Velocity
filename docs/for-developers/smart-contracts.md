# Smart Contracts

Technical overview of VelocityBets smart contract architecture.

---

## Contract Architecture

```
┌──────────────────────────────────────┐
│       MarketFactoryV2                │
│                                      │
│  - Creates markets                   │
│  - Stores Tellor Oracle address      │
│  - Tracks all deployed markets       │
└──────────┬───────────────────────────┘
           │ deploys
           ▼
┌──────────────────────────────────────┐
│     BinaryMarketV2_Fixed             │
│                                      │
│  - Handles bets (YES/NO)             │
│  - Manages pools                     │
│  - Resolves via oracle or manually   │
│  - Distributes payouts               │
└──────────┬───────────────────────────┘
           │ queries
           ▼
┌──────────────────────────────────────┐
│       Tellor Oracle                  │
│                                      │
│  - Provides market cap data          │
│  - Decentralized reporters           │
│  - Dispute mechanism                 │
└──────────────────────────────────────┘
```

---

## BinaryMarketV2_Fixed.sol

### Purpose
Individual prediction market contract for binary (YES/NO) outcomes.

### Key Features
- ✅ Parimutuel betting system
- ✅ Oracle-based automatic resolution
- ✅ Fallback manual resolution
- ✅ ReentrancyGuard protection
- ✅ Emergency cancellation
- ✅ Max bet limits (anti-whale)

### State Variables

```solidity
// Immutable configuration
address public immutable resolver;
ITellor public immutable tellor;
uint256 public immutable deadline;
uint256 public immutable maxPerWallet;
uint256 public immutable feeBps; // Platform fee (200 = 2%)
bytes32 public immutable queryId; // Tellor query ID
uint256 public immutable targetMarketCap;

// Market state
uint8 public state; // 0=Open, 1=Resolved, 2=Cancelled
uint8 public finalOutcome; // 0=None, 1=YES, 2=NO

// Pools
uint256 public yesPool;
uint256 public noPool;

// User stakes
mapping(address => uint256) public yesStake;
mapping(address => uint256) public noStake;

// Claim tracking
mapping(address => bool) public claimedYes;
mapping(address => bool) public claimedNo;
```

### Core Logic

#### Betting
```solidity
function bet(bool yes) external payable nonReentrant {
    require(state == 0, "Market not open");
    require(block.timestamp < deadline, "Deadline passed");
    require(msg.value >= minBet, "Below min");
    
    if (yes) {
        require(yesStake[msg.sender] + msg.value <= maxPerWallet, "Exceeds cap");
        yesStake[msg.sender] += msg.value;
        yesPool += msg.value;
    } else {
        require(noStake[msg.sender] + msg.value <= maxPerWallet, "Exceeds cap");
        noStake[msg.sender] += msg.value;
        noPool += msg.value;
    }
    
    emit Bet(msg.sender, yes, msg.value);
}
```

#### Resolution (Oracle)
```solidity
function resolveFromTellor() external nonReentrant {
    require(state == 0, "Already resolved");
    require(block.timestamp >= deadline + 1 hours, "Buffer period");
    
    (bytes memory value, uint256 timestamp) = tellor.getDataBefore(
        queryId,
        deadline + 1 hours
    );
    
    require(timestamp > 0, "No oracle data");
    uint256 mcap = abi.decode(value, (uint256));
    
    bool yesWon = (mcap >= targetMarketCap);
    finalOutcome = yesWon ? 1 : 2;
    state = 1;
    
    emit Resolved(finalOutcome, true, mcap);
}
```

#### Claiming
```solidity
function claim() external nonReentrant {
    require(state == 1, "Not resolved");
    
    uint256 payout = 0;
    uint256 userWinStake = 0;
    uint256 winPool = 0;
    uint256 losePool = 0;
    
    if (finalOutcome == 1) { // YES won
        require(!claimedYes[msg.sender], "Already claimed");
        userWinStake = yesStake[msg.sender];
        winPool = yesPool;
        losePool = noPool;
        claimedYes[msg.sender] = true;
    } else { // NO won
        require(!claimedNo[msg.sender], "Already claimed");
        userWinStake = noStake[msg.sender];
        winPool = noPool;
        losePool = yesPool;
        claimedNo[msg.sender] = true;
    }
    
    require(userWinStake > 0, "Nothing to claim");
    
    // Calculate payout
    uint256 winnings = (losePool * userWinStake) / winPool;
    uint256 fee = (winnings * feeBps) / 10000;
    payout = userWinStake + winnings - fee;
    
    payable(msg.sender).transfer(payout);
    emit Claimed(msg.sender, payout);
}
```

### Security Features

**ReentrancyGuard**: All state-changing functions protected  
**Input Validation**: Comprehensive requirement checks  
**Max Bet Limits**: Prevents whale manipulation  
**Timestamp Safety**: 1-hour buffer prevents frontrunning  

---

## MarketFactoryV2.sol

### Purpose
Factory contract for deploying prediction markets.

### Key Functions

```solidity
function createMarket(
    address _resolver,
    uint256 _deadline,
    uint256 _maxPerWallet,
    uint256 _feeBps,
    string memory _title,
    string memory _dataSource,
    uint256 _targetMarketCap,
    bytes32 _queryId
) external onlyOwner returns (address) {
    BinaryMarketV2_Fixed market = new BinaryMarketV2_Fixed(
        _resolver,
        tellor,
        _deadline,
        _maxPerWallet,
        _feeBps,
        _title,
        _dataSource,
        _targetMarketCap,
        _queryId
    );
    
    allMarkets.push(address(market));
    emit MarketCreated(address(market), _title, _deadline);
    
    return address(market);
}
```

---

## Oracle Integration

### Tellor Query Structure

```solidity
// Encode query for "TokenMarketCap" of specific token
bytes queryData = abi.encode("TokenMarketCap", tokenAddress);
bytes32 queryId = keccak256(queryData);

// Query oracle for data
(bytes memory value, uint256 timestamp) = tellor.getDataBefore(
    queryId,
    deadline + 1 hours
);

// Decode market cap (8 decimals)
uint256 marketCap = abi.decode(value, (uint256));
```

### Data Format
- Market cap stored as `uint256` with 8 decimals
- Example: $100M = `10000000000000000`
- Example: $1 = `100000000`

---

## Gas Optimization

### Techniques Used

1. **Immutable Variables**: Save gas on reads
2. **Tight Variable Packing**: Minimize storage slots
3. **Early Returns**: Fail fast to save gas
4. **Minimal External Calls**: Reduce cross-contract calls
5. **View Functions**: No gas for reads

### Gas Costs

| Operation | Gas Used | Optimization |
|-----------|----------|--------------|
| Bet | ~100,000 | Optimized storage writes |
| Claim | ~80,000 | Single transfer, minimal logic |
| ViewOdds | 0 | Pure view function |
| Resolution | ~150,000 | Oracle call overhead |

---

## Upgradability

### Current Status: Non-Upgradable

Markets are **immutable** after deployment:
- ✅ Pros: Trustless, no rug pull risk
- ❌ Cons: Can't fix bugs in deployed markets

### Future: Factory Upgrades

New markets can use improved contract versions:
- Deploy new factory with better contracts
- Old markets remain unchanged
- Users migrate to new markets organically

---

## Dependencies

### OpenZeppelin

```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
```

Used for battle-tested reentrancy protection.

### Tellor

```solidity
import "usingtellor/contracts/interface/ITellor.sol";
```

Interface for querying Tellor Oracle.

---

## Testing

### Test Coverage

✅ Betting flow (YES and NO)  
✅ Max bet enforcement  
✅ Deadline enforcement  
✅ Oracle resolution  
✅ Manual resolution  
✅ Payout calculation  
✅ Fee deduction  
✅ Reentrancy protection  
✅ Market cancellation  

### Run Tests

```bash
npx hardhat test
```

---

## Deployment

### Compile

```bash
npx hardhat compile
```

### Deploy Factory

```bash
npx hardhat run scripts/deployFactoryV2.js --network bsc
```

### Create Market

```bash
npx hardhat run scripts/createProductionMarket.js --network bsc
```

---

## Verification

All contracts verified on BSCScan:

```bash
npx hardhat verify --network bsc MARKET_ADDRESS \
  RESOLVER TELLOR DEADLINE MAX_PER_WALLET FEE_BPS \
  TITLE DATA_SOURCE TARGET_MCAP QUERY_ID
```

---

## Source Code

### GitHub
Coming soon - repository will be open sourced.

### BSCScan
All contracts verified and viewable:
- [MarketFactoryV2](https://bscscan.com/address/0xe8D17FDcddc3293bDD4568198d25E9657Fd23Fe9#code)
- [哈基米 Market](https://bscscan.com/address/0x72dE4848Ea51844215d2016867671D26f60b828A#code)
- [$4 Market](https://bscscan.com/address/0x93EAdFb94070e1EAc522A42188Ee3983df335088#code)

---

## Security Audits

### Internal Audit
✅ Completed - No critical issues found

### Recommended Practices
- ✅ Use OpenZeppelin libraries
- ✅ ReentrancyGuard on all payable functions
- ✅ Comprehensive require statements
- ✅ Event emission for all state changes
- ✅ No delegatecall or selfdestruct
- ✅ Immutable critical variables

### External Audit
Planned for future versions with higher TVL.

---

## Known Limitations

1. **Oracle Dependency**: Relies on Tellor data availability
2. **Resolver Trust**: Manual resolution requires trusting resolver
3. **No Partial Claims**: Must claim full winnings at once
4. **Fixed Parameters**: Max bet, fees cannot be changed after deployment

---

## Future Improvements

- 🔄 **Multi-Oracle**: Query multiple oracles for consensus
- 🗳️ **DAO Governance**: Community vote on disputes
- 📊 **Advanced Metrics**: Time-weighted odds, volatility tracking
- 🎁 **Loyalty Rewards**: Bonuses for frequent bettors
- 🔧 **Batch Claiming**: Claim multiple markets at once

---

## Next Steps

📖 [API Reference](api-reference.md) - Complete function reference  
🔗 [Contract Addresses](contract-addresses.md) - Deployed contracts  
📚 [Integration Guide](integration.md) - How to integrate  

---

**Want to contribute?** Follow development on [GitHub](#) (coming soon)


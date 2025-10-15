// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "usingtellor/contracts/UsingTellor.sol";

/**
 * @title BinaryMarketV2
 * @notice Prediction market with integrated Tellor oracle for automatic resolution
 * @dev Inherits from UsingTellor to read oracle data directly
 */
contract BinaryMarketV2 is ReentrancyGuard, UsingTellor {
    enum State { Open, Resolved, Cancelled }
    enum Outcome { Undecided, Yes, No }

    // Immutable state
    address public immutable factory;
    address public immutable resolver;        // Fallback manual resolver
    uint256 public immutable deadline;        // UNIX seconds
    uint256 public immutable maxPerWallet;    // Max bet per wallet per side
    uint16  public immutable feeBps;          // Fee in basis points (100 = 1%)
    bytes32 public immutable queryId;         // Tellor queryId for market cap data

    // Market details
    string public tokenName;
    string public dataSourceURL;
    uint256 public targetMcapUsd;             // Target market cap (8 decimals)

    // Market state
    State public state;
    Outcome public finalOutcome;

    // Betting pools
    mapping(address => uint256) public yesStake;
    mapping(address => uint256) public noStake;
    uint256 public yesPool;
    uint256 public noPool;

    // Oracle resolution settings
    uint256 public constant MIN_BUFFER_TIME = 1 hours;    // Buffer after deadline
    uint256 public constant MAX_DATA_AGE = 24 hours;      // Max oracle data age

    // Events
    event Bet(address indexed user, bool yes, uint256 amount);
    event Resolved(Outcome outcome, bool fromOracle, uint256 mcapValue);
    event Claimed(address indexed user, uint256 amount);
    event Cancelled();

    // Modifiers
    modifier onlyResolver() { 
        require(msg.sender == resolver, "not resolver"); 
        _; 
    }
    
    modifier beforeDeadline() { 
        require(block.timestamp < deadline, "after deadline"); 
        _; 
    }

    /**
     * @param _tellorOracle Address of Tellor oracle contract
     * @param _resolver Fallback manual resolver address
     * @param _deadline Market deadline timestamp
     * @param _maxPerWallet Maximum bet amount per wallet per side
     * @param _feeBps Fee in basis points
     * @param _tokenName Token/question description
     * @param _dataSourceURL URL for data verification
     * @param _targetMcapUsd Target market cap in USD (8 decimals)
     * @param _queryId Tellor queryId for the token's market cap
     */
    constructor(
        address payable _tellorOracle,
        address _resolver,
        uint256 _deadline,
        uint256 _maxPerWallet,
        uint16 _feeBps,
        string memory _tokenName,
        string memory _dataSourceURL,
        uint256 _targetMcapUsd,
        bytes32 _queryId
    ) UsingTellor(_tellorOracle) {
        require(_resolver != address(0), "bad resolver");
        require(_deadline > block.timestamp, "bad deadline");
        require(_queryId != bytes32(0), "bad queryId");
        
        factory = msg.sender;
        resolver = _resolver;
        deadline = _deadline;
        maxPerWallet = _maxPerWallet;
        feeBps = _feeBps;
        tokenName = _tokenName;
        dataSourceURL = _dataSourceURL;
        targetMcapUsd = _targetMcapUsd;
        queryId = _queryId;
        state = State.Open;
    }

    receive() external payable { revert("use bet"); }

    /**
     * @notice Place a bet on YES or NO
     * @param yes True for YES, false for NO
     */
    function bet(bool yes) external payable beforeDeadline nonReentrant {
        require(state == State.Open, "not open");
        require(msg.value > 0, "no value");
        
        uint256 totalForUser = yes ? yesStake[msg.sender] + msg.value : noStake[msg.sender] + msg.value;
        require(totalForUser <= maxPerWallet, "exceeds cap");

        if (yes) { 
            yesStake[msg.sender] += msg.value; 
            yesPool += msg.value; 
        } else { 
            noStake[msg.sender] += msg.value; 
            noPool += msg.value; 
        }

        emit Bet(msg.sender, yes, msg.value);
    }

    /**
     * @notice Automatically resolve market using Tellor oracle data
     * @dev Can be called by anyone after deadline + buffer period
     */
    function resolveFromTellor() external nonReentrant {
        require(state == State.Open, "not open");
        require(block.timestamp >= deadline, "before deadline");
        require(
            block.timestamp >= deadline + MIN_BUFFER_TIME,
            "buffer period not elapsed"
        );

        // Fetch market cap data from Tellor before the deadline
        (bytes memory valueBytes, uint256 timestampRetrieved) = _getDataBefore(
            queryId,
            deadline + 1  // +1 to include data exactly at deadline
        );

        // Verify we got data
        require(valueBytes.length > 0, "no oracle data");

        // Verify data isn't too old
        require(
            deadline - timestampRetrieved <= MAX_DATA_AGE,
            "oracle data too old"
        );

        // Decode the market cap value (uint256 with 8 decimals)
        uint256 mcapValue = abi.decode(valueBytes, (uint256));

        // Determine outcome
        bool reachedTarget = mcapValue >= targetMcapUsd;
        
        // Update state
        state = State.Resolved;
        finalOutcome = reachedTarget ? Outcome.Yes : Outcome.No;

        emit Resolved(finalOutcome, true, mcapValue);
    }

    /**
     * @notice Manual resolution fallback (requires resolver role)
     * @param tokenReachedTarget Whether the token reached its target
     */
    function resolve(bool tokenReachedTarget) external onlyResolver {
        require(block.timestamp >= deadline, "too early");
        require(state == State.Open, "already resolved");
        
        state = State.Resolved;
        finalOutcome = tokenReachedTarget ? Outcome.Yes : Outcome.No;
        
        emit Resolved(finalOutcome, false, 0);
    }

    /**
     * @notice Cancel market and enable refunds (resolver only)
     */
    function cancel() external onlyResolver {
        require(state == State.Open, "already resolved");
        state = State.Cancelled;
        emit Cancelled();
    }

    /**
     * @notice Claim winnings or refund
     */
    function claim() external nonReentrant {
        require(state != State.Open, "not finished");

        if (state == State.Cancelled) {
            uint256 refund = yesStake[msg.sender] + noStake[msg.sender];
            yesStake[msg.sender] = 0; 
            noStake[msg.sender] = 0;
            _send(msg.sender, refund);
            emit Claimed(msg.sender, refund);
            return;
        }

        bool winnerYes = (finalOutcome == Outcome.Yes);
        uint256 userWin = winnerYes ? yesStake[msg.sender] : noStake[msg.sender];
        require(userWin > 0, "no win");

        uint256 winPool = winnerYes ? yesPool : noPool;
        uint256 losePool = winnerYes ? noPool : yesPool;

        uint256 gross = userWin + (losePool * userWin) / winPool;
        uint256 fee  = feeBps == 0 ? 0 : ((gross - userWin) * feeBps) / 10000;
        uint256 payout = gross - fee;

        if (winnerYes) yesStake[msg.sender] = 0; else noStake[msg.sender] = 0;
        _send(msg.sender, payout);
        emit Claimed(msg.sender, payout);
    }

    /**
     * @notice Get current market odds
     * @return pYes_bps YES odds in basis points
     * @return pNo_bps NO odds in basis points
     */
    function viewOdds() external view returns (uint256 pYes_bps, uint256 pNo_bps) {
        uint256 total = yesPool + noPool;
        if (total == 0) return (5000, 5000);
        pYes_bps = (yesPool * 10000) / total;
        pNo_bps  = 10000 - pYes_bps;
    }

    /**
     * @notice Check if market can be resolved via oracle
     * @return bool True if ready for oracle resolution
     */
    function canResolveFromOracle() external view returns (bool) {
        if (state != State.Open) return false;
        if (block.timestamp < deadline + MIN_BUFFER_TIME) return false;
        
        // Check if oracle data exists
        (bytes memory valueBytes, uint256 timestampRetrieved) = _getDataBefore(
            queryId,
            deadline + 1
        );
        
        if (valueBytes.length == 0) return false;
        if (deadline - timestampRetrieved > MAX_DATA_AGE) return false;
        
        return true;
    }

    /**
     * @notice Preview what the oracle resolution would be
     * @return outcome Predicted outcome
     * @return mcapValue Market cap from oracle
     * @return timestamp When oracle data was reported
     */
    function previewOracleResolution() 
        external 
        view 
        returns (
            bool outcome,
            uint256 mcapValue,
            uint256 timestamp
        ) 
    {
        (bytes memory valueBytes, uint256 timestampRetrieved) = _getDataBefore(
            queryId,
            deadline + 1
        );
        
        if (valueBytes.length == 0) {
            return (false, 0, 0);
        }
        
        mcapValue = abi.decode(valueBytes, (uint256));
        outcome = mcapValue >= targetMcapUsd;
        timestamp = timestampRetrieved;
        
        return (outcome, mcapValue, timestamp);
    }

    /**
     * @notice Get current market cap from oracle
     * @return mcapValue Current market cap
     * @return timestamp When it was reported
     */
    function getCurrentOracleData() 
        external 
        view 
        returns (uint256 mcapValue, uint256 timestamp) 
    {
        (bytes memory valueBytes, uint256 timestampRetrieved) = _getDataBefore(
            queryId,
            block.timestamp
        );
        
        if (valueBytes.length == 0) {
            return (0, 0);
        }
        
        mcapValue = abi.decode(valueBytes, (uint256));
        return (mcapValue, timestampRetrieved);
    }

    /**
     * @dev Internal function to send BNB
     */
    function _send(address to, uint256 amount) internal {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "send failed");
    }
}


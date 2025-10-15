// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "usingtellor/contracts/UsingTellor.sol";

/**
 * @title BinaryMarketV2_Fixed
 * @notice Prediction market with integrated Tellor oracle - SECURITY FIXES APPLIED
 * @dev Fixed: Added deadline check to cancel() function
 */
contract BinaryMarketV2_Fixed is ReentrancyGuard, UsingTellor {
    enum State { Open, Resolved, Cancelled }
    enum Outcome { Undecided, Yes, No }

    // Immutable state
    address public immutable factory;
    address public immutable resolver;
    uint256 public immutable deadline;
    uint256 public immutable maxPerWallet;
    uint16  public immutable feeBps;
    bytes32 public immutable queryId;

    // Market details
    string public tokenName;
    string public dataSourceURL;
    uint256 public targetMcapUsd;

    // Market state
    State public state;
    Outcome public finalOutcome;

    // Betting pools
    mapping(address => uint256) public yesStake;
    mapping(address => uint256) public noStake;
    uint256 public yesPool;
    uint256 public noPool;

    // Oracle resolution settings
    uint256 public constant MIN_BUFFER_TIME = 1 hours;
    uint256 public constant MAX_DATA_AGE = 24 hours;

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

    function resolveFromTellor() external nonReentrant {
        require(state == State.Open, "not open");
        require(block.timestamp >= deadline, "before deadline");
        require(
            block.timestamp >= deadline + MIN_BUFFER_TIME,
            "buffer period not elapsed"
        );

        (bytes memory valueBytes, uint256 timestampRetrieved) = _getDataBefore(
            queryId,
            deadline + 1
        );

        require(valueBytes.length > 0, "no oracle data");
        require(
            deadline - timestampRetrieved <= MAX_DATA_AGE,
            "oracle data too old"
        );

        uint256 mcapValue = abi.decode(valueBytes, (uint256));
        bool reachedTarget = mcapValue >= targetMcapUsd;
        
        state = State.Resolved;
        finalOutcome = reachedTarget ? Outcome.Yes : Outcome.No;

        emit Resolved(finalOutcome, true, mcapValue);
    }

    function resolve(bool tokenReachedTarget) external onlyResolver {
        require(block.timestamp >= deadline, "too early");
        require(state == State.Open, "already resolved");
        
        state = State.Resolved;
        finalOutcome = tokenReachedTarget ? Outcome.Yes : Outcome.No;
        
        emit Resolved(finalOutcome, false, 0);
    }

    /**
     * @notice Cancel market and enable refunds (resolver only)
     * @dev 🔒 SECURITY FIX: Added deadline check to prevent cancellation after outcome is known
     */
    function cancel() external onlyResolver {
        require(block.timestamp < deadline, "cannot cancel after deadline");
        require(state == State.Open, "already resolved");
        state = State.Cancelled;
        emit Cancelled();
    }

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

    function viewOdds() external view returns (uint256 pYes_bps, uint256 pNo_bps) {
        uint256 total = yesPool + noPool;
        if (total == 0) return (5000, 5000);
        pYes_bps = (yesPool * 10000) / total;
        pNo_bps  = 10000 - pYes_bps;
    }

    function canResolveFromOracle() external view returns (bool) {
        if (state != State.Open) return false;
        if (block.timestamp < deadline + MIN_BUFFER_TIME) return false;
        
        (bytes memory valueBytes, uint256 timestampRetrieved) = _getDataBefore(
            queryId,
            deadline + 1
        );
        
        if (valueBytes.length == 0) return false;
        if (deadline - timestampRetrieved > MAX_DATA_AGE) return false;
        
        return true;
    }

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

    function _send(address to, uint256 amount) internal {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "send failed");
    }
}


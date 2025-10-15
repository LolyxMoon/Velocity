// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./BinaryMarketV2.sol";

/**
 * @title MarketFactoryV2
 * @notice Factory for creating oracle-integrated prediction markets
 */
contract MarketFactoryV2 {
    address payable public immutable tellorOracle;
    
    event MarketCreated(
        address indexed market, 
        string tokenName, 
        bytes32 indexed queryId
    );

    /**
     * @param _tellorOracle Address of Tellor oracle contract
     */
    constructor(address payable _tellorOracle) {
        require(_tellorOracle != address(0), "invalid oracle");
        tellorOracle = _tellorOracle;
    }

    /**
     * @notice Create a new oracle-powered prediction market
     * @param resolver Fallback manual resolver address
     * @param deadline Market deadline timestamp
     * @param maxPerWallet Maximum bet per wallet per side
     * @param feeBps Fee in basis points
     * @param tokenName Token/question description
     * @param dataSourceURL URL for data verification
     * @param targetMcapUsd Target market cap in USD (8 decimals)
     * @param queryId Tellor queryId for the token's market cap data
     * @return address Address of the created market
     */
    function createMarket(
        address resolver,
        uint256 deadline,
        uint256 maxPerWallet,
        uint16  feeBps,
        string calldata tokenName,
        string calldata dataSourceURL,
        uint256 targetMcapUsd,
        bytes32 queryId
    ) external returns (address) {
        BinaryMarketV2 market = new BinaryMarketV2(
            tellorOracle,
            resolver,
            deadline,
            maxPerWallet,
            feeBps,
            tokenName,
            dataSourceURL,
            targetMcapUsd,
            queryId
        );
        
        emit MarketCreated(
            address(market), 
            tokenName, 
            queryId
        );
        
        return address(market);
    }

    /**
     * @notice Helper to generate queryId for a token's market cap
     * @param tokenAddress Address of the token
     * @return bytes32 The queryId
     */
    function generateQueryId(address tokenAddress) external pure returns (bytes32) {
        bytes memory queryData = abi.encode("TokenMarketCap", tokenAddress);
        return keccak256(queryData);
    }
}


require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, BSC_TESTNET_RPC, BSC_MAINNET_RPC, BSCSCAN_API_KEY } = process.env;

// Task to list accounts
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  
  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
      },
      {
        version: "0.8.28",
      },
    ],
  },
  networks: {
    bsctest: {
      url: BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    bsc: {
      url: BSC_MAINNET_RPC || "https://bsc-dataseed1.binance.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 56,
    },
  },
  etherscan: {
    apiKey: {
      bsc: BSCSCAN_API_KEY || "",
      bscTestnet: BSCSCAN_API_KEY || "",
    }
  },
};



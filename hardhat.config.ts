import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();
export const {
  SEPOLIA_RPC_URL,
  PRIVATE_KEY_A,
  PRIVATE_KEY_B,
  ETHERSCAN_API_KEY
} = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      // evmVersion: "paris",
      evmVersion: "istanbul",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      // accounts: PRIVATE_KEY !== undefined ? [`${PRIVATE_KEY}`] : [],
      accounts: [`${PRIVATE_KEY_A}`, `${PRIVATE_KEY_B}`],
      chainId: 11155111, // Sepolia Chain ID 
    },
    //
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },     
  //
};

export default config;

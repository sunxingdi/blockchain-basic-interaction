import { ethers } from "hardhat";
import { Wallet, Contract, providers } from "ethers";

const provider = new ethers.JsonRpcProvider()
console.log("ethers version: ", ethers.version);

import {
    SEPOLIA_RPC_URL,
    PRIVATE_KEY_A,
    PRIVATE_KEY_B
} from "../hardhat.config";

const privateKeyA = PRIVATE_KEY_A;
const privateKeyB = PRIVATE_KEY_B;

const wallet_A = new ethers.Wallet(privateKeyA, provider);
const wallet_B = new ethers.Wallet(privateKeyB, provider); 

async function main() {
    const MyContract = await ethers.getContractFactory("Lock", wallet_A); //指定账户部署，需要用私钥初始化

    console.log("\n", "Deploy contract...");
    const myContract = await MyContract.deploy();
    console.log("Contract address:", myContract.target);

    const ContractInstance = await myContract.waitForDeployment();
    // console.log("\nContractInstance: \n", ContractInstance);

    const ContractTransactionResponse = await myContract.deploymentTransaction()
    console.log("\n", "返回交易信息: ", ContractTransactionResponse);

    const txHash = ContractTransactionResponse.hash //获取交易哈希
    const txReceipt = await provider.waitForTransaction(txHash); //等待交易完成，返回交易回执
    // const txReceipt = await provider.getTransactionReceipt(txHash); //该方法有问题，不等待直接获取回执，可能交易还未完成。
    console.log("\n", "获取交易回执...");
    console.log(txReceipt);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
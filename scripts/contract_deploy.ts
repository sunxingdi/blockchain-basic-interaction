import { ethers } from "hardhat";

const provider = new ethers.JsonRpcProvider()
// const abiCoder = new ethers.AbiCoder();
console.log("ethers version: ", ethers.version);

async function main() {
    const MyContract = await ethers.getContractFactory("Lock");

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
    console.log("\n", "txReceipt: ", txReceipt, "\n");

    // const deploy_txn = await MyContract.getDeployTransaction()
    // console.log("deploy_txn:", deploy_txn);

    // await MyContract.deploymentTransaction()
    // console.log("deploy_txn:", deploy_txn);


    // const receipt = await myContract.deployTransaction.wait();
    // console.log(receipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
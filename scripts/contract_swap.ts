import { Wallet, Contract, providers } from "ethers";
import { ethers } from "hardhat";

import { usdt_abi, router_abi } from "./contract_abi";

import {
  SEPOLIA_RPC_URL,
  PRIVATE_KEY_A,
  PRIVATE_KEY_B
} from "../hardhat.config";

let provider: providers.JsonRpcProvider;
const privateKeyA = PRIVATE_KEY_A;
const privateKeyB = PRIVATE_KEY_B;

async function initialSetting() {

  // 查询版本
  console.log("Ethers Version: ", ethers.version)

  // 设置网络
  const hre: HardhatRuntimeEnvironment = await import('hardhat');
  const networkName = hre.network.name; // 获取通过命令行传递的 --network 参数值

  if (networkName === 'sepolia') {
    provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    console.log('网络设置：使用远端RPC网络', networkName);

  } else if (networkName === 'localhost') {
    provider = new ethers.JsonRpcProvider();
    console.log('网络设置：使用本地网络...');

  }  else {
    throw new Error("网络参数错误，请检查...");
  }

  console.log("\n", '检查网络连接...');

  try {
      await provider.getBlockNumber(); // 尝试调用任意一个 provider 方法
      console.log('已连接到以太坊网络.');
  } catch (error) {
      console.log('未连接到以太坊网络：', error.message);
      process.exit()
  }  
}

//业务代码############################################################


const usdt_address = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const weth_address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const router_address = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'; //SushiSwapV2Router02


let wallet_A:Wallet;
let wallet_B: Wallet;

let usdt_contract: Contract;
let router_contract: Contract;

async function initialWallet() {
  console.log("\n", '初始化账户...');

  wallet_A = new ethers.Wallet(privateKeyA, provider);
  wallet_B = new ethers.Wallet(privateKeyB, provider); 
}

async function initialContract() {
  
  console.log("\n", '初始化合约...');
  usdt_contract   = new ethers.Contract(usdt_address,   usdt_abi,   provider);
  router_contract = new ethers.Contract(router_address, router_abi, wallet_A); //如果要发送交易，需要用私钥初始化

  console.log('USDT合约名称：', await usdt_contract.name());
  console.log('工厂合约地址：', await router_contract.factory());

  console.log();
  console.log('账户 A 地址：', wallet_A.address);
  console.log('账户 A 初始余额：', ethers.formatEther(await provider.getBalance(wallet_A.address)), "ETH");
  console.log('账户 A 初始余额：', ethers.formatUnits(await usdt_contract.balanceOf(wallet_A.address), 6), "USDT");
  console.log();
  console.log('账户 B 地址：', wallet_B.address);
  console.log('账户 B 初始余额：', ethers.formatEther(await provider.getBalance(wallet_B.address)), "ETH");
  console.log('账户 B 初始余额：', ethers.formatUnits(await usdt_contract.balanceOf(wallet_B.address), 6), "USDT");    

}

async function calculateGasFees() {

  // 获取最新区块信息
  const block_info = await provider.getBlock('latest');
  // 获取基础gas费
  const base_fee_per_gas = block_info.baseFeePerGas; //单位wei
  // 设置给矿工的小费
  const priority_fee = ethers.parseUnits('50', 'gwei'); // 将 gwei 转为 wei (注意替换为实际的值)
  // 计算maxFeePerGas // EIP-1559 每个区块gas费最大可上下浮动1.125倍(12.5%)，一般本地交易延迟3个区块，所以最大基础费为：1.125 ** 3 = 1.423828125
  const max_fee_per_gas = base_fee_per_gas * BigInt(2) + priority_fee; //单位wei

  return {
      maxPriorityFeePerGas: priority_fee,
      maxFeePerGas: max_fee_per_gas
  };
}

async function makeTransaction() {

  console.log("\n", '构造交易...');
  const network = await provider.getNetwork();
  const chainId = network.chainId;
  const value = ethers.parseEther('10'); // 转账金额, 单位ETH
  const { priority_fee, max_fee_per_gas } = await calculateGasFees();

  // 交易参数
  const overrides = {
    from: wallet_A.address,
    // to: wallet_B.address,
    value: value,
    maxPriorityFeePerGas: priority_fee,
    maxFeePerGas: max_fee_per_gas,
    gasLimit: "30000000",
    // data: '0x',
    chainId: chainId,
    nonce: await provider.getTransactionCount(wallet_A.address),
  };

  console.log("\n", '调用交易所swap函数...');
  const swap_txn = await router_contract.swapExactETHForTokens(
    0,                              // 函数参数：amountOutMin (滑点，slippage)
    [weth_address, usdt_address],   // 函数参数：path (WETH,TOKEN)
    wallet_B.address,               // 函数参数：to (接收代币的地址)
    Math.floor(Date.now() / 1000) + 3600, // 函数参数：Deadline 交易截止时间，设置为当前时间之后的一小时
    overrides // 交易参数
)

  console.log("\n", '返回交易信息...');
  console.log(swap_txn);

  console.log("\n", '等待上链...');
  await swap_txn.wait();

  console.log("\n", '获取交易回执...');
  const receipt = await provider.getTransactionReceipt(swap_txn.hash);
  console.log(receipt);

  console.log("\n", '兑换完成...');

  console.log('账户 A 地址：', wallet_A.address);
  console.log('账户 A 兑换后余额：', ethers.formatEther(await provider.getBalance(wallet_A.address)), "ETH");
  console.log('账户 A 兑换后余额：', ethers.formatUnits(await usdt_contract.balanceOf(wallet_A.address), 6), "USDT");
  console.log();
  console.log('账户 B 地址：', wallet_B.address);
  console.log('账户 B 兑换后余额：', ethers.formatEther(await provider.getBalance(wallet_B.address)), "ETH");
  console.log('账户 B 兑换后余额：', ethers.formatUnits(await usdt_contract.balanceOf(wallet_B.address), 6), "USDT");    

}

async function main() {

  await initialSetting();
  await initialWallet();
  await initialContract();
  await makeTransaction();

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

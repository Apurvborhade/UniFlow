import { erc20Abi, formatUnits } from 'viem';
import { prisma } from '../lib/prisma.js';
import { account, publicClient, walletClient } from '../lib/walletClient.js';
import { getEmployees } from '../services/employees.service.js';
import { depositToGateway, getBalance, getUnifiedAvailableBalanceOfWallet } from '../services/treasury.service.js';
import { parseBalance, waitForTxCompletion } from '../utils/arc/transferHelper.js';
import { getDeveloperControlledWalletsClient } from '../utils/circle-utils.js'
import { ARC_USDC_TESTNET_ADDRESS, USYC_ADDRESS, USYC_TELLER_ADDRESS, USYC_WHITELISTED_WALLET } from '../utils/constants.js';
import { USYC_TELLER_ABI } from '../utils/USYCTellerAbi.js';
import { getUnifiedBalance } from './payroll.controller.js';
import { arcTestnet } from 'viem/chains'
import { deposit } from 'viem/zksync';
import { usycAbi } from '../utils/USYCAbi.js';
const circleDeveloperSdkClientPromise = getDeveloperControlledWalletsClient();

async function createTreasury(req: any, res: any, next: any) {
    // Implementation for creating a treasury
    try {
        const circleDeveloperSdkClient = await circleDeveloperSdkClientPromise;
        const response = await circleDeveloperSdkClient.createWalletSet({
            name: "Wallet Set A"
        });
        const walletCreationResponse = await circleDeveloperSdkClient.createWallets({
            accountType: "EOA",
            blockchains: ["ARC-TESTNET", "AVAX-FUJI", "BASE-SEPOLIA", "ETH-SEPOLIA"],
            count: 1,
            walletSetId: response.data?.walletSet.id || '',
            metadata: [{ refId: "source-depositor" }]
        });

        const walletsData = walletCreationResponse.data

        // await prisma.wallet.create({
        //     data: wallet
        // });

        await
            res.send({ message: 'Treasury Wallet created successfully', data: walletsData });
    } catch (error) {
        next(error)
    }
}


async function getTreasuryBalance(req: any, res: any, next: any) {
    try {
        const balanceResponse = await getBalance();
        const availableUsdBalanceInTreasury = balanceResponse.data?.tokenBalances?.find((token: any) => token.token.symbol === "USDC" || token.token.symbol === "USDC-TESTNET");

        const usdyBalance = await publicClient.readContract({
            address: USYC_ADDRESS as `0x${string}`,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [account.address as `0x${string}`],
        })
        const rawBalance = usdyBalance
        const balance = formatUnits(rawBalance, 6);
        console.log(usdyBalance)
        res.send({ trasuryBalance: availableUsdBalanceInTreasury,usdyBalance: balance });
    } catch (error) {
        next(error)
    }
}

async function getTreasuryWallets(req: any, res: any, next: any) {
    try {
        const circleDeveloperSdkClient = await circleDeveloperSdkClientPromise;
        const walletsResponse = await circleDeveloperSdkClient.listWallets();

        res.send({ wallets: walletsResponse.data });
    } catch (error) {
        next(error)
    }
}

async function depositToGatewayController(req: any, res: any, next: any) {
    try {
        const { chains } = req.body;
        const employees = await getEmployees() as any[];

        const totalSalary = employees?.reduce((acc: any, employee) => acc + employee.salaryAmount.toNumber(), 0.0);

        await depositToGateway(chains, totalSalary);

        res.send({ message: 'Deposit to Gateway successful' });
    } catch (error) {
        next(error)
    }
}

async function depositForYieldFarmingController(req: any, res: any, next: any) {
    const { depositAmount } = req.body;
    try {
        const circleDeveloperSdkClient = await circleDeveloperSdkClientPromise;

        const approveTx = await circleDeveloperSdkClient.createContractExecutionTransaction({
            walletId: process.env.ARC_TESTNET_WALLET_ID || '',
            contractAddress: process.env.ARCTESTNET_USDC_CONTRACT_ADDRESS || '',
            abiFunctionSignature: "approve(address,uint256)",
            abiParameters: [
                USYC_WHITELISTED_WALLET,
                parseBalance(depositAmount.toString()).toString(),
            ],
            fee: { type: "level", config: { feeLevel: "MEDIUM" } },
        });
        const approveTxId = approveTx.data?.id;
        if (!approveTxId) throw new Error("Failed to create approve transaction");

        await waitForTxCompletion(circleDeveloperSdkClient, approveTxId, "USDC approve");

        console.log(`Depositing ${depositAmount} USDC to Yield Farming Wallet`);

        const depositTx = await circleDeveloperSdkClient.createContractExecutionTransaction({
            walletId: process.env.ARC_TESTNET_WALLET_ID || '',
            contractAddress: process.env.ARCTESTNET_USDC_CONTRACT_ADDRESS || '',
            abiFunctionSignature: "transfer(address,uint256)",
            abiParameters: [
                USYC_WHITELISTED_WALLET,
                parseBalance(depositAmount.toString()).toString(),
            ],
            fee: { type: "level", config: { feeLevel: "MEDIUM" } },
        });

        const depositTxId = depositTx.data?.id;
        if (!depositTxId) throw new Error("Failed to create deposit transaction");


        await waitForTxCompletion(circleDeveloperSdkClient, depositTxId, "Transfer to Yield Farming Wallet");

        const depositTxInfo = await circleDeveloperSdkClient.getTransaction({ id: depositTxId });
        console.log("Deposit for Yield Farming Tx Info: ", depositTxInfo.data);
        // Deposit to yield farming wallet is essentially a transfer to a whitelisted wallet.

        const yeildDepositApproveTx = await walletClient.writeContract({
            chain: arcTestnet,
            address: ARC_USDC_TESTNET_ADDRESS as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [USYC_TELLER_ADDRESS as `0x${string}`, parseBalance(depositAmount.toString())],
        })

        const yeildDepositTx = await walletClient.writeContract({
            chain: arcTestnet,
            address: USYC_TELLER_ADDRESS as `0x${string}`,
            abi: USYC_TELLER_ABI,
            functionName: "deposit",
            args: [parseBalance(depositAmount.toString()), account.address as `0x${string}`],
        });

        const txReciept = await publicClient.waitForTransactionReceipt({ hash: yeildDepositTx });

        res.send({ message: 'Deposit for Yield Farming successful' });
    } catch (error) {
        next(error)
    }
}

async function redeemFromYieldFarmingController(req: any, res: any, next: any) {
    const { redeemAmount } = req.body;
    try {
        const circleDeveloperSdkClient = await circleDeveloperSdkClientPromise;
        const redeemTx = await walletClient.writeContract({
            chain: arcTestnet,
            address: USYC_TELLER_ADDRESS as `0x${string}`,
            abi: USYC_TELLER_ABI,
            functionName: "redeem",
            args: [parseBalance(redeemAmount.toString()), account.address, account.address as `0x${string}`],
        });

        const txReciept = await publicClient.waitForTransactionReceipt({ hash: redeemTx });

        const redeemToTreasuryTx = await walletClient.writeContract({
            chain: arcTestnet,
            address: ARC_USDC_TESTNET_ADDRESS as `0x${string}`,
            abi: erc20Abi,
            functionName: "transfer",
            args: [process.env.WALLET_ADDRESS as `0x${string}`, parseBalance(redeemAmount.toString())],
        });

        const redeemTxReciept = await publicClient.waitForTransactionReceipt({ hash: redeemToTreasuryTx });

        res.send({ message: 'Redeem from Yield Farming successful' });
    } catch (error) {
        next(error)
    }
}

export { createTreasury, getTreasuryBalance, getTreasuryWallets, depositToGatewayController, depositForYieldFarmingController, redeemFromYieldFarmingController };
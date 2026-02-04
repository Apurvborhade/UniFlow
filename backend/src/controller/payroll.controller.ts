import { getEmployees } from "../services/employees.service.js";
import { transferFunds } from "../services/payroll.service.js";
import { getBalance, getUnifiedAvailableBalanceOfWallet } from "../services/treasury.service.js";
import { parseSelectedChains } from "../utils/arc/helper.js";
import { CHAIN_CONFIG } from "../utils/arc/transferChainConfig.js";

import { getDeveloperControlledWalletsClient } from "../utils/circle-utils.js";

const circleDeveloperSdkClientPromise = getDeveloperControlledWalletsClient();

async function runPayroll(req: any, res: any, next: any) {
    try {
        const circleDeveloperSdkClient = await circleDeveloperSdkClientPromise;

        const employees = await getEmployees() as any[];

        const totalSalary = employees?.reduce((acc: any, employee) => acc + employee.salaryAmount.toNumber(), 0.0);

        const balance = await getBalance();

        const usdcAmount = balance.data?.tokenBalances?.find((token: any) => token.token.symbol === 'USDC')?.amount || 0;

        if (usdcAmount < totalSalary) {
            throw new Error('Insufficient funds in treasury to run payroll');
        }

        const tokenBalances = balance.data?.tokenBalances?.reduce((acc: any, token: any) => {
            acc[token.token.blockchain] = token.amount;
            return acc;
        }, {});

        // Run transfers
        await transferFunds(employees, circleDeveloperSdkClient);


        res.send({ message: 'Payroll run successfully', totalSalary: totalSalary, employeeCount: employees?.length, tokenBalances: tokenBalances });
    } catch (error) {
        next(error)
    }
}

async function getUnifiedBalance(req: any, res: any, next: any) {
    try {
        const circleDeveloperSdkClient = await circleDeveloperSdkClientPromise;
        const wallets = await circleDeveloperSdkClient.listWallets();

        const chains = ["ethereum", "arc"];
        const selectedChains = parseSelectedChains(chains);

        let balances: Record<string, any> = {};
        for (const chain of selectedChains) {
            const config = CHAIN_CONFIG[chain];
            const USDC_ADDRESS = config.usdc;
            console.log(`Using USDC address: ${USDC_ADDRESS}`);
            const WALLET_ID = config.walletId;

            balances = await getUnifiedAvailableBalanceOfWallet(circleDeveloperSdkClient, WALLET_ID!);

        }


        res.send({ balances });
    } catch (error) {
        next(error)
    }
}

export { runPayroll, getUnifiedBalance };
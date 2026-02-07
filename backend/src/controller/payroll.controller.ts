import fetch from "node-fetch";
import { getEmployees } from "../services/employees.service.js";
import { transferFunds } from "../services/payroll.service.js";
import { getBalance, getUnifiedAvailableBalanceOfWallet } from "../services/treasury.service.js";
import { parseSelectedChains } from "../utils/arc/helper.js";
import { CHAIN_CONFIG } from "../utils/arc/transferChainConfig.js";

import { getDeveloperControlledWalletsClient } from "../utils/circle-utils.js";

const circleDeveloperSdkClientPromise = getDeveloperControlledWalletsClient();

async function runPayroll(req: any, res: any, next: any) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const send = (event: string, data: any = {}) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
        send("INIT")
        const circleDeveloperSdkClient = await circleDeveloperSdkClientPromise;

        const employees = await getEmployees() as any[];

        const totalSalary = employees?.reduce((acc: any, employee) => acc + employee.salaryAmount.toNumber(), 0.0);

        const unifiedBalance = await fetch(`${process.env.DEPLOYED_BACKEND_URL}/payroll/balance`).then(res => res.json()) as any;

        const totalAvailableBalance: number = Object.values(unifiedBalance.balances).reduce((sum: any, balance: any) => sum + parseFloat(balance), 0) as number;





        if (totalAvailableBalance < totalSalary) {
            send("FAILED", { reason: "INSUFFICIENT_FUNDS", availableBalance: totalAvailableBalance, requiredBalance: totalSalary });
            throw new Error('Insufficient funds in treasury to run payroll');
        }

     

        // Run transfers
        await transferFunds(employees, circleDeveloperSdkClient, send);
        send("PAYROLL_COMPLETED", {
            employeeCount: employees.length,
            totalSalary
        });

        res.end();
    } catch (error: any) {
        send("FAILED", { error: error.message });
        res.end();
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
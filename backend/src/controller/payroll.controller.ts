import fetch from "node-fetch";
import { getEmployees } from "../services/employees.service.js";
import { transferFunds } from "../services/payroll.service.js";
import { getBalance, getUnifiedAvailableBalanceOfWallet } from "../services/treasury.service.js";
import { parseSelectedChains } from "../utils/arc/helper.js";
import { CHAIN_CONFIG } from "../utils/arc/transferChainConfig.js";

import { getDeveloperControlledWalletsClient } from "../utils/circle-utils.js";
import { safeJsonFetch } from "../utils/safeJsonFetch.js";

let BACKEND_URL: string;
if (process.env.NODE_ENV !== "production") {
    BACKEND_URL = "http://localhost:8080/api";
} else {
    BACKEND_URL = process.env.DEPLOYED_BACKEND_URL || "http://localhost:3000";
}

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


        const MAX_RETRIES = 2;

        let attempt = 0;
        while (attempt < MAX_RETRIES) {
            attempt++;

            const unifiedBalance = await safeJsonFetch(
                `${BACKEND_URL}/payroll/balance`,
            );

            const totalAvailableBalance = Object.values(unifiedBalance.balances)
                .reduce((sum: number, balance: any) => sum + parseFloat(balance), 0);

            if (totalAvailableBalance >= totalSalary) {
                send("BALANCE_OK", {
                    availableBalance: totalAvailableBalance,
                    requiredBalance: totalSalary,
                    attempt
                });
                break;
            }

            send("FAILED", {
                reason: "INSUFFICIENT_FUNDS",
                availableBalance: totalAvailableBalance,
                requiredBalance: totalSalary,
                attempt
            });

            if (attempt >= MAX_RETRIES) {
                throw new Error("Insufficient funds in treasury after retry");
            }


            send("Yield Redeem", { message: "Redeeming yield to cover payroll shortfall" });


            try {
                await safeJsonFetch(
                    `${BACKEND_URL}/treasury/yield-farming/redeem`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ redeemAmount: 3 })
                }
                )

                send("Yield Redeemed", { message: "Yield redeemed successfully" });

                send("Depositing to Gateway", { message: "Depositing funds to gateway" });

                await safeJsonFetch(
                    `${BACKEND_URL}/treasury/deposit`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
                )

                send("RETRYING_BALANCE_CHECK", { attempt: attempt + 1 });

            } catch (error) {
                send("Yield Redeem Failed", {
                    message: "Yield redeem failed, cannot retry payroll",
                    data: error instanceof Error ? error.message : error
                });
                throw error;
            }
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
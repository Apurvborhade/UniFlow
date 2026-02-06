import { CircleDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { prisma } from "../lib/prisma.js";
import { parse } from "node:path";
import { parseSelectedChains, waitForTxCompletion } from "../utils/arc/helper.js";
import { CHAIN_CONFIG } from "../utils/arc/transferChainConfig.js";
import { burnIntentTypedData, formatUnits, makeBurnIntent, stringifyTypedData } from "../utils/arc/transferHelper.js";
import { DEPOSITOR_ADDRESS, DESTINATION_CHAIN, GATEWAY_MINTER_ADDRESS } from "../utils/arc/transferConstants.js";
import { getUnifiedAvailableBalanceOfWallet } from "./treasury.service.js";
import { AppError } from "../utils/AppError.js";

const domain = { name: "GatewayWallet", version: "1" };

async function transferFunds(employees: any[], circleDeveloperSdkClient: CircleDeveloperControlledWalletsClient, send: (event: string, data?: any) => void) {

    console.log("Parsing selected chains...");
    const chains = ["ethereum", "arc", "base"];
    const selectedChains = await parseSelectedChains(chains);
    console.log("Selected chains:", selectedChains);
    let unifiedBalanceMapping: Record<string, string> = {};

    const distribution: Record<string, number> = {}

    const amount = 1;

    for (const chain of selectedChains) {
        const config = CHAIN_CONFIG[chain];
        unifiedBalanceMapping = await getUnifiedAvailableBalanceOfWallet(circleDeveloperSdkClient, config.walletId!);
    }

    const numericBalances = Object.fromEntries(
        Object.entries(unifiedBalanceMapping).map(([chain, balance]) => [chain, Number(balance)])
    );
    console.log("numeric Balance: ", numericBalances)
    const totalBalance = Object.values(numericBalances).reduce((sum, balance) => sum + balance, 0);

    send("EMPLOYEE_START", {
        employeeCount: employees.length,
        totalSalary: employees.reduce((acc, employee) => acc + employee.salaryAmount.toNumber(), 0.0),
        totalBalance
    });
    console.log(`Processing ${employees.length} employees...`);


    for (const employee of employees) {
        console.log(employee.blockchain)
        try {
            console.log(`Processing employee: ${employee.id || employee.name}`);

            // Create burn intents for chains with available balance
            const employeeRequests: any[] = [];
            const employeeBurnIntents: any[] = [];


            console.log(`Total available balance across all chains: ${totalBalance}`);

            if (totalBalance < employee.salary) {
                throw new AppError(`Insufficient funds to process payroll for employee ${employee.id}. Required: ${employee.salaryAmount}, Available: ${totalBalance}`, 400);
            }
            for (const [chain, balance] of Object.entries(numericBalances)) {
                if (balance === 0) {
                    distribution[chain] = 0
                    continue
                }

                distribution[chain] = Number(
                    ((balance / totalBalance) * employee.salaryAmount.toNumber()).toFixed(6)
                )
            }

            console.log("Distribution: ", distribution)

            for (const chain of selectedChains) {
                const config = CHAIN_CONFIG[chain];
                const chainName = Object.keys(unifiedBalanceMapping).find(
                    key => key.toLowerCase().includes(chain.toLowerCase())
                );

                if (!chainName) continue;


                const availableBalance = parseFloat(unifiedBalanceMapping[chainName]);


                const employeeSalary = employee.salaryAmount.toNumber() || amount;

                if (availableBalance >= employeeSalary) {
                    const burnIntent = makeBurnIntent(chain, employee.preferredChain.toUpperCase(), employee.walletAddress, distribution[chainName]);
                    const typedData = burnIntentTypedData(burnIntent, domain);

                    const sigResp = await circleDeveloperSdkClient.signTypedData({
                        walletId: config.walletId,
                        data: stringifyTypedData(typedData),
                    });

                    employeeRequests.push({
                        burnIntent: typedData.message,
                        signature: sigResp.data?.signature,
                    });

                    employeeBurnIntents.push(burnIntent);
                    console.log(`Created burn intent for ${employee.id} on ${chain}: ${distribution[chainName]} USDC`);

                }
            }

            if (employeeRequests.length === 0) {
                console.warn(`No chains with sufficient balance for employee ${employee.id}`);
                continue;
            }
            send("CROSSCHAIN_TRANSFER", {});
            const response = await fetch(
                "https://gateway-api-testnet.circle.com/v1/transfer",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(employeeRequests, (_key, value) =>
                        typeof value === "bigint" ? value.toString() : value,
                    ),
                },
            );
            console.log(`Gateway API response status: ${response.status}`);

            const json = await response.json();
            const attestation = json?.attestation;
            const operatorSig = json?.signature;

            if (!attestation || !operatorSig) {
                console.error("Gateway /transfer error:", json);
                continue;
            }

            const tx = await circleDeveloperSdkClient.createContractExecutionTransaction({
                walletAddress: DEPOSITOR_ADDRESS,
                blockchain: employee.preferredChain,
                contractAddress: GATEWAY_MINTER_ADDRESS,
                abiFunctionSignature: "gatewayMint(bytes,bytes)",
                abiParameters: [attestation, operatorSig],
                fee: { type: "level", config: { feeLevel: "MEDIUM" } },
            });


            const txId = tx.data?.id;

            send("MINT_TX_SUBMITTED", {
                employeeId: employee.id,
                txId
            });
            if (!txId) throw new Error("Failed to submit mint transaction");

            const txInfo = await circleDeveloperSdkClient.getTransaction({
                id: txId
            })

            console.log("TX Info: ", txInfo.data)


            await waitForTxCompletion(circleDeveloperSdkClient, txId, "USDC mint");

            send("EMPLOYEE_COMPLETED", {
                employeeId: employee.id,
                amount: employee.salaryAmount.toNumber(),
                tx: txInfo.data
            });

            await prisma.transaction.create({
                data: {
                    id: txId
                }
            });


            await prisma.payroll.create({
                data: {
                    employeeId: employee.id,
                    amount: employee.salaryAmount.toNumber(),
                    transactionId: txId,
                }
            });
            const totalMintBaseUnits = employeeBurnIntents.reduce(
                (sum, i) => sum + (i.spec.value ?? 0n),
                0n,
            );
            console.log(`Minted ${formatUnits(totalMintBaseUnits, 6)} USDC for employee ${employee.id}`);

        } catch (err: any) {
            send("EMPLOYEE_FAILED", {
                employeeId: employee.id,
                error: err.message
            });
            console.error("Payroll Transfer Failed for employee:", err.message);
        }
    }
}
export { transferFunds };
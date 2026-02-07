import { CircleDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { prisma } from "../lib/prisma.js";
import { waitForTxCompletion } from "../utils/arc/helper.js";
import { CHAIN_CONFIG, WalletChain } from "../utils/arc/transferChainConfig.js";
import {
    burnIntentTypedData,
    makeBurnIntent,
    stringifyTypedData,
    formatUnits,
} from "../utils/arc/transferHelper.js";
import {
    DEPOSITOR_ADDRESS,
    GATEWAY_MINTER_ADDRESS,
} from "../utils/arc/transferConstants.js";
import { getUnifiedAvailableBalanceOfWallet } from "./treasury.service.js";
import { AppError } from "../utils/AppError.js";
import { PreferredChain } from "../generated/prisma/client/enums.js";

const domain = { name: "GatewayWallet", version: "1" };

const SOURCE_CHAIN = "arc";
const PreferredChainToWalletChain: Record<PreferredChain, WalletChain> = {
  ETH_SEPOLIA: "ETH-SEPOLIA",
  BASE_SEPOLIA: "BASE-SEPOLIA",
  AVAX_FUJI: "AVAX-FUJI",
  ARC_TESTNET: "ARC-TESTNET",
};

export async function transferFunds(
    employees: Array<{ id: string; salaryAmount: { toNumber(): number }; preferredChain: PreferredChain; walletAddress: string }>,
    circleClient: CircleDeveloperControlledWalletsClient,
    send: (event: string, data?: any) => void
) {
    const arcConfig = CHAIN_CONFIG[SOURCE_CHAIN];


    const unifiedBalances = await getUnifiedAvailableBalanceOfWallet(
        circleClient,
        arcConfig.walletId!
    );

    const arcBalance = Number(
        unifiedBalances["Arc Testnet"] ?? "0"
    );

    const totalSalary = employees.reduce(
        (sum, e) => sum + e.salaryAmount.toNumber(),
        0
    );

    send("PAYROLL_START", {
        employeeCount: employees.length,
        totalSalary,
        arcBalance,
    });

    if (arcBalance < totalSalary) {
        throw new AppError(
            `Insufficient ARC balance. Required ${totalSalary}, available ${arcBalance}`,
            400
        );
    }

    let remainingArcBalance = arcBalance;


    for (const employee of employees) {
        try {
            const salary = employee.salaryAmount.toNumber();

            if (remainingArcBalance < salary) {
                throw new Error("ARC balance exhausted mid-payroll"); ``
            }

            send("EMPLOYEE_START", {
                employeeId: employee.id,
                salary,
                destinationChain: employee.preferredChain,
            });


            const burnIntent = makeBurnIntent(
                SOURCE_CHAIN,
                PreferredChainToWalletChain[employee.preferredChain],
                employee.walletAddress,
                salary
            );

            const typedData = burnIntentTypedData(burnIntent, domain);

            const sig = await circleClient.signTypedData({
                walletId: arcConfig.walletId!,
                data: stringifyTypedData(typedData),
            });

            send("CROSSCHAIN_TRANSFER", {
                employeeId: employee.id,
                from: "ARC",
                to: employee.preferredChain,
                amount: salary,
            });


            const response = await fetch(
                "https://gateway-api-testnet.circle.com/v1/transfer",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(
                        [
                            {
                                burnIntent: typedData.message,
                                signature: sig.data!.signature,
                            },
                        ],
                        (_k, v) => (typeof v === "bigint" ? v.toString() : v)
                    ),
                }
            );

            const json = await response.json();

            if (!json.attestation || !json.signature) {
                throw new Error(
                    `Gateway error: ${JSON.stringify(json)}`
                );
            }


            const tx = await circleClient.createContractExecutionTransaction({
                walletAddress: DEPOSITOR_ADDRESS,
                blockchain: PreferredChainToWalletChain[employee.preferredChain],
                contractAddress: GATEWAY_MINTER_ADDRESS,
                abiFunctionSignature: "gatewayMint(bytes,bytes)",
                abiParameters: [json.attestation, json.signature],
                fee: { type: "level", config: { feeLevel: "MEDIUM" } },
            });

            const txId = tx.data?.id;
            if (!txId) throw new Error("Failed to submit mint tx");

            send("MINT_TX_SUBMITTED", {
                employeeId: employee.id,
                txId,
            });

            const finalTx = await waitForTxCompletion(
                circleClient,
                txId,
                "USDC mint"
            );

            remainingArcBalance -= salary;

            await prisma.transaction.create({
                data: { id: txId },
            });

            await prisma.payroll.create({
                data: {
                    employeeId: employee.id,
                    amount: salary,
                    transactionId: txId,
                },
            });

            send("EMPLOYEE_COMPLETED", {
                employeeId: employee.id,
                amount: salary,
                remainingArcBalance,
            });

            console.log(
                `Minted ${salary} USDC for employee ${employee.id}`
            );
        } catch (err: any) {
            send("EMPLOYEE_FAILED", {
                employeeId: employee.id,
                error: err.message,
            });
            console.error("Payroll failed:", err.message);
            break;
        }
    }

    send("PAYROLL_COMPLETE", {
        remainingArcBalance,
    });
}

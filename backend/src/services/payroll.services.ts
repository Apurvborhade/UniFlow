import { CircleDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { prisma } from "../lib/prisma.js";

async function transferFunds(employees: any[], circleDeveloperSdkClient: CircleDeveloperControlledWalletsClient) {
    for (const employee of employees) {
        try {
            // Create TX
            const res = await circleDeveloperSdkClient.createTransaction({
                walletId: "4a8bd80c-c484-5613-ad4a-bf0db193d091",
                tokenId: "f2ab11ae-53fa-5373-86e5-8b38447b65fb",
                destinationAddress: employee.walletAddress,
                amount: [employee.salaryAmount.toString()],
                fee: {
                    type: "level", config: {
                        feeLevel: "MEDIUM",
                    }
                },
            });
            console.log("Payroll Transfer Successful:", res.data);
            // Store Tx Id
            await prisma.transaction.create({
                data: {
                    id: res.data?.id as string,
                }
            });


            // Avoid rate limits
            await new Promise(r => setTimeout(r, 500));

        } catch (err: any) {
            console.log(err)
            console.error("Payroll Transfer Failed:", err.message);
        }
    }
}
export { transferFunds };
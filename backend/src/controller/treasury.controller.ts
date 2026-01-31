import { prisma } from '../lib/prisma.js';
import { getDeveloperControlledWalletsClient } from '../utils/circle-utils.js'

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
            blockchains: ["BASE-SEPOLIA"],
            count: 1,
            walletSetId: response.data?.walletSet.id || '',
        });

        const wallet = walletCreationResponse.data?.wallets[0] as any;

        await prisma.wallet.create({
            data: wallet
        });

        await
            res.send({ message: 'Treasury Wallet created successfully', data: wallet });
    } catch (error) {
        next(error)
    }
}


async function getTreasuryBalance(req: any, res: any, next: any) {
    try {
        const wallets = await prisma.wallet.findMany();
        const walletId = wallets[0].id;
        console.log(walletId)
        const circleDeveloperSdkClient = await circleDeveloperSdkClientPromise;
        const balanceResponse = await circleDeveloperSdkClient.getWalletTokenBalance({
            id: walletId,
        });

        res.send({ walletId: walletId, balance: balanceResponse.data });
    } catch (error) {
        next(error)
    }
}
export { createTreasury, getTreasuryBalance };
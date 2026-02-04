import { prisma } from '../lib/prisma.js';
import { depositToGateway, getBalance } from '../services/treasury.service.js';
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
            res.send({ message: 'Treasury Wallet created successfully', data:walletsData });
    } catch (error) {
        next(error)
    }
}


async function getTreasuryBalance(req: any, res: any, next: any) {
    try {
        const balanceResponse = await getBalance();

        res.send({ balance: balanceResponse.data });
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
        await depositToGateway(chains);

        res.send({ message: 'Deposit to Gateway successful' });
    } catch (error) {
        next(error)
    }
}
export { createTreasury, getTreasuryBalance, getTreasuryWallets, depositToGatewayController };
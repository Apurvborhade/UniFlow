import { prisma } from "../lib/prisma.js";
import { getDeveloperControlledWalletsClient } from '../utils/circle-utils.js'

const circleDeveloperSdkClientPromise = getDeveloperControlledWalletsClient();

async function getBalance() {
    const wallets = await prisma.wallet.findMany();
    const walletId = wallets[0].id;

    const circleDeveloperSdkClient = await circleDeveloperSdkClientPromise;
    return await circleDeveloperSdkClient.getWalletTokenBalance({
        id: walletId,
    });

}

export { getBalance };
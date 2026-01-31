import express from 'express'
import { getDeveloperControlledWalletsClient } from '../utils/circle-utils'
const app = express();

const circleDeveloperSdkClientPromise = getDeveloperControlledWalletsClient();

app.post('/create', async (req, res, next) => {
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

        res.send({ message: 'Treasury Wallet created successfully', data: walletCreationResponse.data?.wallets });
    } catch (error) {
        next(error)
    }
});



app.get('/balance', (req, res) => {
    res.send('Treasury Wallet balance retrieved successfully');
});


export default app;
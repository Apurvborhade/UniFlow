import express from 'express'
import { createTreasury, getTreasuryBalance, getTreasuryWallets, depositToGatewayController, depositForYieldFarmingController,redeemFromYieldFarmingController } from '../controller/treasury.controller.js';



const app = express();


// Create Treasury Wallet
app.post('/create', createTreasury);

// Get Treasury Wallet Balance
app.get('/balance', getTreasuryBalance);

// Get Treasury Wallet
app.get('/', getTreasuryWallets);

// Deposit to Gateway
app.post('/deposit', depositToGatewayController);

// Deposit For Yield Farming
app.post('/yield-farming/deposit', depositForYieldFarmingController);

// Withdraw from Yield Farming
app.post('/yield-farming/redeem', redeemFromYieldFarmingController);

export default app;
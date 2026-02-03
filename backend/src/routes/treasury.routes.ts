import express from 'express'
import { createTreasury, getTreasuryBalance, getTreasuryWallets, depositToGatewayController } from '../controller/treasury.controller.js';



const app = express();


// Create Treasury Wallet
app.post('/create', createTreasury);

// Get Treasury Wallet Balance
app.get('/balance', getTreasuryBalance);

// Get Treasury Wallet
app.get('/', getTreasuryWallets); 

// Deposit to Gateway
app.post('/deposit', depositToGatewayController);



export default app;
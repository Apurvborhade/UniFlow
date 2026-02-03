import express from 'express'
import { createTreasury, getTreasuryBalance, getTreasuryWallets } from '../controller/treasury.controller.js';



const app = express();


// Create Treasury Wallet
app.post('/create', createTreasury);

// Get Treasury Wallet Balance
app.get('/balance', getTreasuryBalance);

// Get Treasury Wallet
app.get('/', getTreasuryWallets); 



export default app;
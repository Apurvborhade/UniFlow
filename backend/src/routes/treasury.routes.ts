import express from 'express'
import { createTreasury, getTreasuryBalance } from '../controller/treasury.controller.js';



const app = express();


// Create Treasury Wallet
app.post('/create', createTreasury);

// Get Treasury Wallet Balance
app.get('/balance', getTreasuryBalance);


export default app;
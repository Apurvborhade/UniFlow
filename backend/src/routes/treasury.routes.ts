import express from 'express'
import { createTreasury } from '../controller/treasury.controller.js';



const app = express();



app.post('/create', createTreasury);



app.get('/balance', (req, res) => {
    res.send('Treasury Wallet balance retrieved successfully');
});


export default app;
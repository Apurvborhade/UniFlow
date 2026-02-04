import express from 'express';

import { getUnifiedBalance, runPayroll } from '../controller/payroll.controller.js';

const app = express();


// Approve Payroll 
app.post('/approve',(req, res) => {
  res.send('Payroll approved successfully');
});

// Run Payroll
app.post('/run',runPayroll);

// Payroll Status
app.get('/status',(req, res) => {
  res.send('Payroll status retrieved successfully');
});

// Get Unified Balance
app.get('/balance', getUnifiedBalance);

export default app;
import express from 'express';

import { getUnifiedBalance, runPayroll } from '../controller/payroll.controller.js';
import { prisma } from '../lib/prisma.js';

const app = express();


// Approve Payroll 
app.post('/approve', (req, res) => {
  res.send('Payroll approved successfully');
});

// Run Payroll
app.get('/run', runPayroll);

// Payroll Status
app.get('/status', (req, res) => {
  res.send('Payroll status retrieved successfully');
});

app.get('/history', async (req, res) => {
  await prisma.payroll.findMany().then((payrolls) => {
    res.send({ payrolls });
  }).catch((error) => {
    res.status(500).send({ error: 'Failed to retrieve payroll history' });
  });
});

// Get Unified Balance
app.get('/balance', getUnifiedBalance);

export default app;
import express from 'express';

const app = express();


// Approve Payroll 
app.post('/approve',(req, res) => {
  res.send('Payroll approved successfully');
});

// Run Payroll
app.post('/run',(req, res) => {
  res.send('Payroll run successfully');
});

// Payroll Status
app.get('/status',(req, res) => {
  res.send('Payroll status retrieved successfully');
});

export default app;
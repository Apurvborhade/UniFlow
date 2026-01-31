import express from 'express'

const app = express();

app.post('/create',(req, res) => {
  res.send('Treasury Wallet created successfully');
});

app.get('/balance',(req, res) => {
  res.send('Treasury Wallet balance retrieved successfully');
});


export default app;
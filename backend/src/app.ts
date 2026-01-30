import express from 'express';
import { errorHandler } from './middleware/errorHandler.middleware';
const app = express();

// System Health
app.get('/api/health', (req, res) => {
  res.send('System is healthy');
});

// Payouts

// Admin routes

// Middleware for error handling
app.use(errorHandler);

export default app;
import express from 'express';

// Middleware imports
import { errorHandler } from './middleware/errorHandler.middleware';

// Route imports
import employeeRoutes from './routes/employees.routes';
import payrollRoutes from './routes/payroll.routes';
import treasuryRoutes from './routes/treasury.routes';

const app = express();

// System Health
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// Payroll routes
app.use('/api/payroll', payrollRoutes);

// Employee routes
app.use('/api/employees', employeeRoutes);

// Treasury Wallet routes
app.use('/api/treasury', treasuryRoutes);

// Middleware for error handling
app.use(errorHandler);

export default app;
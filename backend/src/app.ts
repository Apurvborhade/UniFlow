import express from 'express';

// Middleware imports
import { errorHandler } from './middleware/errorHandler.middleware.js';

// Route imports
import employeeRoutes from './routes/employees.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import treasuryRoutes from './routes/treasury.routes.js';

// Scheduler
import { startScheduler } from './utils/scheduler.js';

const app = express();

app.use(express.json());



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

// Scheduler
startScheduler();

// Middleware for error handling
app.use(errorHandler);

export default app;
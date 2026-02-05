import express from 'express';
import cors from 'cors'
// Middleware imports
import { errorHandler } from './middleware/errorHandler.middleware.js';

// Route imports
import employeeRoutes from './routes/employees.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import treasuryRoutes from './routes/treasury.routes.js';
import payrollSchedule from './routes/payrollSchedule.routes.js'
// Scheduler
import { startScheduler } from './utils/scheduler.js';

const app = express();

app.use(express.json());
app.use(cors({
    origin: '*',
}));


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

//Payroll Scheduler
app.use('/api/scheduler/payroll', payrollSchedule);


// Scheduler
startScheduler();

// Middleware for error handling
app.use(errorHandler);

export default app;
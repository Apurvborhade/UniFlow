import express from 'express';
import { createEmployee,getEmployees } from '../controller/employee.controller.js';

const app = express();

// Add Single Employee
app.post('/add', createEmployee);

// Bulk Add Employees
app.post('/upload', (req, res) => {
  res.send('Employees uploaded successfully');
});

// Get
app.get('/', getEmployees);


export default app;


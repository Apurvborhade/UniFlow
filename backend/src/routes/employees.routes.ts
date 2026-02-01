import express from 'express';
import { createEmployee,getEmployees,bulkUploadEmployees,updateEmployee,deleteEmployee } from '../controller/employee.controller.js';
import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const app = express();

// Add Single Employee
app.post('/add', createEmployee);

// Bulk Add Employees
app.post('/upload',upload.single("file"), bulkUploadEmployees);

// Update Employee
app.put('/update/:id', updateEmployee);

// Delete Employee
app.delete('/delete/:id', deleteEmployee);

// Get
app.get('/', getEmployees);


export default app;


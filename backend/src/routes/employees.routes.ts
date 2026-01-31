import express from 'express';

const app = express();

// Add Single Employee
app.post('/add', (req, res) => {
  res.send('Employee added successfully');
});

// Bulk Add Employees
app.post('/upload', (req, res) => {
  res.send('Employees uploaded successfully');
});

// Get
app.get('/', (req, res) => {
  res.send('List of employees');
});


export default app;


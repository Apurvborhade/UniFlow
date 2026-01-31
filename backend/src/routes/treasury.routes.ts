import express from 'express'

const app = express();

app.post('/create', async (req, res, next) => {
    try {
        res.send({ message: 'Treasury Wallet created successfully'});
    } catch (error) {
        next(error)
    }
});



app.get('/balance', (req, res) => {
    res.send('Treasury Wallet balance retrieved successfully');
});


export default app;
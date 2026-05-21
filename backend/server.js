const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 8000;

// Rate limiting (200 requests per 15 minutes window)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { status: 'error', message: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(cors());
app.use(express.json());
app.use('/api/', limiter);

app.use('/api/v1', apiRouter);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'ReviewPulse API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`ReviewPulse Express Backend running on http://localhost:${PORT}`);
    });
}

module.exports = app;

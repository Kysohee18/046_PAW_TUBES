const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./models');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 8000;

// Vercel always sets X-Forwarded-For -- trust it so express-rate-limit can
// read the real client IP instead of throwing ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
app.set('trust proxy', 1);

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
        orm: 'Sequelize ORM v6',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Auto-sync Sequelize models with database
db.sequelize.authenticate()
    .then(() => {
        console.log('✅ Sequelize ORM connected to PostgreSQL / Supabase successfully!');
        return db.sequelize.sync();
    })
    .then(() => {
        console.log('⚡ All Sequelize models synchronized with database!');
    })
    .catch((err) => {
        console.warn('⚠️ Sequelize connection notice:', err.message);
    });

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`ReviewPulse Express Backend (Sequelize ORM) running on http://localhost:${PORT}`);
    });
}

module.exports = app;

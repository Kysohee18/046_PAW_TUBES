const jwt = require('jsonwebtoken');
const db = require('../config/database');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Access Token Required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'reviewpulse_super_secret_jwt_key_2026');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ status: 'error', message: 'Invalid or Expired Token' });
    }
};

const verifyApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ status: 'error', message: 'X-API-KEY Header Required' });
    }

    try {
        const query = 'SELECT * FROM api_keys WHERE key = $1 AND is_active = TRUE';
        const { rows } = await db.query(query, [apiKey]);

        if (rows.length === 0) {
            return res.status(403).json({ status: 'error', message: 'Invalid or Inactive API Key' });
        }

        const keyData = rows[0];

        if (keyData.usage_count >= keyData.usage_limit) {
            return res.status(429).json({ status: 'error', message: 'API Key Usage Limit Exceeded' });
        }

        // Increment usage count and update last_used timestamp
        await db.query('UPDATE api_keys SET usage_count = usage_count + 1 WHERE key = $1', [apiKey]);

        req.apiKey = keyData;
        next();
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = { verifyToken, verifyApiKey };

const jwt = require('jsonwebtoken');
const db = require('../models');

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
        const keyRecord = await db.ApiKey.findOne({
            where: { key: apiKey, is_active: true }
        });

        if (!keyRecord) {
            return res.status(403).json({ status: 'error', message: 'Invalid or Inactive API Key' });
        }

        if (keyRecord.usage_count >= keyRecord.usage_limit) {
            return res.status(429).json({ status: 'error', message: 'API Key Usage Limit Exceeded' });
        }

        // Increment usage count and update last_used timestamp
        await keyRecord.increment('usage_count', { by: 1 });
        await keyRecord.update({ last_used: new Date() });

        req.apiKey = keyRecord;
        next();
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'Admin Access Required' });
    }
    next();
};

module.exports = { verifyToken, verifyApiKey, requireAdmin };

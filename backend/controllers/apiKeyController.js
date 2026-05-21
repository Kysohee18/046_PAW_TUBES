const crypto = require('crypto');
const pool = require('../config/database');

const createApiKey = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;

        const rawKey = `rp_${crypto.randomBytes(24).toString('hex')}`;
        const keyPrefix = rawKey.substring(0, 8);

        const query = `
            INSERT INTO api_keys (user_id, key, name, key_prefix, usage_limit)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, key, key_prefix, usage_limit, usage_count, is_active, created_at;
        `;
        const { rows } = await pool.query(query, [userId, rawKey, name || 'Default Key', keyPrefix, 1000]);

        return res.status(201).json({
            status: 'success',
            message: 'API Key generated successfully',
            apiKey: rows[0]
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

const getUserApiKeys = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = 'SELECT id, name, key_prefix, usage_limit, usage_count, is_active, created_at, last_used FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC';
        const { rows } = await pool.query(query, [userId]);

        return res.status(200).json({
            status: 'success',
            apiKeys: rows
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

const revokeApiKey = async (req, res) => {
    try {
        const userId = req.user.id;
        const { keyId } = req.params;

        const query = 'UPDATE api_keys SET is_active = FALSE WHERE id = $1 AND user_id = $2 RETURNING *';
        const { rows } = await pool.query(query, [keyId, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'API key not found' });
        }

        return res.status(200).json({
            status: 'success',
            message: 'API Key revoked successfully'
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = { createApiKey, getUserApiKeys, revokeApiKey };

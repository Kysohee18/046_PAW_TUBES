const crypto = require('crypto');
const db = require('../models');

const createApiKey = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;

        const rawKey = `rp_${crypto.randomBytes(24).toString('hex')}`;
        const keyPrefix = rawKey.substring(0, 8);

        const newKey = await db.ApiKey.create({
            user_id: userId,
            key: rawKey,
            name: name || 'Default Key',
            key_prefix: keyPrefix,
            usage_limit: 1000,
            usage_count: 0,
            is_active: true
        });

        return res.status(201).json({
            status: 'success',
            message: 'API Key generated successfully',
            apiKey: newKey
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

const getUserApiKeys = async (req, res) => {
    try {
        const userId = req.user.id;
        const apiKeys = await db.ApiKey.findAll({
            where: { user_id: userId },
            attributes: { exclude: ['key'] },
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            status: 'success',
            apiKeys
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

const revokeApiKey = async (req, res) => {
    try {
        const userId = req.user.id;
        const { keyId } = req.params;

        const keyRecord = await db.ApiKey.findOne({
            where: { id: keyId, user_id: userId }
        });

        if (!keyRecord) {
            return res.status(404).json({ status: 'error', message: 'API key not found' });
        }

        await keyRecord.update({ is_active: false });

        return res.status(200).json({
            status: 'success',
            message: 'API Key revoked successfully'
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = { createApiKey, getUserApiKeys, revokeApiKey };

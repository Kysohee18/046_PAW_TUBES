const db = require('../models');

const listUsers = async (req, res) => {
    try {
        const users = await db.User.findAll({
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']]
        });
        return res.status(200).json({ status: 'success', users });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

const listAllApiKeys = async (req, res) => {
    try {
        const apiKeys = await db.ApiKey.findAll({
            attributes: { exclude: ['key'] },
            include: [{ model: db.User, as: 'user', attributes: ['id', 'email', 'full_name'] }],
            order: [['created_at', 'DESC']]
        });
        return res.status(200).json({ status: 'success', apiKeys });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

const listAllUsageLogs = async (req, res) => {
    try {
        const usageLogs = await db.UsageLog.findAll({
            order: [['created_at', 'DESC']],
            limit: 200
        });
        return res.status(200).json({ status: 'success', usageLogs });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

const revokeAnyApiKey = async (req, res) => {
    try {
        const { keyId } = req.params;
        const keyRecord = await db.ApiKey.findByPk(keyId);

        if (!keyRecord) {
            return res.status(404).json({ status: 'error', message: 'API key not found' });
        }

        await keyRecord.update({ is_active: false });
        return res.status(200).json({ status: 'success', message: 'API key revoked by admin' });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = { listUsers, listAllApiKeys, listAllUsageLogs, revokeAnyApiKey };

const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');
const { createApiKey, getUserApiKeys, revokeApiKey } = require('../controllers/apiKeyController');
const { analyzeReviews, getReviewHistory } = require('../controllers/reviewController');
const { listUsers, listAllApiKeys, listAllUsageLogs, revokeAnyApiKey } = require('../controllers/adminController');
const { verifyToken, verifyApiKey, requireAdmin } = require('../middleware/authMiddleware');

// Authentication routes
router.post('/auth/register', register);
router.post('/auth/login', login);

// User API Key management routes (JWT protected)
router.post('/user/api-keys', verifyToken, createApiKey);
router.get('/user/api-keys', verifyToken, getUserApiKeys);
router.delete('/user/api-keys/:keyId', verifyToken, revokeApiKey);

// Review Intelligence routes
router.post('/review/analyze', verifyApiKey, analyzeReviews);
router.get('/review/history', getReviewHistory);

// Admin routes (JWT protected + role: admin)
router.get('/admin/users', verifyToken, requireAdmin, listUsers);
router.get('/admin/api-keys', verifyToken, requireAdmin, listAllApiKeys);
router.get('/admin/usage-logs', verifyToken, requireAdmin, listAllUsageLogs);
router.delete('/admin/api-keys/:keyId', verifyToken, requireAdmin, revokeAnyApiKey);

module.exports = router;

const db = require('../config/database');
const { fetchProductReviews } = require('../services/reviewFetcher');
const { analyzeReviewSentiment, extractProductFlaws, calculateFeatureCsat, generateActionItems } = require('../services/aiAnalyzer');

const analyzeReviews = async (req, res) => {
    const startTime = Date.now();
    try {
        const { keyword, productName, platform = 'shopee' } = req.body;

        if (!keyword) {
            return res.status(400).json({ status: 'error', message: 'Keyword is required' });
        }

        const cachedQuery = 'SELECT * FROM product_analyses WHERE keyword = $1 ORDER BY created_at DESC LIMIT 1';
        const cachedRes = await db.query(cachedQuery, [keyword.toLowerCase()]);

        if (cachedRes.rows.length > 0) {
            const cached = cachedRes.rows[0];
            const ageHours = (new Date() - new Date(cached.created_at)) / (1000 * 60 * 60);

            if (ageHours < 24) {
                // Log usage
                if (req.apiKey) {
                    await db.query(
                        'INSERT INTO usage_logs (user_id, api_key_id, endpoint, method, response_time, status_code) VALUES ($1, $2, $3, $4, $5, $6)',
                        [req.apiKey.user_id || 1, req.apiKey.id || 1, '/api/v1/review/analyze', 'POST', (Date.now() - startTime) / 1000, 200]
                    );
                }

                return res.status(200).json({
                    status: 'success',
                    cached: true,
                    data: cached
                });
            }
        }

        const reviews = await fetchProductReviews(keyword, platform);
        const sentiment = analyzeReviewSentiment(reviews);
        const flaws = extractProductFlaws(reviews);
        const featureCsat = calculateFeatureCsat(reviews, sentiment.averageCsat);
        const actionItems = generateActionItems(flaws);

        const insertQuery = `
            INSERT INTO product_analyses 
            (keyword, product_name, platform, total_reviews, positive_count, negative_count, neutral_count, average_csat, flaws_detected, feature_csat, ai_action_items)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;
        const values = [
            keyword.toLowerCase(),
            productName || keyword,
            platform,
            sentiment.total,
            sentiment.positive,
            sentiment.negative,
            sentiment.neutral,
            sentiment.averageCsat,
            JSON.stringify(flaws),
            JSON.stringify(featureCsat),
            JSON.stringify(actionItems)
        ];

        const { rows } = await db.query(insertQuery, values);

        // Record usage log
        if (req.apiKey) {
            await db.query(
                'INSERT INTO usage_logs (user_id, api_key_id, endpoint, method, response_time, status_code) VALUES ($1, $2, $3, $4, $5, $6)',
                [req.apiKey.user_id || 1, req.apiKey.id || 1, '/api/v1/review/analyze', 'POST', (Date.now() - startTime) / 1000, 200]
            );
        }

        return res.status(200).json({
            status: 'success',
            cached: false,
            data: rows[0]
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

const getReviewHistory = async (req, res) => {
    try {
        const query = 'SELECT * FROM product_analyses ORDER BY created_at DESC';
        const { rows } = await db.query(query);

        return res.status(200).json({
            status: 'success',
            total: rows.length,
            history: rows
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = { analyzeReviews, getReviewHistory };

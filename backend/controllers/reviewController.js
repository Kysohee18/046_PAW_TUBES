const db = require('../models');
const { fetchProductReviews } = require('../services/reviewFetcher');
const { analyzeReviewSentiment, extractProductFlaws, calculateFeatureCsat, generateActionItems } = require('../services/aiAnalyzer');

const analyzeReviews = async (req, res) => {
    const startTime = Date.now();
    try {
        const { keyword, productName, platform = 'shopee' } = req.body;

        if (!keyword) {
            return res.status(400).json({ status: 'error', message: 'Keyword is required' });
        }

        const cached = await db.ProductAnalysis.findOne({
            where: { keyword: keyword.toLowerCase() },
            order: [['created_at', 'DESC']]
        });

        if (cached) {
            const ageHours = (new Date() - new Date(cached.created_at)) / (1000 * 60 * 60);

            if (ageHours < 24) {
                // Record usage log
                if (req.apiKey) {
                    await db.UsageLog.create({
                        user_id: req.apiKey.user_id || 1,
                        api_key_id: req.apiKey.id || 1,
                        endpoint: '/api/v1/review/analyze',
                        method: 'POST',
                        response_time: (Date.now() - startTime) / 1000,
                        status_code: 200
                    });
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

        const newAnalysis = await db.ProductAnalysis.create({
            keyword: keyword.toLowerCase(),
            product_name: productName || keyword,
            platform,
            total_reviews: sentiment.total,
            positive_count: sentiment.positive,
            negative_count: sentiment.negative,
            neutral_count: sentiment.neutral,
            average_csat: sentiment.averageCsat,
            flaws_detected: flaws,
            feature_csat: featureCsat,
            ai_action_items: actionItems
        });

        // Record usage log
        if (req.apiKey) {
            await db.UsageLog.create({
                user_id: req.apiKey.user_id || 1,
                api_key_id: req.apiKey.id || 1,
                endpoint: '/api/v1/review/analyze',
                method: 'POST',
                response_time: (Date.now() - startTime) / 1000,
                status_code: 200
            });
        }

        return res.status(200).json({
            status: 'success',
            cached: false,
            data: newAnalysis
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

const getReviewHistory = async (req, res) => {
    try {
        const history = await db.ProductAnalysis.findAll({
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            status: 'success',
            total: history.length,
            history
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = { analyzeReviews, getReviewHistory };

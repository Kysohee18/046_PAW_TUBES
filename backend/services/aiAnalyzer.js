const vader = require('vader-sentiment');

const categories = {
    battery: {
        keywords: ['battery', 'baterai', 'boros', 'charging', 'charger', 'panas', 'drop', 'mati'],
        defaultNote: 'Baterai cepat habis atau kendala pengisian daya.'
    },
    packaging: {
        keywords: ['packaging', 'kemasan', 'rusak', 'pecah', 'bocor', 'kardus', 'bubble', 'penyok'],
        defaultNote: 'Kemasan penyok atau perlindungan bubble wrap kurang.'
    },
    shipping: {
        keywords: ['lambat', 'shipping', 'pengiriman', 'kurir', 'lama', 'telat', 'ekspedisi'],
        defaultNote: 'Pengiriman kurir terlambat melewati estimasi tiba.'
    },
    quality: {
        keywords: ['jelek', 'cacat', 'patah', 'quality', 'tipis', 'bahan', 'rusak', 'palsu', 'kw'],
        defaultNote: 'Kualitas material atau finishing fisik di bawah ekspektasi.'
    }
};

const analyzeReviewSentiment = (reviews) => {
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    reviews.forEach((review) => {
        const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(review.text);
        if (intensity.compound >= 0.05) positive++;
        else if (intensity.compound <= -0.05) negative++;
        else neutral++;
    });

    const total = reviews.length || 1;
    const csat = Number((((positive * 5 + neutral * 3 + negative * 1) / (total * 5)) * 5).toFixed(2));

    return {
        total,
        positive,
        negative,
        neutral,
        averageCsat: csat
    };
};

const extractProductFlaws = (reviews) => {
    const flawResults = [];

    Object.keys(categories).forEach((aspect) => {
        const matchingReviews = reviews.filter((review) => {
            const text = review.text.toLowerCase();
            return categories[aspect].keywords.some((kw) => text.includes(kw));
        });

        const count = matchingReviews.length;
        const severity = count >= 3 ? 'high' : count >= 1 ? 'medium' : 'low';
        const impact = count > 0 ? `-${(count * 0.20).toFixed(2)} pts` : '0.00 pts';

        // Extract most representative note from negative reviews if available
        const negativeMatch = matchingReviews.find((r) => r.rating <= 3 || vader.SentimentIntensityAnalyzer.polarity_scores(r.text).compound < 0);
        const note = negativeMatch ? negativeMatch.text.split('[Product:')[0].trim() : categories[aspect].defaultNote;

        flawResults.push({
            aspect,
            count,
            impact,
            severity,
            note
        });
    });

    return flawResults.sort((a, b) => b.count - a.count);
};

const calculateFeatureCsat = (reviews, overallCsat) => {
    const featureScores = {};

    Object.keys(categories).forEach((aspect) => {
        const matchingReviews = reviews.filter((review) => {
            const text = review.text.toLowerCase();
            return categories[aspect].keywords.some((kw) => text.includes(kw));
        });

        if (matchingReviews.length === 0) {
            featureScores[aspect] = Math.min(5.0, Number((overallCsat + 0.3).toFixed(2)));
        } else {
            const ratings = matchingReviews.map((r) => r.rating || (vader.SentimentIntensityAnalyzer.polarity_scores(r.text).compound >= 0.05 ? 5 : 2));
            const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
            featureScores[aspect] = Number(avg.toFixed(2));
        }
    });

    return featureScores;
};

const generateActionItems = (flaws) => {
    const actionMap = {
        battery: 'Gunakan cell baterai berkapasitas lebih besar dan tambahkan instruksi pengisian daya yang aman.',
        packaging: 'Tambahkan kardus luar ganda dan bubble wrap minimal 3 lapis untuk melindungi produk.',
        shipping: 'Gunakan layanan kurir prioritas dan proses pesanan sebelum jam 15:00 di hari yang sama.',
        quality: 'Tingkatkan standar Quality Control (QC) fisik sebelum produk dikemas.'
    };

    return flaws
        .filter((f) => f.count > 0)
        .map((f) => ({
            aspect: f.aspect,
            count: f.count,
            severity: f.severity,
            recommendation: actionMap[f.aspect] || 'Lakukan evaluasi ulasan pembeli dan perbaiki aspek operasional.'
        }));
};

module.exports = {
    analyzeReviewSentiment,
    extractProductFlaws,
    calculateFeatureCsat,
    generateActionItems
};

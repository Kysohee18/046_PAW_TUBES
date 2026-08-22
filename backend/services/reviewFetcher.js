const fs = require('fs');
const path = require('path');

const seedPool = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'reviewSeed.json'), 'utf8'));

// Deterministic hash so the same keyword always samples the same subset (stable results per product).
const hashSeed = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
};

const fetchProductReviews = async (keyword, platform = 'shopee') => {
    const formattedKeyword = keyword.trim().toLowerCase();
    const seed = hashSeed(formattedKeyword);
    const sampleSize = 15;

    const start = seed % seedPool.length;
    const picked = [];
    for (let i = 0; i < sampleSize; i++) {
        picked.push(seedPool[(start + i * 37) % seedPool.length]);
    }

    return picked.map((r, index) => ({
        id: index + 1,
        author: r.author,
        rating: r.rating,
        platform,
        created_at: new Date(Date.now() - (index * 86400000 / 2)),
        text: r.text
    }));
};

module.exports = { fetchProductReviews };

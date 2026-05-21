const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let pool = null;
let useMemoryStore = false;

// In-Memory Store for instant zero-config operations & offline development
const memoryStore = {
    users: [
        {
            id: 1,
            email: 'seller@store.com',
            password_hash: bcrypt.hashSync('seller123', 10),
            full_name: 'Demo Seller',
            company_name: 'TechStore ID',
            role: 'seller',
            created_at: new Date()
        }
    ],
    api_keys: [
        {
            id: 1,
            user_id: 1,
            key: 'rp_demo_key_1234567890',
            name: 'Default Demo Key',
            key_prefix: 'rp_demo_',
            usage_limit: 1000,
            usage_count: 14,
            is_active: true,
            created_at: new Date(),
            last_used: new Date()
        }
    ],
    product_analyses: [
        {
            id: 1,
            keyword: 'headphone bluetooth',
            product_name: 'Headphone Bluetooth Wireless',
            platform: 'shopee',
            total_reviews: 12,
            positive_count: 5,
            negative_count: 4,
            neutral_count: 3,
            average_csat: 3.45,
            flaws_detected: [
                { aspect: 'battery', count: 4, severity: 'high', note: 'Baterai cepat panas & boros pas dipake 1 jam' },
                { aspect: 'packaging', count: 3, severity: 'medium', note: 'Kardus penyok & bubble wrap tipis saat dikirim' },
                { aspect: 'shipping', count: 2, severity: 'low', note: 'Kurir lambat H+3 pengiriman' },
                { aspect: 'quality', count: 1, severity: 'low', note: 'Bahan plastik agak tipis' }
            ],
            feature_csat: {
                battery: 2.80,
                packaging: 3.10,
                shipping: 3.90,
                quality: 3.70
            },
            ai_action_items: [
                { aspect: 'battery', count: 4, severity: 'high', recommendation: 'Gunakan cell baterai berkapasitas lebih besar dan tambahkan instruksi pengisian daya yang aman.' },
                { aspect: 'packaging', count: 3, severity: 'medium', recommendation: 'Tambahkan kardus luar ganda dan bubble wrap minimal 3 lapis untuk melindungi produk.' },
                { aspect: 'shipping', count: 2, severity: 'low', recommendation: 'Gunakan layanan kurir prioritas dan proses pesanan sebelum jam 15:00 di hari yang sama.' }
            ],
            created_at: new Date(Date.now() - 3600000)
        }
    ],
    usage_logs: []
};

let userSeq = 2;
let keySeq = 2;
let analysisSeq = 2;
let logSeq = 1;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
    try {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    } catch (e) {
        console.warn('PostgreSQL pool init failed, falling back to Memory Store.');
        useMemoryStore = true;
    }
} else {
    useMemoryStore = true;
}

const db = {
    async query(text, params = []) {
        if (!useMemoryStore && pool) {
            try {
                return await pool.query(text, params);
            } catch (err) {
                console.warn('PostgreSQL query error, falling back to Memory Store:', err.message);
            }
        }

        // Clean & Normalize SQL command
        const sql = text.trim().replace(/\s+/g, ' ');

        // 1. SELECT users by email
        if (sql.includes('SELECT') && sql.includes('FROM users WHERE email = $1')) {
            const email = (params[0] || '').toLowerCase();
            const found = memoryStore.users.filter(u => u.email.toLowerCase() === email);
            return { rows: found };
        }

        // 2. SELECT users id
        if (sql.includes('SELECT id FROM users WHERE email = $1')) {
            const email = (params[0] || '').toLowerCase();
            const found = memoryStore.users.filter(u => u.email.toLowerCase() === email);
            return { rows: found.map(u => ({ id: u.id })) };
        }

        // 3. INSERT INTO users
        if (sql.includes('INSERT INTO users')) {
            const [email, password_hash, full_name, company_name] = params;
            const newUser = {
                id: userSeq++,
                email: email.toLowerCase(),
                password_hash,
                full_name,
                company_name: company_name || '',
                role: 'seller',
                created_at: new Date()
            };
            memoryStore.users.push(newUser);
            return { rows: [newUser] };
        }

        // 4. SELECT api_keys by key and is_active
        if (sql.includes('SELECT * FROM api_keys WHERE key = $1 AND is_active = TRUE')) {
            const key = params[0];
            const found = memoryStore.api_keys.filter(k => k.key === key && k.is_active);
            return { rows: found };
        }

        // 5. SELECT api_keys for user
        if (sql.includes('SELECT') && sql.includes('FROM api_keys WHERE user_id = $1')) {
            const userId = params[0];
            const found = memoryStore.api_keys.filter(k => k.user_id === userId);
            return { rows: found.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) };
        }

        // 6. INSERT INTO api_keys
        if (sql.includes('INSERT INTO api_keys')) {
            const [user_id, key, name, key_prefix, usage_limit] = params;
            const newKey = {
                id: keySeq++,
                user_id,
                key,
                name,
                key_prefix,
                usage_limit: usage_limit || 1000,
                usage_count: 0,
                is_active: true,
                created_at: new Date(),
                last_used: null
            };
            memoryStore.api_keys.push(newKey);
            return { rows: [newKey] };
        }

        // 7. UPDATE api_keys REVOKE (is_active = FALSE)
        if (sql.includes('UPDATE api_keys SET is_active = FALSE WHERE id = $1')) {
            const [keyId, userId] = params;
            const keyObj = memoryStore.api_keys.find(k => k.id == keyId && k.user_id == userId);
            if (keyObj) {
                keyObj.is_active = false;
                return { rows: [keyObj] };
            }
            return { rows: [] };
        }

        // 8. UPDATE api_keys usage count increment
        if (sql.includes('UPDATE api_keys SET usage_count = usage_count + 1')) {
            const [key] = params;
            const keyObj = memoryStore.api_keys.find(k => k.key === key);
            if (keyObj) {
                keyObj.usage_count = (keyObj.usage_count || 0) + 1;
                keyObj.last_used = new Date();
                return { rows: [keyObj] };
            }
            return { rows: [] };
        }

        // 9. SELECT product_analyses cached check
        if (sql.includes('SELECT * FROM product_analyses WHERE keyword = $1')) {
            const keyword = (params[0] || '').toLowerCase();
            const found = memoryStore.product_analyses
                .filter(p => p.keyword.toLowerCase() === keyword)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return { rows: found.slice(0, 1) };
        }

        // 10. SELECT product_analyses list (history)
        if (sql.includes('SELECT * FROM product_analyses') && (sql.includes('ORDER BY created_at DESC') || sql.includes('WHERE') || !sql.includes('WHERE keyword'))) {
            const sorted = [...memoryStore.product_analyses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return { rows: sorted };
        }

        // 11. INSERT INTO product_analyses
        if (sql.includes('INSERT INTO product_analyses')) {
            const [
                keyword, product_name, platform, total_reviews,
                positive_count, negative_count, neutral_count,
                average_csat, flaws_detected, feature_csat, ai_action_items
            ] = params;

            const newAnalysis = {
                id: analysisSeq++,
                keyword,
                product_name,
                platform,
                total_reviews,
                positive_count,
                negative_count,
                neutral_count,
                average_csat,
                flaws_detected: typeof flaws_detected === 'string' ? JSON.parse(flaws_detected) : flaws_detected,
                feature_csat: typeof feature_csat === 'string' ? JSON.parse(feature_csat) : feature_csat,
                ai_action_items: typeof ai_action_items === 'string' ? JSON.parse(ai_action_items) : ai_action_items,
                created_at: new Date()
            };
            memoryStore.product_analyses.push(newAnalysis);
            return { rows: [newAnalysis] };
        }

        // 12. INSERT INTO usage_logs
        if (sql.includes('INSERT INTO usage_logs')) {
            const [user_id, api_key_id, endpoint, method, response_time, status_code] = params;
            const newLog = {
                id: logSeq++,
                user_id,
                api_key_id,
                endpoint,
                method,
                response_time,
                status_code,
                created_at: new Date()
            };
            memoryStore.usage_logs.push(newLog);
            return { rows: [newLog] };
        }

        // Default empty result
        return { rows: [] };
    }
};

module.exports = db;

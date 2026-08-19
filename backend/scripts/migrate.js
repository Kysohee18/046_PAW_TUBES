const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const rawUrl = process.argv[2] || process.env.DATABASE_URL || '';
const dbUrl = rawUrl.trim().replace(/^["']|["']$/g, '');

if (!dbUrl || (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://'))) {
    console.error('❌ Error: DATABASE_URL is not set or invalid.');
    console.log('Usage: node scripts/migrate.js "postgres://postgres.[REF]:[PASS]@[HOST]:6543/postgres"');
    console.log('Or set DATABASE_URL in backend/.env');
    process.exit(1);
}

const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    console.log('🔄 Connecting to PostgreSQL/Supabase database...');
    let client;
    try {
        client = await pool.connect();
        console.log('📄 Reading schema.sql...');
        const schemaPath = path.join(__dirname, '..', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('⚡ Injecting DDL SQL into database...');
        await client.query(schemaSql);
        console.log('✅ Tables (users, api_keys, product_analyses, usage_logs) successfully created/verified!');

        // Check & Seed Demo Seller User
        console.log('🌱 Checking seed data...');
        const userCheck = await client.query("SELECT id FROM users WHERE email = 'seller@store.com'");
        let userId;

        if (userCheck.rows.length === 0) {
            const passwordHash = await bcrypt.hash('seller123', 10);
            const userRes = await client.query(
                "INSERT INTO users (email, password_hash, full_name, company_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
                ['seller@store.com', passwordHash, 'Demo Seller', 'TechStore ID', 'seller']
            );
            userId = userRes.rows[0].id;
            console.log('✅ Demo user seeded (seller@store.com / seller123)');
        } else {
            userId = userCheck.rows[0].id;
            console.log('ℹ️ Demo user already exists.');
        }

        // Check & Seed Default API Key
        const keyCheck = await client.query("SELECT id FROM api_keys WHERE key = 'rp_demo_key_1234567890'");
        if (keyCheck.rows.length === 0) {
            await client.query(
                "INSERT INTO api_keys (user_id, key, name, key_prefix, usage_limit, usage_count, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                [userId, 'rp_demo_key_1234567890', 'Default Demo Key', 'rp_demo_', 1000, 14, true]
            );
            console.log('✅ Demo API key seeded (rp_demo_key_1234567890)');
        } else {
            console.log('ℹ️ Demo API key already exists.');
        }

        console.log('\n🎉 ALL SQL INJECTIONS & SEEDS COMPLETED SUCCESSFULLY! Database is 100% ready for production.');
    } catch (err) {
        console.error('❌ Migration error:', err.message);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

runMigration();

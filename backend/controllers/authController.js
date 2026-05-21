const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const register = async (req, res) => {
    try {
        const { email, password, fullName, companyName } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ status: 'error', message: 'Email, password, and fullName are required' });
        }

        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ status: 'error', message: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = `
            INSERT INTO users (email, password_hash, full_name, company_name)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, full_name, company_name, role, created_at;
        `;
        const { rows } = await pool.query(insertQuery, [email.toLowerCase(), hashedPassword, fullName, companyName || '']);

        const user = rows[0];
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'reviewpulse-secret-key-change-this-in-production-2026',
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            token,
            user
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 'error', message: 'Email and password are required' });
        }

        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        if (rows.length === 0) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'reviewpulse-secret-key-change-this-in-production-2026',
            { expiresIn: '7d' }
        );

        delete user.password_hash;

        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            token,
            user
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = { register, login };

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');

const register = async (req, res) => {
    try {
        const { email, password, fullName, companyName } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ status: 'error', message: 'Email, password, and fullName are required' });
        }

        const existingUser = await db.User.findOne({ where: { email: email.toLowerCase() } });
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.User.create({
            email: email.toLowerCase(),
            password_hash: hashedPassword,
            full_name: fullName,
            company_name: companyName || '',
            role: 'seller'
        });

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET || 'reviewpulse_super_secret_jwt_key_2026',
            { expiresIn: '7d' }
        );

        const userResponse = {
            id: newUser.id,
            email: newUser.email,
            full_name: newUser.full_name,
            company_name: newUser.company_name,
            role: newUser.role,
            created_at: newUser.created_at
        };

        return res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            token,
            user: userResponse
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

        const user = await db.User.findOne({ where: { email: email.toLowerCase() } });
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'reviewpulse_super_secret_jwt_key_2026',
            { expiresIn: '7d' }
        );

        const userResponse = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            company_name: user.company_name,
            role: user.role
        };

        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = { register, login };

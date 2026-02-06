/**
 * Authentication Routes
 * Register, Login, and Profile endpoints with JWT
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                error: existingUser.email === email
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                stats: user.stats
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * POST /api/auth/login
 * Login with email/password
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                stats: user.stats,
                hasBrandDNA: !!user.brandDNA
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('-password')
            .populate('brandDNA');

        res.json({ user });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/**
 * GET /api/auth/stats
 * Get user KPIs/stats for dashboard
 */
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('stats');

        // Calculate additional KPIs
        const Content = require('../models/Content');
        const contents = await Content.find({ userId: req.userId });

        const totalVariants = contents.reduce((sum, c) => sum + (c.variants?.length || 0), 0);
        const approvedVariants = contents.reduce((sum, c) =>
            sum + (c.variants?.filter(v => v.status === 'approved' || v.status === 'published').length || 0), 0);

        const hitRate = totalVariants > 0
            ? Math.round((approvedVariants / totalVariants) * 100)
            : 85; // Default 85% per sources

        const automationRate = contents.length > 0
            ? Math.round((contents.filter(c => c.orchestrationStatus === 'completed').length / contents.length) * 100)
            : 0;

        res.json({
            stats: user.stats,
            kpis: {
                hitRate,
                automationRate,
                totalContent: contents.length,
                totalVariants,
                avgConsistencyScore: Math.round(
                    contents.reduce((sum, c) => sum + (c.kpis?.avgConsistencyScore || 0), 0) / (contents.length || 1)
                )
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;

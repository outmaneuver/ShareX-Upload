const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../config/config');

router.post('/login', async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        const user = await User.findOne({
            $or: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        });

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        if (user.isSuspended) {
            return res.status(403).json({
                status: 'error',
                message: 'Account is suspended'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        req.session.userId = user._id;
        req.session.username = user.username;

        res.json({
            status: 'success',
            message: 'Login successful',
            redirect: '/dashboard'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred during login'
        });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Error logging out'
            });
        }
        res.json({
            status: 'success',
            message: 'Logged out successfully',
            redirect: '/auth/login'
        });
    });
});

module.exports = router; 
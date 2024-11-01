const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../config/config');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        // Find user by username or email
        const user = await User.findOne({
            $or: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        });

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username/email or password'
            });
        }

        // Compare password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username/email or password'
            });
        }

        // Set user session
        req.session.userId = user._id;
        req.session.username = user.username;

        // Redirect to dashboard on successful login
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

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router; 
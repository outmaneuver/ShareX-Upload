const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../config/config');
const crypto = require('crypto');

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
                message: 'Error during logout'
            });
        }
        
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.json({
            status: 'success',
            message: 'Logged out successfully',
            redirect: '/login'
        });
    });
});

// Add forgot password route
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Please provide an email address' });
    }

    try {
        const user = await User.findOne({ email });
        
        // Don't reveal if user exists or not for security
        if (!user) {
            return res.status(200).json({ message: 'If an account exists with this email, you will receive a password reset link shortly.' });
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetToken = token;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Send email with reset link
        // Note: You'll need to implement the email sending functionality
        // This is just a placeholder
        console.log(`Reset link: ${process.env.BASE_URL}/reset-password?token=${token}`);

        res.status(200).json({ message: 'If an account exists with this email, you will receive a password reset link shortly.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'An error occurred while processing your request' });
    }
});

module.exports = router; 
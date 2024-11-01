const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../config/config');
const { isAuthenticated } = require('../middleware/authMiddleware');
const router = express.Router();

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// GET route for login page
router.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.sendFile('login.html', { root: './public' });
});

// User login route
router.post('/login', async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        if (!usernameOrEmail || !password) {
            return res.status(400).json({ 
                status: 'error',
                message: 'All fields are required' 
            });
        }

        const user = await User.findOne({
            $or: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                status: 'error', 
                message: 'Invalid credentials'
            });
        }

        req.session.userId = user._id;
        req.session.isAuthenticated = true;
        
        await new Promise((resolve) => req.session.save(resolve));

        res.json({
            status: 'success',
            redirect: user.isAdmin ? '/admin_dashboard' : '/dashboard'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error occurred'
        });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

module.exports = router;

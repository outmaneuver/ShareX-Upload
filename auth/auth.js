const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../config/config');

const router = express.Router();

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password format
function isStrongPassword(password) {
    const containsLetter = /[a-zA-Z]/.test(password);
    const containsDigit = /\d/.test(password);
    const containsSpecial = /[^a-zA-Z\d]/.test(password);
    const isLongEnough = password.length >= 8;
    return containsLetter && containsDigit && containsSpecial && isLongEnough;
}

// GET route for login page
router.get('/login', (req, res) => {
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

        if (!user) {
            return res.status(401).json({
                status: 'error', 
                message: 'Invalid credentials'
            });
        }

        if (user.isSuspended) {
            return res.status(403).json({
                status: 'error',
                message: 'Account suspended. Please contact support.'
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        req.session.userId = user._id;
        const redirectUrl = user.isAdmin ? '/admin_dashboard' : '/dashboard';

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            redirectUrl
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server error occurred'
        });
    }
});

// Session management middleware
router.use((req, res, next) => {
    if (req.session && req.session.userId) {
        User.findById(req.session.userId, (err, user) => {
            if (user) {
                req.user = user;
                delete req.user.password; // delete the password from the session
                req.session.user = user;  // refresh the session value
                res.locals.user = user;
            }
            next();
        });
    } else {
        next();
    }
});

module.exports = router;

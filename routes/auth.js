const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../config/config');

router.get('/login', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.sendFile('login.html', { root: './public' });
    }
});

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
                message: 'Invalid username/email or password'
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username/email or password'
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

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

module.exports = router; 
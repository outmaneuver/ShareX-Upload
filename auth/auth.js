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

// User login route
router.post('/login', async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    if (!isValidEmail(usernameOrEmail) && !/^[a-zA-Z0-9_]+$/.test(usernameOrEmail)) {
        return res.status(400).json({ message: 'Invalid username or email format.' });
    }

    if (!isStrongPassword(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long and include at least one letter, one number, and one special character.' });
    }

    try {
        const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });

        if (!user) {
            return res.status(404).json({ message: 'Username or email not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password.' });
        }

        req.session.userId = user._id;
        if (user.isAdmin) {
            return res.status(200).json({ message: 'Login successful', redirectUrl: '/admin_dashboard' });
        } else {
            return res.status(200).json({ message: 'Login successful', redirectUrl: '/dashboard' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
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

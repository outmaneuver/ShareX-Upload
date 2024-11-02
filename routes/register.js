import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

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

// User registration route
router.post('/', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (!isStrongPassword(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long and include at least one letter, one number, and one special character.' });
    }

    try {
        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ message: 'Username already taken.' });
        }

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        // Set session and redirect
        req.session.userId = newUser._id;
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router; 
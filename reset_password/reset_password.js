import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User';
import PasswordReset from '../models/PasswordReset';

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

// Request password reset route
router.post('/request-reset', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Please enter your email.' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Email not found.' });
        }

        const token = crypto.randomBytes(50).toString('hex');
        const passwordReset = new PasswordReset({ email, token });
        await passwordReset.save();

        const resetLink = `${req.protocol}://${req.get('host')}/reset_password?token=${token}`;

        // Send email with reset link (implementation not shown)
        // ...

        return res.status(200).json({ message: 'Password reset link has been sent to your email.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (!isStrongPassword(newPassword)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long and include at least one letter, one number, and one special character.' });
    }

    try {
        const passwordReset = await PasswordReset.findOne({ token });

        if (!passwordReset) {
            return res.status(400).json({ message: 'Invalid token.' });
        }

        const user = await User.findOne({ email: passwordReset.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        await PasswordReset.deleteOne({ token });

        return res.status(200).json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
});

export default router;

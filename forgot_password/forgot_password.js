import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { User } from '../models/User.js';

const router = express.Router();

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

        const forgotPasswordDomain = await SiteStatistic.findOne({ name: 'forgot_password_domain' });
        const resetLink = `${forgotPasswordDomain.value}/reset_password?token=${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-email-password',
            },
        });

        const mailOptions = {
            from: 'no-reply@yourdomain.com',
            to: email,
            subject: 'Password Reset Request',
            text: `Click the following link to reset your password: ${resetLink}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Failed to send password reset link.', error });
            } else {
                return res.status(200).json({ message: 'Password reset link has been sent to your email.' });
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
});

// Update password route
router.post('/update-password', async (req, res) => {
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

        user.password = newPassword;
        await user.save();

        await PasswordReset.deleteOne({ token });

        return res.status(200).json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
});

export default router;

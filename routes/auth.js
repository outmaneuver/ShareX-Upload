import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../config/config.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const router = express.Router();

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

        // Create email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD // Use app-specific password
            }
        });

        // Get the base URL from environment variables
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const resetLink = `${baseUrl}/reset-password?token=${token}`;

        // Email template
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request - ShareX Upload',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset for your ShareX Upload account.</p>
                <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
                <a href="${resetLink}" style="
                    background-color: #2196F3;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 4px;
                    display: inline-block;
                    margin: 16px 0;
                ">Reset Password</a>
                <p>If you didn't request this password reset, you can safely ignore this email.</p>
                <p>For security reasons, this link will expire in 1 hour.</p>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p>${resetLink}</p>
            `
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email sending error:', error);
                return res.status(500).json({ message: 'Failed to send password reset email' });
            }
            console.log('Password reset email sent:', info.response);
            res.status(200).json({ message: 'If an account exists with this email, you will receive a password reset link shortly.' });
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'An error occurred while processing your request' });
    }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ 
            status: 'error',
            message: 'Missing required fields' 
        });
    }

    try {
        // Find user with valid reset token
        const user = await User.findOne({ 
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Invalid or expired password reset token' 
            });
        }

        // Check if new password is same as old password
        const isSamePassword = await user.isSamePassword(password);
        if (isSamePassword) {
            return res.status(400).json({
                status: 'error',
                message: 'New password must be different from your current password'
            });
        }

        // Update user's password
        user.password = password; // Will be hashed by pre-save middleware
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        
        await user.save(); // This will trigger the pre-save middleware

        res.json({ 
            status: 'success',
            message: 'Password has been reset successfully' 
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'An error occurred while resetting your password' 
        });
    }
});

export default router; 
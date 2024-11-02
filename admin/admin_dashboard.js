import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Announcement, SiteStatistic } from '../config/config.js';
import { isAdmin } from '../middleware/authMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Remove duplicate isAdmin middleware since it's imported
router.use(isAdmin);

// Fix missing closing brackets and add error handling
router.post('/suspend_user', async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        user.isSuspended = true;
        await user.save();
        res.status(200).send('User suspended successfully');
    } catch (error) {
        res.status(500).send('Error suspending user');
    }
});

// Add missing functionality for user deletion
router.post('/delete_user', async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        
        // Delete all user's uploads
        await Upload.deleteMany({ userId: user._id });
        
        // Delete the user
        await User.findByIdAndDelete(user._id);
        
        res.status(200).send('User and associated data deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting user');
    }
});

// Add missing functionality for forgot password domain
router.post('/update_forgot_password_domain', async (req, res) => {
    try {
        const { domain } = req.body;
        if (!domain) {
            return res.status(400).send('Domain is required');
        }

        await SiteStatistic.findOneAndUpdate(
            { name: 'forgot_password_domain' },
            { value: domain, updatedAt: new Date() },
            { upsert: true }
        );

        res.status(200).send('Forgot password domain updated successfully');
    } catch (error) {
        res.status(500).send('Error updating forgot password domain');
    }
});

// Add dashboard page route
router.get('/', (req, res) => {
    if (!req.session.userId || !req.user?.isAdmin) {
        return res.redirect('/auth/login');
    }
    res.sendFile(path.join(__dirname, '../public/admin_dashboard.html'));
});

export default router;

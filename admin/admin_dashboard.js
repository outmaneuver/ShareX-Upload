import express from 'express';
import mongoose from 'mongoose';
import { User, Announcement, SiteStatistic } from '../models/config';

const router = express.Router();

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).send('Forbidden');
    }
}

// Route to post an announcement
router.post('/post_announcement', isAdmin, async (req, res) => {
    try {
        const announcement = new Announcement({
            content: req.body.content
        });
        await announcement.save();
        res.status(200).send('Announcement posted successfully');
    } catch (error) {
        res.status(500).send('Error posting announcement');
    }
});

// Route to suspend a user
router.post('/suspend_user', isAdmin, async (req, res) => {
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

// Route to delete a user
router.post('/delete_user', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        await user.remove();
        res.status(200).send('User deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting user');
    }
});

// Route to set upload size for a user
router.post('/set_upload_size', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        user.uploadSize = req.body.uploadSize;
        await user.save();
        res.status(200).send('Upload size set successfully');
    } catch (error) {
        res.status(500).send('Error setting upload size');
    }
});

// Route to update forgot password domain
router.post('/update_forgot_password_domain', isAdmin, async (req, res) => {
    try {
        await SiteStatistic.findOneAndUpdate({ name: 'forgot_password_domain' }, { value: req.body.domain });
        res.status(200).send('Forgot password domain updated successfully');
    } catch (error) {
        res.status(500).send('Error updating forgot password domain');
    }
});

// Route to fetch announcements
router.get('/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).send('Error fetching announcements');
    }
});

// Route to fetch forgot password domain
router.get('/forgot_password_domain', async (req, res) => {
    try {
        const domain = await SiteStatistic.findOne({ name: 'forgot_password_domain' });
        res.status(200).json(domain);
    } catch (error) {
        res.status(500).send('Error fetching forgot password domain');
    }
});

export default router;

const express = require('express');
const mongoose = require('mongoose');
const { User, Announcement, SiteStatistic } = require('../config/config');

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

// Add user search and filtering
router.get('/users', isAdmin, async (req, res) => {
    try {
        const { search, sortBy = 'createdAt', order = 'desc', page = 1 } = req.query;
        const limit = 10;
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { username: new RegExp(search, 'i') },
                    { email: new RegExp(search, 'i') }
                ]
            };
        }

        const users = await User.find(query)
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(limit)
            .select('-password');

        const total = await User.countDocuments(query);

        res.json({
            status: 'success',
            data: {
                users,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page: parseInt(page),
                    limit
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching users'
        });
    }
});

module.exports = router;

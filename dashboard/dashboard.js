const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User, Upload, SiteStatistic } = require('../config/config');
const path = require('path');
const { isAuthenticated } = require('../middleware/authMiddleware');
const crypto = require('crypto');

const router = express.Router();

// Route to fetch user images with filtering and sorting
router.get('/images', isAuthenticated, async (req, res) => {
    try {
        const { sortBy = 'createdAt', order = 'desc', filter } = req.query;
        const query = { userId: req.user._id };
        
        if (filter) {
            query.mimetype = new RegExp(filter, 'i');
        }

        const images = await Upload.find(query)
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .limit(50);

        const stats = await Upload.aggregate([
            { $match: { userId: req.user._id } },
            { 
                $group: {
                    _id: null,
                    totalSize: { $sum: '$size' },
                    totalFiles: { $sum: 1 }
                }
            }
        ]);

        res.json({
            status: 'success',
            data: {
                images,
                stats: stats[0] || { totalSize: 0, totalFiles: 0 }
            }
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching images'
        });
    }
});

// Add password change route
router.post('/change-password', isAuthenticated, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!isMatch) {
            return res.status(400).json({
                status: 'error',
                message: 'Current password is incorrect'
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        
        res.json({
            status: 'success',
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error updating password'
        });
    }
});

// Add statistics route
router.get('/statistics', isAuthenticated, async (req, res) => {
    try {
        const stats = await Upload.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalUploads: { $sum: 1 },
                    totalSize: { $sum: '$size' },
                    lastUpload: { $max: '$createdAt' }
                }
            }
        ]);

        const hostStats = {
            version: process.version,
            platform: process.platform,
            uptime: process.uptime()
        };

        res.json({
            uploads: stats[0]?.totalUploads || 0,
            storageUsed: stats[0]?.totalSize || 0,
            lastUpload: stats[0]?.lastUpload || null,
            hostInfo: hostStats
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching statistics'
        });
    }
});

// Add settings update route
router.post('/settings', isAuthenticated, async (req, res) => {
    try {
        const { file_name_length, upload_password, hide_user_info } = req.body;
        await User.findByIdAndUpdate(req.user._id, {
            file_name_length,
            upload_password,
            hide_user_info
        });
        res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings', error });
    }
});

// Add route to delete an image
router.delete('/images/:id', isAuthenticated, async (req, res) => {
    try {
        await Upload.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image', error });
    }
});

// Add route to update user profile
router.post('/profile', isAuthenticated, async (req, res) => {
    try {
        const { email } = req.body;
        await User.findByIdAndUpdate(req.user._id, { email });
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
});

// Add route to get user profile info
router.get('/profile/info', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('email username');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user info', error });
    }
});

// Add config generation route
router.get('/generate-config', isAuthenticated, async (req, res) => {
    try {
        // Generate unique filename based on user's file_name_length setting
        const fileNameLength = req.user.file_name_length || 10;
        const generateFileName = () => crypto.randomBytes(fileNameLength).toString('hex');

        // Generate upload password if not exists
        if (!req.user.upload_password) {
            const upload_password = crypto.randomBytes(32).toString('hex');
            await User.findByIdAndUpdate(req.user._id, { upload_password });
            req.user.upload_password = upload_password;
        }

        const domain = `${req.protocol}://${req.get('host')}`;
        
        const config = {
            Version: "13.0.1",
            Name: `${req.user.username}'s Config`,
            DestinationType: "ImageUploader",
            RequestMethod: "POST",
            RequestURL: `${domain}/upload`,
            Headers: {
                "Authorization": req.user.upload_password
            },
            Body: "MultipartFormData",
            FileFormName: "image",
            URL: "$json:url$",
            ErrorMessage: "$json:message$"
        };

        res.setHeader('Content-Disposition', `attachment; filename=${req.user.username}-sharex-config.sxcu`);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(config, null, 2));
    } catch (error) {
        res.status(500).json({ message: 'Error generating config', error });
    }
});

// Rest of your routes...

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const { User, Upload, SiteStatistic } = require('../config/config');
const path = require('path');

const router = express.Router();

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

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

// Route to fetch user settings
router.get('/settings', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({
            file_name_length: user.file_name_length,
            upload_password: user.upload_password,
            hide_user_info: user.hide_user_info
        });
    } catch (error) {
        res.status(500).send('Error fetching settings');
    }
});

// Route to fetch site statistics
router.get('/statistics', async (req, res) => {
    try {
        const statistics = await SiteStatistic.find();
        res.status(200).json(statistics);
    } catch (error) {
        res.status(500).send('Error fetching statistics');
    }
});

// Route to delete an image
router.post('/delete_image', isAuthenticated, async (req, res) => {
    try {
        await Upload.findByIdAndDelete(req.body.imageId);
        res.status(200).send('Image deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting image');
    }
});

// Route to update user settings
router.post('/update_settings', isAuthenticated, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            file_name_length: req.body.file_name_length,
            upload_password: req.body.upload_password,
            hide_user_info: req.body.hide_user_info
        });
        res.status(200).send('Settings updated successfully');
    } catch (error) {
        res.status(500).send('Error updating settings');
    }
});

// Route to serve the dashboard
router.get('/', isAuthenticated, (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

module.exports = router;

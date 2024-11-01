const express = require('express');
const mongoose = require('mongoose');
const { User, Upload, SiteStatistic } = require('../config/config');
const path = require('path');
const { isAuthenticated } = require('../middleware/authMiddleware');

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

// Rest of your routes...

module.exports = router;

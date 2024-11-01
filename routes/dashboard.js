import express from 'express';
import bcrypt from 'bcryptjs';
import { User, Upload, SiteStatistic } from '../config/config.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

// Your existing dashboard routes...

// Add this route to your existing dashboard.js
router.get('/user-data', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

// Add statistics route
router.get('/statistics', isAuthenticated, async (req, res) => {
    try {
        // Get user's uploads statistics
        const stats = await Upload.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(req.user._id) } },
            {
                $group: {
                    _id: null,
                    totalUploads: { $sum: 1 },
                    totalSize: { $sum: '$size' }
                }
            }
        ]);

        // If no uploads found, return default values
        if (!stats.length) {
            return res.json({
                status: 'success',
                uploads: 0,
                storageUsed: 0
            });
        }

        res.json({
            status: 'success',
            uploads: stats[0].totalUploads,
            storageUsed: stats[0].totalSize
        });

    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching statistics'
        });
    }
});

export default router; 
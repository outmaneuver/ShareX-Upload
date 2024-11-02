import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User, Upload, SiteStatistic } from '../config/config.js';
import path from 'path';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import crypto from 'crypto';
const profileInfoRouter = require('./profile/info');

const router = express.Router();

// Add profile info route
router.get('/profile/info', isAuthenticated, async (req, res) => {
    try {
        // Fetch user info from database using session ID
        const user = await User.findById(req.session.userId)
            .select('email username')
            .lean();

        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                message: 'User not found' 
            });
        }

        // Return only email and username
        res.json({
            status: 'success',
            email: user.email,
            username: user.username
        });
    } catch (error) {
        console.error('Error fetching profile info:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error fetching user information' 
        });
    }
});

// Route to fetch user images with filtering and sorting
router.get('/images', isAuthenticated, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Check if user has any uploads
        const totalUploads = await Upload.countDocuments({ userId: req.session.userId });
        
        if (totalUploads === 0) {
            return res.json({
                status: 'success',
                data: {
                    images: [],
                    hasMore: false
                }
            });
        }

        const images = await Upload.find({ userId: req.session.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const hasMore = totalUploads > skip + images.length;

        res.json({
            status: 'success',
            data: {
                images,
                hasMore
            }
        });
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error fetching images' 
        });
    }
});

// Add statistics route
router.get('/statistics', isAuthenticated, async (req, res) => {
    try {
        // Check if user has any uploads first
        const hasUploads = await Upload.exists({ userId: req.session.userId });
        
        if (!hasUploads) {
            return res.json({
                status: 'success',
                uploads: 0,
                storageUsed: 0
            });
        }

        const stats = await Upload.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.session.userId) } },
            {
                $group: {
                    _id: null,
                    totalUploads: { $sum: 1 },
                    totalSize: { $sum: '$size' }
                }
            }
        ]);

        res.json({
            status: 'success',
            uploads: stats[0]?.totalUploads || 0,
            storageUsed: stats[0]?.totalSize || 0
        });
    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error fetching statistics' 
        });
    }
});

// Add config generation route
router.get('/generate-config', isAuthenticated, async (req, res) => {
    try {
        const fileNameLength = req.user.file_name_length || 10;
        const generateFileName = () => crypto.randomBytes(fileNameLength).toString('hex');

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

router.use('/profile/info', profileInfoRouter);

export default router;

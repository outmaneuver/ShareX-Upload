import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User, Upload, SiteStatistic } from '../config/config.js';
import path from 'path';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
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
        const showDeleted = req.query.showDeleted === 'true';
        const skip = (page - 1) * limit;

        // Build query based on showDeleted parameter
        const query = { 
            userId: req.session.userId
        };
        if (!showDeleted) {
            query.$and = [
                { deleted: { $ne: true } },
                { missing: { $ne: true } }
            ];
        }

        // Check if user has any uploads
        const totalUploads = await Upload.countDocuments(query);
        
        if (totalUploads === 0) {
            return res.json({
                status: 'success',
                data: {
                    images: [],
                    hasMore: false
                }
            });
        }

        const images = await Upload.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Check if files exist on disk
        for (let image of images) {
            const filePath = path.join(__dirname, '..', 'uploads', image.filename);
            try {
                await fs.access(filePath);
                image.missing = false;
            } catch {
                image.missing = true;
                // Update the database if file is missing
                await Upload.findByIdAndUpdate(image._id, { missing: true });
            }
        }

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

// Update the statistics route to handle missing files
router.get('/statistics', isAuthenticated, async (req, res) => {
    try {
        const stats = await Upload.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.session.userId) } },
            {
                $group: {
                    _id: null,
                    totalUploads: { $sum: 1 },
                    totalActiveUploads: {
                        $sum: {
                            $cond: [
                                { $or: [
                                    { $eq: ["$deleted", true] },
                                    { $eq: ["$missing", true] }
                                ]},
                                0,
                                1
                            ]
                        }
                    },
                    totalDeletedUploads: {
                        $sum: {
                            $cond: [
                                { $or: [
                                    { $eq: ["$deleted", true] },
                                    { $eq: ["$missing", true] }
                                ]},
                                1,
                                0
                            ]
                        }
                    },
                    totalSize: { $sum: '$size' },
                    activeTotalSize: {
                        $sum: {
                            $cond: [
                                { $or: [
                                    { $eq: ["$deleted", true] },
                                    { $eq: ["$missing", true] }
                                ]},
                                0,
                                "$size"
                            ]
                        }
                    }
                }
            }
        ]);

        res.json({
            status: 'success',
            uploads: stats[0]?.totalActiveUploads || 0,
            totalUploads: stats[0]?.totalUploads || 0,
            deletedUploads: stats[0]?.totalDeletedUploads || 0,
            storageUsed: stats[0]?.activeTotalSize || 0,
            totalStorageUsed: stats[0]?.totalSize || 0
        });
    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error fetching statistics' 
        });
    }
});

// Update the generate-config route
router.get('/generate-config', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
            .select('username file_name_length upload_password')
            .lean();

        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                message: 'User not found' 
            });
        }

        const fileNameLength = user.file_name_length || 10;
        const generateFileName = () => crypto.randomBytes(fileNameLength).toString('hex');

        if (!user.upload_password) {
            const upload_password = crypto.randomBytes(32).toString('hex');
            await User.findByIdAndUpdate(req.session.userId, { upload_password });
            user.upload_password = upload_password;
        }

        const domain = `${req.protocol}://${req.get('host')}`;
        
        const config = {
            Version: "13.0.1",
            Name: `${user.username}'s Config`,
            DestinationType: "ImageUploader",
            RequestMethod: "POST",
            RequestURL: `${domain}/api/upload`,
            Headers: {
                "Authorization": user.upload_password
            },
            Body: "MultipartFormData",
            FileFormName: "image",
            URL: "$json:url$",
            ThumbnailURL: "",
            DeletionURL: "",
            ErrorMessage: "$json:message$"
        };

        res.setHeader('Content-Disposition', `attachment; filename=${user.username}-sharex-config.sxcu`);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error generating config:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error generating config file' 
        });
    }
});

// Update the delete route to actually delete files
router.delete('/images/:id', isAuthenticated, async (req, res) => {
    try {
        const imageId = req.params.id;
        
        // Find the image and verify ownership
        const image = await Upload.findOne({ 
            _id: imageId, 
            userId: req.session.userId 
        });

        if (!image) {
            return res.status(404).json({
                status: 'error',
                message: 'Image not found or unauthorized'
            });
        }

        // Delete the physical file
        try {
            const filePath = path.join(__dirname, '..', 'uploads', image.filename);
            await fs.access(filePath); // Check if file exists
            await fs.unlink(filePath); // Delete the file
            console.log(`File deleted successfully: ${filePath}`);
        } catch (err) {
            console.error('File deletion error:', err);
            // Continue even if file doesn't exist, but mark it as missing
            image.missing = true;
        }

        // Update the database record
        image.deleted = true;
        image.deletedAt = new Date();
        await image.save();

        res.json({
            status: 'success',
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting image'
        });
    }
});

router.use('/profile/info', profileInfoRouter);

export default router;

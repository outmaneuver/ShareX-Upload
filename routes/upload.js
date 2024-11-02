const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { User, Upload } = require('../config/config');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: async (req, file, cb) => {
        try {
            const authHeader = req.headers.authorization;
            const user = await User.findOne({ upload_password: authHeader });
            
            if (!user) {
                return cb(new Error('Invalid upload password'));
            }

            // Use user's file_name_length setting
            const length = user.file_name_length || 10;
            const randomString = crypto.randomBytes(Math.ceil(length/2))
                .toString('hex')
                .slice(0, length);
            
            const ext = path.extname(file.originalname);
            const filename = `${randomString}${ext}`;
            cb(null, filename);
        } catch (error) {
            cb(error);
        }
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Add file type validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type'));
        }
        cb(null, true);
    }
});

router.post('/', async (req, res, next) => {
    try {
        // Verify authorization before processing upload
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                status: 'error',
                message: 'Missing authorization header'
            });
        }

        const user = await User.findOne({ upload_password: authHeader });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid upload password'
            });
        }

        // Process upload after verification
        upload.single('image')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: err.message
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No file uploaded'
                });
            }

            const uploadRecord = new Upload({
                userId: user._id,
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path
            });

            await uploadRecord.save();

            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            res.json({
                status: 'success',
                url: fileUrl
            });
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 
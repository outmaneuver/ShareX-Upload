const express = require('express');
const multer = require('multer');
const path = require('path');
const { User, Upload } = require('../config/config');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Update the upload route to handle files
router.post('/', async (req, res, next) => {  // Changed from /upload to /
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                status: 'error',
                error: 'No authentication provided'
            });
        }

        const user = await User.findOne({ upload_password: authHeader });
        
        if (!user) {
            return res.status(401).json({
                status: 'error',
                error: 'Invalid authentication'
            });
        }

        if (user.isSuspended) {
            return res.status(403).json({
                status: 'error',
                error: 'Account suspended'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Server error'
        });
    }
}, upload.single('sharex'), async (req, res) => {
    try {
        const newUpload = new Upload({
            userId: req.user._id,
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });
        await newUpload.save();
        res.status(200).json({ status: 'OK', url: `/uploads/${req.file.filename}` });
    } catch (error) {
        res.status(500).json({ status: 'Failed', errormsg: 'File upload failed' });
    }
});

module.exports = router;

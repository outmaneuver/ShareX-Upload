const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { User, Upload } = require('../config/config');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), async (req, res) => {
    try {
        // Check for authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                status: 'error',
                message: 'Missing authorization header'
            });
        }

        // Find user by upload password
        const user = await User.findOne({ upload_password: authHeader });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid upload password'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded'
            });
        }

        const upload = new Upload({
            userId: user._id,
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });

        await upload.save();

        // Return the URL for the uploaded file
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        return res.json({
            status: 'success',
            url: fileUrl
        });

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error uploading file'
        });
    }
});

module.exports = router; 
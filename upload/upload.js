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
router.post('/', upload.single('image'), async (req, res, next) => {
    try {
        // Check for authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        // Find user by upload password
        const user = await User.findOne({ upload_password: authHeader });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'Image file is required'
            });
        }

        const file = req.file;
        const mimetype = file.mimetype;
        const size = file.size;
        const filename = file.filename;

        const upload = new Upload({
            userId: user._id,
            filename,
            mimetype,
            size
        });

        await upload.save();

        res.json({
            status: 'success',
            message: 'File uploaded successfully'
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error uploading file'
        });
    }
});

module.exports = router;

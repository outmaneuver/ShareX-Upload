const express = require('express');
const multer = require('multer');
const path = require('path');
const { User, Upload } = require('../config/config');

const router = express.Router(); // P8689

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

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

// Route to handle file uploads
router.post('/upload', isAuthenticated, upload.single('sharex'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const newUpload = new Upload({
            userId: user._id,
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

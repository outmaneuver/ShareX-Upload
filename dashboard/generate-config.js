const express = require('express');
const crypto = require('crypto');
const { User } = require('../config/config');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate ShareX configuration file
router.get('/', isAuthenticated, async (req, res) => {
    try {
        // Generate unique filename based on user's file_name_length setting
        const fileNameLength = req.user.file_name_length || 10; // Default to 10 if not set
        const generateFileName = () => crypto.randomBytes(fileNameLength).toString('hex');

        // Generate upload password if not exists
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
            URL: "$json:url$", // Use the URL returned from the server
            ErrorMessage: "$json:message$"
        };

        res.setHeader('Content-Disposition', `attachment; filename=${req.user.username}-sharex-config.sxcu`);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(config, null, 2));

    } catch (error) {
        console.error('Config generation error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to generate config'
        });
    }
});

module.exports = router;
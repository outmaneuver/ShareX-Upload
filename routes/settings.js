const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../config/config');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Get user settings
router.get('/user', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
            .select('email username file_name_length upload_password hide_user_info')
            .lean();

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            data: user
        });
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user settings'
        });
    }
});

// Update user settings
router.post('/update', isAuthenticated, async (req, res) => {
    try {
        const { file_name_length, upload_password, hide_user_info } = req.body;
        
        // Validate file_name_length
        if (file_name_length && (file_name_length < 3 || file_name_length > 50)) {
            return res.status(400).json({
                status: 'error',
                message: 'File name length must be between 3 and 50'
            });
        }

        const updateData = {
            file_name_length,
            upload_password,
            hide_user_info
        };

        await User.findByIdAndUpdate(req.session.userId, updateData);

        res.json({
            status: 'success',
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating settings'
        });
    }
});

module.exports = router; 
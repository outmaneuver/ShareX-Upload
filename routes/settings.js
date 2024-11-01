const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../config/config');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Get user settings
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({
            status: 'success',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user settings'
        });
    }
});

// Update password
router.post('/change-password', isAuthenticated, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: 'error',
                message: 'Current password is incorrect'
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({
            status: 'success',
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error updating password'
        });
    }
});

// Update user settings
router.post('/update', isAuthenticated, async (req, res) => {
    try {
        const { file_name_length, hide_user_info } = req.body;
        
        // Validate file_name_length
        if (file_name_length && (file_name_length < 3 || file_name_length > 50)) {
            return res.status(400).json({
                status: 'error',
                message: 'File name length must be between 3 and 50'
            });
        }

        const updateData = {
            file_name_length,
            hide_user_info
        };

        await User.findByIdAndUpdate(req.user._id, updateData);

        res.json({
            status: 'success',
            message: 'Settings updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error updating settings'
        });
    }
});

module.exports = router; 
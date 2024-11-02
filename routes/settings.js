const express = require('express');
const router = express.Router();
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

        // Return only necessary fields
        res.json({
            status: 'success',
            data: {
                email: user.email,
                username: user.username,
                file_name_length: user.file_name_length || 10,
                upload_password: user.upload_password || '',
                hide_user_info: user.hide_user_info || false
            }
        });
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user settings'
        });
    }
});

module.exports = router; 
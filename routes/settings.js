import express from 'express';
import { User } from '../config/config.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/update', isAuthenticated, async (req, res) => {
    try {
        const { file_name_length, upload_password, hide_user_info } = req.body;
        
        // Validate inputs
        if (file_name_length && (file_name_length < 4 || file_name_length > 32)) {
            return res.status(400).json({
                status: 'error',
                message: 'File name length must be between 4 and 32 characters'
            });
        }

        // Update user settings
        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId,
            {
                file_name_length: file_name_length || undefined,
                upload_password: upload_password || undefined,
                hide_user_info: hide_user_info
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating settings'
        });
    }
});

export default router; 
const express = require('express');
const router = express.Router();
const { User } = require('../../config/config');
const { isAuthenticated } = require('../../middleware/authMiddleware');

// Route to get user profile info
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
            .select('email username')
            .lean();

        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                message: 'User not found' 
            });
        }

        res.json({
            email: user.email,
            username: user.username
        });
    } catch (error) {
        console.error('Error fetching profile info:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error fetching user information' 
        });
    }
});

module.exports = router; 
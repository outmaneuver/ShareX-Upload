const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User, Upload, SiteStatistic } = require('../config/config');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Your existing dashboard routes...

// Add this route to your existing dashboard.js
router.get('/user-data', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

module.exports = router; 
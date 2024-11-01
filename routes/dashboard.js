const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User, Upload, SiteStatistic } = require('../config/config');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Your existing dashboard routes...

module.exports = router; 
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User, Upload, SiteStatistic } = require('../config/config');
const { isAuthenticated } = require('../middleware/authMiddleware');
const path = require('path');

// Your existing routes...

module.exports = router; 
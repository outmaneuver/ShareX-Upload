const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware for handling JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/sharex', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import routes
const adminDashboardRoutes = require('./admin/admin_dashboard');
const authRoutes = require('./auth/auth');
const dashboardRoutes = require('./dashboard/dashboard');
const forgotPasswordRoutes = require('./forgot_password/forgot_password');
const registerRoutes = require('./register');
const resetPasswordRoutes = require('./reset_password/reset_password');
const uploadRoutes = require('./upload/upload');

// Use routes
app.use('/admin_dashboard', adminDashboardRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/forgot_password', forgotPasswordRoutes);
app.use('/register', registerRoutes);
app.use('/reset_password', resetPasswordRoutes);
app.use('/upload', uploadRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

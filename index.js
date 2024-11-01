require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { connectDB, User } = require('./config/config'); // Add User to the import
const registerRouter = require('./register');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/styles', express.static('styles'));

// Session configuration
if (!process.env.SESSION_SECRET) {
  console.error('Error: SESSION_SECRET environment variable is not set.');
  process.exit(1);
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// User session middleware
app.use(async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      console.error('Session user lookup failed:', error);
    }
  }
  next();
});

// Serve HTML pages
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    if (!req.user) {
        return res.redirect('/auth/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin_dashboard', (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.redirect('/auth/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'admin_dashboard.html'));
});

// Routes
app.use('/auth', require('./auth/auth'));
app.use('/dashboard', require('./dashboard/dashboard'));
app.use('/admin_dashboard', require('./admin/admin_dashboard'));
app.use('/forgot_password', require('./forgot_password/forgot_password'));
app.use('/register', registerRouter);
app.use('/reset_password', require('./reset_password/reset_password'));
app.use('/upload', require('./upload/upload'));
app.use('/dashboard/generate-config', require('./dashboard/generate-config'));

// Root route redirect
app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

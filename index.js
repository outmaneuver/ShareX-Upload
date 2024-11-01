require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { connectDB } = require('./config/config');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
if (!process.env.SESSION_SECRET) {
  console.error('Error: SESSION_SECRET environment variable is not set.');
  process.exit(1);
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/admin_dashboard', require('./admin/admin_dashboard'));
app.use('/auth', require('./auth/auth'));
app.use('/dashboard', require('./dashboard/dashboard'));
app.use('/forgot_password', require('./forgot_password/forgot_password'));
app.use('/register', require('./register'));
app.use('/reset_password', require('./reset_password/reset_password'));
app.use('/upload', require('./upload/upload'));

// Add this after your other routes
app.get('/', (req, res) => {
    res.redirect('/auth/login'); // Redirect to login page
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

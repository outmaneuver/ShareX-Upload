require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { connectDB } = require('./config/config');
const registerRouter = require('./register');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from public directory
app.use(express.static('public'));
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

// Add this after session middleware
app.use((req, res, next) => {
    if (req.session && req.session.userId) {
        User.findById(req.session.userId)
            .then(user => {
                if (user) {
                    req.user = user;
                    next();
                } else {
                    next();
                }
            })
            .catch(next);
    } else {
        next();
    }
});

// Serve HTML pages
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin_dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin_dashboard.html'));
});

// Routes
app.use('/auth', require('./auth/auth'));
app.use('/dashboard', require('./dashboard/dashboard'));
app.use('/forgot_password', require('./forgot_password/forgot_password'));
app.use('/register', registerRouter); // Update this line to use the router
app.use('/reset_password', require('./reset_password/reset_password'));
app.use('/upload', require('./upload/upload'));

// Root route redirect
app.get('/', (req, res) => {
    res.redirect('/auth/login'); // Redirect to login page
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

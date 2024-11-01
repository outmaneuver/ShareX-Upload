const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const { connectDB } = require('./config/config');
const { isAuthenticated } = require('./middleware/authMiddleware');

const app = express();

// Connect to MongoDB
connectDB();

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60, // 1 day
        autoRemove: 'native'
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}));

// Middleware to check session on every request
app.use(async (req, res, next) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (!user || user.isSuspended) {
                req.session.destroy();
                if (req.xhr || req.path.startsWith('/api/')) {
                    return res.status(401).json({ message: 'Session expired' });
                }
                return res.redirect('/auth/login');
            }
        } catch (error) {
            req.session.destroy();
            return res.redirect('/auth/login');
        }
    }
    next();
});

// Protected routes
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/settings', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.get('/profile', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Public routes
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/auth/login');
    }
});

app.get('/auth/login', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

app.get('/auth/register', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'register.html'));
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (req.xhr || req.path.startsWith('/api/')) {
        return res.status(500).json({ message: 'Something broke!' });
    }
    res.status(500).send('Something broke!');
});

module.exports = app;
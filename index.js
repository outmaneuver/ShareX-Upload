require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const path = require('path');
const { connectDB } = require('./config/config');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/styles', express.static(path.join(__dirname, 'styles')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost/sharex-upload'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/register', require('./routes/register'));
app.use('/i', require('./routes/images'));
app.use('/settings', require('./routes/settings'));

// Serve static pages
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

app.get('/register', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'register.html'));
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    }
});

app.get('/profile', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'profile.html'));
    }
});

app.get('/settings', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'settings.html'));
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

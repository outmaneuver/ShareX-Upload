import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import bodyParser from 'body-parser';
import path from 'path';
import { connectDB } from './config/config.js';
import { isAuthenticated } from './middleware/authMiddleware.js';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
await connectDB();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'public')));

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

// Import routes
const authRouter = (await import('./routes/auth.js')).default;
const dashboardRouter = (await import('./dashboard/dashboard.js')).default;
const settingsRouter = (await import('./routes/settings.js')).default;
const imagesRouter = (await import('./routes/images.js')).default;
const registerRouter = (await import('./routes/register.js')).default;
const uploadRouter = (await import('./routes/upload.js')).default;
const adminRouter = (await import('./admin/admin_dashboard.js')).default;
const forgotPasswordRouter = (await import('./forgot_password/forgot_password.js')).default;
const resetPasswordRouter = (await import('./reset_password/reset_password.js')).default;

// Use routes
app.use('/auth', authRouter);
app.use('/dashboard', dashboardRouter);
app.use('/settings', settingsRouter);
app.use('/i', imagesRouter);
app.use('/register', registerRouter);
app.use('/api/upload', uploadRouter);
app.use('/admin', adminRouter);
app.use('/forgot-password', forgotPasswordRouter);
app.use('/reset-password', resetPasswordRouter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add a specific route for serving images with proper headers
app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(path.join(__dirname, 'uploads', filename), {
        headers: {
            'Content-Type': 'image/png', // Adjust based on file type
            'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

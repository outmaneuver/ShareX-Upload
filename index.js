import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import session from 'express-session'; // Pb655

const app = express();
const port = process.env.PORT || 3000;

// Middleware for handling JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Session management middleware for user authentication
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/sharex', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import routes
import adminDashboardRoutes from './admin/admin_dashboard';
import authRoutes from './auth/auth';
import dashboardRoutes from './dashboard/dashboard';
import forgotPasswordRoutes from './forgot_password/forgot_password';
import registerRoutes from './register';
import resetPasswordRoutes from './reset_password/reset_password';
import uploadRoutes from './upload/upload';

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

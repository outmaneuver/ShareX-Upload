import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Upload } from '../models/Upload.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: async (req, file, cb) => {
        try {
            const authHeader = req.headers.authorization;
            const user = await User.findOne({ upload_password: authHeader });
            
            if (!user) {
                return cb(new Error('Invalid upload password'));
            }

            const length = user.file_name_length || 10;
            // Generate alphanumeric string of exact length
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
            const ext = path.extname(file.originalname);
            cb(null, `${result}${ext}`);
        } catch (error) {
            cb(error);
        }
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Add error logging
const logError = (error) => {
    console.error('Upload error:', error);
};

// Update the upload route to handle files
router.post('/', upload.single('image'), async (req, res) => {
    try {
        // Check for authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                status: 'error',
                message: 'Missing authorization header'
            });
        }

        // Find user by upload password
        const user = await User.findOne({ upload_password: authHeader });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid upload password'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded'
            });
        }

        const upload = new Upload({
            userId: user._id,
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });

        await upload.save();

        // Return the URL for the uploaded file
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        return res.json({
            status: 'success',
            url: fileUrl
        });

    } catch (error) {
        logError(error);
        // Delete uploaded file if database save fails
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) logError(err);
            });
        }
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Error uploading file'
        });
    }
});

export default router;

import express from 'express';
import { Upload } from '../models/Upload.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const upload = await Upload.findById(req.params.id);
        if (!upload) {
            return res.status(404).send('Image not found');
        }
        
        // Check if file exists
        const filePath = path.join(__dirname, '..', upload.path);
        res.setHeader('Content-Type', upload.mimetype);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).send('Error serving image');
    }
});

export default router; 
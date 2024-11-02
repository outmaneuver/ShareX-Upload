import express from 'express';
import { Upload } from '../config/config.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const upload = await Upload.findById(req.params.id);
        if (!upload) {
            return res.status(404).send('Image not found');
        }
        
        res.setHeader('Content-Type', upload.mimetype);
        res.sendFile(upload.path);
    } catch (error) {
        res.status(500).send('Error serving image');
    }
});

export default router; 
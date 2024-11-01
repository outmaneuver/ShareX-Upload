const express = require('express');
const router = express.Router();
const { Upload } = require('../config/config');

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

module.exports = router; 
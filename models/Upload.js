import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    originalname: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const Upload = mongoose.model('Upload', uploadSchema); 
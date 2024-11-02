import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Announcement = mongoose.model('Announcement', announcementSchema); 
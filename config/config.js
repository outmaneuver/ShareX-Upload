import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Set strictQuery to true to suppress the warning
mongoose.set('strictQuery', true);

// MongoDB connection config
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/sharex-upload', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Define announcement schema only
const announcementSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Announcement = mongoose.model('Announcement', announcementSchema);

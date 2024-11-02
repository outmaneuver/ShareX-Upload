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

// Define schemas
const announcementSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const uploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  missing: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const siteStatisticSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

// Export models
export const Announcement = mongoose.model('Announcement', announcementSchema);
export const Upload = mongoose.model('Upload', uploadSchema);
export const SiteStatistic = mongoose.model('SiteStatistic', siteStatisticSchema);

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

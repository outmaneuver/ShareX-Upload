import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/sharex', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  uploadSize: { type: Number, default: 0 },
  file_name_length: { type: Number, default: 10 },
  upload_password: { type: String, default: '' },
  hide_user_info: { type: Boolean, default: false },
});

const announcementSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const siteStatisticSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: String, required: true },
});

const uploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);
const SiteStatistic = mongoose.model('SiteStatistic', siteStatisticSchema);
const Upload = mongoose.model('Upload', uploadSchema);

export {
  User,
  Announcement,
  SiteStatistic,
  Upload,
};

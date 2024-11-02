import mongoose from 'mongoose';

const siteStatisticSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

export const SiteStatistic = mongoose.model('SiteStatistic', siteStatisticSchema); 
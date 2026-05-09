const mongoose = require('mongoose');

const dhajaChadavaSchema = new mongoose.Schema({
  title: { type: String },
  titleEn: { type: String },
  description: { type: String },
  descriptionEn: { type: String },
  price: { type: Number },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('DhajaChadava', dhajaChadavaSchema);

const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  caption: { type: String },
  captionEn: { type: String },
  category: { type: String, default: 'general' },
  year: { type: Number },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);

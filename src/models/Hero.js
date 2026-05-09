const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  tagline: { type: String, required: true },
  taglineEn: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('HeroSlide', heroSlideSchema);

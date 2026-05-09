const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleEn: { type: String },
  description: { type: String },
  descriptionEn: { type: String },
  icon: { type: String },
  imageUrl: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);

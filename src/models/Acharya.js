const mongoose = require('mongoose');

const acharyaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEn: { type: String },
  title: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Acharya', acharyaSchema);

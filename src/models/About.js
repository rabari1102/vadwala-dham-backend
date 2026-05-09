const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  title: { type: String },
  titleEn: { type: String },
  description: { type: String },
  descriptionEn: { type: String },
  imageUrl: { type: String },
  highlights: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('About', aboutSchema);

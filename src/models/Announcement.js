const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  text: { type: String, required: true },
  textEn: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);

const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  type: { type: String, enum: ['text', 'html', 'json'], default: 'text' },
  label: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('SiteContent', siteContentSchema);

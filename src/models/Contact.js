const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  address: { type: String },
  addressEn: { type: String },
  phone: [{ type: String }],
  email: { type: String },
  mapUrl: { type: String },
  timings: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);

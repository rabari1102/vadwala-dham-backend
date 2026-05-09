const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  bankName: { type: String },
  accountName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  upiId: { type: String },
  description: { type: String },
  schemes: [{
    name: { type: String },
    amount: { type: Number },
    description: { type: String },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);

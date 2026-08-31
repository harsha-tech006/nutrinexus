const mongoose = require('mongoose');

/**
 * Otp Schema
 * Stores the email, hashed OTP value, and has an automatic TTL of 5 minutes.
 */
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  otp: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 5 minutes (300 seconds) TTL
  }
});

module.exports = mongoose.model('Otp', otpSchema);

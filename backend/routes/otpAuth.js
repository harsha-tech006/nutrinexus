const express = require('express');
const router = express.Router();
const otpAuthController = require('../controllers/otpAuthController');
const { sendOtpLimiter, verifyOtpLimiter } = require('../middleware/rateLimiter');

/**
 * Route: POST /api/auth/otp/send-otp
 * Desc: Validates email, creates dynamic OTP code, hashes it, saves it, and sends it via SMTP.
 * Access: Public (rate limited: 3 requests per 5 minutes)
 */
router.post('/send-otp', sendOtpLimiter, otpAuthController.sendOTP);

/**
 * Route: POST /api/auth/otp/verify-otp
 * Desc: Verifies code, deletes OTP, auto-creates/authenticates user, and signs JWT.
 * Access: Public (rate limited: 5 attempts per 5 minutes)
 */
router.post('/verify-otp', verifyOtpLimiter, otpAuthController.verifyOTP);

module.exports = router;

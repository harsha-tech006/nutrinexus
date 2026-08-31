const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for requesting/sending OTP.
 * Restricts an IP/client to 3 requests per 5 minutes.
 */
const sendOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait 5 minutes before trying again.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Rate limiter for verifying OTP.
 * Restricts an IP/client to 5 attempts per 5 minutes to mitigate brute-force guessing.
 */
const verifyOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many verification attempts. Please wait 5 minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  sendOtpLimiter,
  verifyOtpLimiter
};

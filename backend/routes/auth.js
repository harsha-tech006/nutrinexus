const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Otp = require('../models/Otp');
const authMiddleware = require('../middleware/auth');
const { sendWelcomeEmail, sendOtpEmail, sendPasswordChangedEmail } = require('../utils/emailService');

// Helper to validate email format
const isValidEmail = (email) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

// Helper to validate password strength
const getPasswordStrengthError = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/\d/.test(password)) return 'Password must contain at least one number.';
  if (!/[@$!%*?&#]/.test(password)) return 'Password must contain at least one special character (e.g. @$!%*?&#).';
  return null;
};

// ============================================
// 1. REGISTER
// ============================================
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  try {
    if (!firstName || !firstName.trim()) {
      return res.status(400).json({ success: false, message: 'First name is required.' });
    }
    if (!lastName || !lastName.trim()) {
      return res.status(400).json({ success: false, message: 'Last name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const passwordError = getPasswordStrengthError(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    // Save user document (Mongoose pre-save hashes the password automatically!)
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: trimmedEmail,
      password,
      isVerified: true
    });

    await user.save();

    // Send Welcome Email (async)
    sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`).catch(err => {
      console.error('Welcome email failed to dispatch:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please login.'
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// ============================================
// 2. LOGIN
// ============================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail }).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify Password hash matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // Sign JWT Token
    const payload = {
      user: {
        id: user.id || user._id
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id || user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ============================================
// 3. FORGOT PASSWORD
// ============================================
// ============================================
// 3. FORGOT PASSWORD
// ============================================
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  console.log(`\n===========================================`);
  console.log(`Incoming Email: ${email}`);

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // 1. Find user by email
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      console.log(`❌ User not found for email: ${trimmedEmail}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 2. Generate secure 6-digit OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP: ${rawOtp}`);

    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(rawOtp, salt);

    // 3. Save OTP in MongoDB
    console.log(`Saving OTP for: ${trimmedEmail}`);
    await Otp.deleteMany({ email: trimmedEmail });
    const otpRecord = new Otp({
      email: trimmedEmail,
      otp: hashedOtp,
      attempts: 0
    });
    await otpRecord.save();
    console.log(`✅ OTP Saved successfully in MongoDB`);

    // 4. Call sendOtpEmail() & AWAIT sending
    console.log(`Sending Email To: ${trimmedEmail}`);
    const mailResult = await sendOtpEmail(trimmedEmail, rawOtp);

    // 5. Only return success AFTER email sending succeeds
    if (!mailResult.success) {
      console.error(`❌ SMTP Error: ${mailResult.error}`);
      const errorMessage = mailResult.error || 'Email sending failed';
      return res.status(500).json({ 
        success: false, 
        message: errorMessage
      });
    }

    console.log(`✅ Email Sent Successfully! Returning 200 response.`);
    console.log(`===========================================\n`);
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      email: trimmedEmail
    });
  } catch (err) {
    console.error('❌ Forgot password error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Server error during forgot password.' });
  }
});

// ============================================
// 4. VERIFY OTP
// ============================================
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const otpRecord = await Otp.findOne({ email: trimmedEmail });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP has expired or does not exist. Please request a new one.' });
    }

    otpRecord.attempts = (otpRecord.attempts || 0) + 1;

    if (otpRecord.attempts > 5) {
      await Otp.deleteMany({ email: trimmedEmail });
      return res.status(400).json({ success: false, message: 'Maximum verification attempts (5) exceeded. Please request a new OTP.' });
    }

    const isMatch = await bcrypt.compare(cleanOtp, otpRecord.otp);
    if (!isMatch) {
      await otpRecord.save();
      if (otpRecord.attempts >= 5) {
        await Otp.deleteMany({ email: trimmedEmail });
        return res.status(400).json({ success: false, message: 'Maximum verification attempts (5) exceeded. Please request a new OTP.' });
      }
      const attemptsLeft = 5 - otpRecord.attempts;
      return res.status(400).json({ success: false, message: `Invalid OTP. Please try again. (${attemptsLeft} attempts remaining)` });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.'
    });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
  }
});

// ============================================
// 5. RESET PASSWORD
// ============================================
router.post('/reset-password', async (req, res) => {
  const { email, otp, password, newPassword, confirmPassword } = req.body;
  const targetPassword = newPassword || password;

  try {
    if (!email || !targetPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Verify OTP if passed
    if (otp) {
      const cleanOtp = otp.trim();
      const otpRecord = await Otp.findOne({ email: trimmedEmail });
      if (!otpRecord) {
        return res.status(400).json({ success: false, message: 'OTP has expired or does not exist. Please request a new one.' });
      }

      const isMatch = await bcrypt.compare(cleanOtp, otpRecord.otp);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'OTP verification failed. Please try again.' });
      }
    }

    // Validate password strength
    const passwordError = getPasswordStrengthError(targetPassword);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    if (confirmPassword && targetPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Update password in MongoDB (hashed by User pre-save hook)
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = targetPassword;
    await user.save();

    // Delete OTP record immediately after success
    await Otp.deleteMany({ email: trimmedEmail });

    // Send confirmation email (async)
    sendPasswordChangedEmail(user.email, user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()).catch(err => {
      console.error('Password alert email failed to dispatch:', err.message);
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('Reset password error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during password reset.' });
  }
});

// ============================================
// 6. GET CURRENT USER (ME)
// ============================================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        name: user.name,
        gender: user.gender,
        language: user.language
      }
    });
  } catch (err) {
    console.error('Fetch current user error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching profile details.' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        name: user.name,
        gender: user.gender,
        language: user.language
      }
    });
  } catch (err) {
    console.error('Fetch profile error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching profile details.' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { firstName, lastName, gender, language } = req.body;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (gender) user.gender = gender;
    if (language) user.language = language;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        name: user.name,
        gender: user.gender,
        language: user.language
      }
    });
  } catch (err) {
    console.error('Update profile error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error updating profile details.' });
  }
});

// ============================================
// 7. LOGOUT
// ============================================
router.post('/logout', async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logout successful.'
  });
});

module.exports = router;
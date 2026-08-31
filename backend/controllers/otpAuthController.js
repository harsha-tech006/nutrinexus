const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Otp = require('../models/Otp');
const User = require('../models/User');

// Helper to validate email format
const isValidEmail = (email) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

// Create transporter configuration dynamically based on env variables
const getTransporter = () => {
  const user = process.env.EMAIL_USER || process.env.MAIL_USERNAME;
  const pass = process.env.EMAIL_PASSWORD || process.env.MAIL_PASSWORD;

  // Logging warning if credentials are placeholder values
  if (!user || user.includes('your_email') || !pass || pass.includes('your_app_password')) {
    console.warn('⚠️ SMTP Email credentials are not fully configured in environment variables. Email sending might fail.');
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true for port 465, false for other ports
    auth: { user, pass }
  });
};

/**
 * Generate and Send OTP to email
 */
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // Check if there is an existing OTP for this email
    const existingOtp = await Otp.findOne({ email: trimmedEmail });
    if (existingOtp) {
      const elapsedSeconds = (Date.now() - new Date(existingOtp.createdAt).getTime()) / 1000;
      // Allow resend only after 60 seconds
      if (elapsedSeconds < 60) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(60 - elapsedSeconds)} seconds before requesting a new OTP.`
        });
      }
    }

    // Generate random 6-digit OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP securely for database storage
    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    // Clean up any existing OTP entries for this email
    await Otp.deleteMany({ email: trimmedEmail });

    // Store new OTP
    const newOtpRecord = new Otp({
      email: trimmedEmail,
      otp: hashedOtp
    });
    await newOtpRecord.save();

    // Setup Nodemailer options
    const transporter = getTransporter();
    const mailSender = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.MAIL_USERNAME || 'noreply@nutrinexus.com';
    
    const mailOptions = {
      from: `"NutriNexus Support" <${mailSender}>`,
      to: trimmedEmail,
      subject: 'Your NutriNexus One-Time Password (OTP)',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 28px; font-weight: 800; color: #10b981; letter-spacing: -0.5px;">Nutri<span style="color: #065f46;">Nexus</span></span>
          </div>
          <h2 style="color: #1e293b; font-size: 22px; font-weight: 700; margin-top: 0; text-align: center;">One-Time Verification Code</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px; text-align: center;">
            Use the secure 6-digit OTP code below to log in or complete your registration.
            This OTP will expire in <span style="font-weight: 600; color: #dc2626;">5 minutes</span>.
          </p>
          <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; font-size: 36px; font-weight: 800; text-align: center; padding: 18px 0; letter-spacing: 6px; color: #047857; margin: 25px 0; font-family: monospace;">
            ${rawOtp}
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            If you did not make this request, you can safely ignore this email. Your account remains secure.
          </p>
        </div>
      `
    };

    // Send the email with local development fallback
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.warn('📡 SMTP Email Dispatch Failed:', emailError.message);
      
      const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
      if (isDev) {
        console.log(`===================================================`);
        console.log(`⚠️ [DEV MODE] SMTP failed, using server console fallback.`);
        console.log(`🔑 Generated OTP Code for ${trimmedEmail}: ${rawOtp}`);
        console.log(`===================================================`);
        
        return res.status(200).json({
          success: true,
          message: 'OTP generated. [DEV MODE] Please retrieve code from server console.'
        });
      }
      
      throw emailError;
    }

    return res.status(200).json({
      success: true,
      message: 'A secure 6-digit OTP has been sent to your email.'
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to dispatch email. Please check your SMTP configuration or try again.'
    });
  }
};

/**
 * Verify OTP code, delete OTP record, auto-create/login user, and generate JWT
 */
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6 || isNaN(cleanOtp)) {
      return res.status(400).json({ success: false, message: 'OTP must be a 6-digit numeric code.' });
    }

    // Retrieve OTP document from MongoDB
    const otpRecord = await Otp.findOne({ email: trimmedEmail });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired or does not exist. Please request a new one.'
      });
    }

    // Increment attempts
    otpRecord.attempts = (otpRecord.attempts || 0) + 1;

    // Check if maximum attempts (5) has been exceeded
    if (otpRecord.attempts > 5) {
      await Otp.deleteMany({ email: trimmedEmail });
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts (5) exceeded. Please request a new OTP.'
      });
    }

    // Validate OTP hash matches
    const isMatch = await bcrypt.compare(cleanOtp, otpRecord.otp);
    if (!isMatch) {
      await otpRecord.save();

      if (otpRecord.attempts >= 5) {
        await Otp.deleteMany({ email: trimmedEmail });
        return res.status(400).json({
          success: false,
          message: 'Maximum verification attempts (5) exceeded. Please request a new OTP.'
        });
      }

      const attemptsLeft = 5 - otpRecord.attempts;
      return res.status(400).json({ 
        success: false, 
        message: `Invalid OTP. Please try again. (${attemptsLeft} attempts remaining)` 
      });
    }

    // Delete OTP record immediately to prevent replay attacks
    await Otp.deleteMany({ email: trimmedEmail });

    // Look up user or auto-create (matching the Python backend's auto-signup feature)
    let user = await User.findOne({ email: trimmedEmail });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Generate a strong random password since they use OTP authentication
      const defaultPassword = crypto.randomBytes(16).toString('hex');
      
      // Capitalize first part of email for the username display
      const username = trimmedEmail.split('@')[0].charAt(0).toUpperCase() + trimmedEmail.split('@')[0].slice(1);
      
      user = new User({
        name: username,
        email: trimmedEmail,
        password: defaultPassword,
        emailVerified: true
      });
      await user.save();
    } else {
      // Mark email as verified if they successfully log in using OTP
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
    }

    // Generate JWT payload
    const payload = {
      user: {
        id: user.id || user._id
      }
    };

    // Sign the JWT
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    return res.status(200).json({
      success: true,
      message: isNewUser ? 'Account auto-created. Login successful!' : 'Login successful!',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        age: user.age,
        height: user.height,
        weight: user.weight,
        bmi: user.bmi,
        language: user.language
      }
    });

  } catch (error) {
    console.error('OTP Verification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during OTP verification.'
    });
  }
};

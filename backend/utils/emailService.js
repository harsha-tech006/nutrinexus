const nodemailer = require('nodemailer');

const createTransporter = async () => {
  require('dotenv').config();
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

  if (!user || user.includes('your_email') || !pass || pass.includes('your_app_password')) {
    console.error('❌ EMAIL_USER or EMAIL_PASS missing or set to placeholder in backend/.env');
    throw new Error('EMAIL_USER and EMAIL_PASS must be configured in backend/.env');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass }
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP Connected Successfully');
    return transporter;
  } catch (err) {
    console.error('❌ SMTP Connection Error:', err.message);
    if (err.message && (err.message.includes('535') || err.message.includes('Username and Password not accepted') || err.message.includes('Invalid login'))) {
      throw new Error('Invalid Gmail App Password');
    }
    throw new Error(`SMTP authentication failed: ${err.message}`);
  }
};

// HTML Layout Wrapper
const getHtmlLayout = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f6; }
    .header { background-color: #22c55e; padding: 30px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
    .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    .footer a { color: #22c55e; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>NutriNexus</h1>
      <p>AI-Powered Personal Nutrition Assistant</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Sent by NutriNexus AI. All rights reserved.</p>
      <p><a href="mailto:support@nutrinexus.com">support@nutrinexus.com</a></p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send Welcome Email to newly registered users
 */
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = await createTransporter();
    const html = getHtmlLayout(
      'Welcome to NutriNexus',
      `<h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Welcome aboard, ${name}!</h2>
       <p>Thank you for choosing <strong>NutriNexus</strong> as your AI nutrition assistant. We are excited to support you on your wellness and fitness journey.</p>
       <p>With your new account, you can now:</p>
       <ul>
         <li>Access personalized meal plans.</li>
         <li>Track daily water and calorie routine logs.</li>
         <li>Explore our AI Nutrition Assistant chatbot.</li>
       </ul>
       <p style="margin-top: 30px;">If you have any questions or feedback, feel free to reply to this email.</p>
       <p>Best regards,<br>The NutriNexus Team</p>`
    );

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'NutriNexus Support'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to NutriNexus! 🎉',
      html
    });
    console.log(`✉️ Welcome email sent to: ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`📡 Welcome email send failed:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP for Password Reset
 */
const sendOtpEmail = async (email, otp) => {
  console.log(`Sending Email To: ${email}`);

  try {
    const transporter = await createTransporter();

    const text = `Your verification code is: ${otp}\n\nExpires in 5 minutes.`;
    const html = getHtmlLayout(
      'NutriNexus Password Reset OTP',
      `<p style="font-size: 16px; color: #334155;">Hello,</p>
       <p style="font-size: 16px; color: #334155;">Your verification code is:</p>
       <div style="text-align: center; margin: 30px 0;">
         <div style="display: inline-block; font-size: 38px; font-weight: 800; color: #22c55e; background-color: #f0fdf4; padding: 15px 35px; border-radius: 12px; border: 1px solid #bbf7d0; letter-spacing: 8px; font-family: monospace;">${otp}</div>
       </div>
       <p style="color: #ef4444; font-weight: 600; font-size: 14px;">Expires in 5 minutes.</p>
       <p style="color: #64748b; font-size: 14px;">If you did not request this email, ignore it.</p>`
    );

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'NutriNexus Support'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'NutriNexus Password Reset OTP',
      text,
      html
    });

    console.log(`✅ Email Sent Successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ SMTP Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send Password Changed confirmation alert
 */
const sendPasswordChangedEmail = async (email, name) => {
  try {
    const transporter = await createTransporter();
    const html = getHtmlLayout(
      'Password Changed Successfully',
      `<h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Password Changed Successfully</h2>
       <p>Hello ${name},</p>
       <p>The password for your NutriNexus account has been changed successfully.</p>
       <p>If you made this change, no further action is required. You can now log in with your new password.</p>
       <p style="color: #ef4444; font-weight: 600; margin-top: 30px;">⚠️ If you did not make this change, please contact support immediately.</p>`
    );

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'NutriNexus Support'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'NutriNexus Security Alert: Password Updated 🔒',
      html
    });
    console.log(`✉️ Password confirmation email sent to: ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`📡 Password change alert send failed:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendOtpEmail,
  sendPasswordChangedEmail
};

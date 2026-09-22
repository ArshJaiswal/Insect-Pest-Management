const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development, use Gmail SMTP
  // In production, use a service like SendGrid, AWS SES, etc.
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS  // Your Gmail app password
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@pestmanagement.com',
      to: email,
      subject: 'Verify Your Email - Pest Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌾 Pest Management System</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-bottom: 20px;">Email Verification Required</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for registering with our Pest Management System! To complete your registration, please verify your email address using the OTP below:
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
              <h3 style="color: #333; margin-bottom: 10px;">Your Verification Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              ⏰ This code will expire in <strong>5 minutes</strong> for security reasons.
            </p>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2; font-size: 14px;">
                <strong>Security Note:</strong> Never share this OTP with anyone. Our team will never ask for your verification code.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If you didn't request this verification, please ignore this email or contact our support team.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 25px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              © 2024 Pest Management System. All rights reserved.<br>
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Send welcome email after successful registration
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@pestmanagement.com',
      to: email,
      subject: 'Welcome to Pest Management System! 🌾',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to Pest Management!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Congratulations! Your account has been successfully created and verified. You now have access to our comprehensive pest identification and management system.
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #4caf50; margin-bottom: 15px;">🚀 What you can do now:</h3>
              <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                <li><strong>Browse Crops:</strong> Explore our database of crops and their common pests</li>
                <li><strong>Identify Pests:</strong> Upload images to identify pests using AI technology</li>
                <li><strong>Get Solutions:</strong> Access management strategies for pest control</li>
                <li><strong>Learn & Grow:</strong> Discover symptoms and prevention methods</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/login" style="background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Login to Your Account
              </a>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Need Help?</strong> If you have any questions or need assistance, feel free to contact our support team.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 25px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              © 2024 Pest Management System. All rights reserved.<br>
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Welcome email sending failed:', error);
    return false;
  }
};

module.exports = { generateOTP, sendOTPEmail, sendWelcomeEmail };
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

const router = express.Router();

// Direct user registration (instant registration, no OTP required)
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      message: 'Registration successful!'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP for registration
router.post('/send-otp', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });
    
    // Save new OTP
    const otpDoc = new OTP({ email, otp });
    await otpDoc.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      // Development mode: Show OTP in console and response
      console.log(`\n🔐 DEVELOPMENT MODE - OTP for ${email}: ${otp}\n`);
      return res.json({ 
        message: 'Email service not configured. OTP logged to console (development mode)',
        email: email,
        developmentOTP: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    }

    res.json({ 
      message: 'OTP sent successfully to your email',
      email: email
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP and Register
router.post('/verify-otp', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, otp, role } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Verify OTP
    const otpDoc = await OTP.findOne({ email, otp });
    if (!otpDoc) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, role: role || 'user' });
    await user.save();

    // Delete used OTP
    await OTP.deleteOne({ _id: otpDoc._id });

    // Send welcome email
    await sendWelcomeEmail(email, name);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token, 
      user: { id: user._id, name, email, role: user.role },
      message: 'Registration successful! Welcome email sent.'
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend OTP
router.post('/resend-otp', [
  body('email').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate new OTP
    const otp = generateOTP();
    
    // Delete existing OTP and create new one
    await OTP.deleteMany({ email });
    const otpDoc = new OTP({ email, otp });
    await otpDoc.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      console.log(`\n🔐 DEVELOPMENT MODE - Resend OTP for ${email}: ${otp}\n`);
      return res.json({ 
        message: 'Email service not configured. OTP logged to console (development mode)',
        email: email,
        developmentOTP: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    }

    res.json({ message: 'New OTP sent successfully to your email' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Debug logging
    console.log('\n🔍 Login attempt:');
    console.log('Email received:', `"${email}"`);
    console.log('Password received:', `"${password}"`);
    console.log('Email length:', email?.length);
    console.log('Password length:', password?.length);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found:', user.name, user.role);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Login successful for:', user.email);

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

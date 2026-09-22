const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const { identifyPestFromImage } = require('../services/pestIdentification');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Upload image for pest identification
router.post('/identify', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    
    // Call AI identification service
    const identificationResult = await identifyPestFromImage(imagePath);

    res.json({
      message: 'Image analyzed successfully',
      filename: req.file.filename,
      imagePath: `/uploads/${req.file.filename}`,
      ...identificationResult
    });
  } catch (err) {
    console.error('Identification error:', err);
    res.status(500).json({ message: 'Pest identification failed', error: err.message });
  }
});

// General image upload endpoint for admin panel
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    res.json({
      message: 'Image uploaded successfully',
      filename: req.file.filename,
      imageUrl: `/uploads/${req.file.filename}`
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Image upload failed', error: err.message });
  }
});

module.exports = router;

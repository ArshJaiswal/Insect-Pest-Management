const express = require('express');
const Crop = require('../models/Crop');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all crops
router.get('/', auth, async (req, res) => {
  try {
    const crops = await Crop.find().populate('commonPests');
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get crops by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const crops = await Crop.find({ category: req.params.category }).populate('commonPests');
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single crop
router.get('/:id', auth, async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('commonPests');
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json(crop);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create crop (Admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const crop = new Crop(req.body);
    await crop.save();
    res.status(201).json(crop);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update crop (Admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(crop);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete crop (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Crop.findByIdAndDelete(req.params.id);
    res.json({ message: 'Crop deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

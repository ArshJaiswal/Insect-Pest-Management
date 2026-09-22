const express = require('express');
const Pest = require('../models/Pest');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all pests
router.get('/', auth, async (req, res) => {
  try {
    const pests = await Pest.find().populate('affectedCrops');
    res.json(pests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single pest
router.get('/:id', auth, async (req, res) => {
  try {
    const pest = await Pest.findById(req.params.id).populate('affectedCrops');
    if (!pest) return res.status(404).json({ message: 'Pest not found' });
    res.json(pest);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create pest (Admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const pest = new Pest(req.body);
    await pest.save();
    res.status(201).json(pest);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update pest (Admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const pest = await Pest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(pest);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete pest (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Pest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pest deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

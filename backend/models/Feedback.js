const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'bug-report', 'feature-request', 'crop-info', 'pest-info', 'ui-ux', 'other'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'closed'],
    default: 'pending'
  },
  adminResponse: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous feedback
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
feedbackSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ rating: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
// Note: For now, we'll skip auth middleware to test the routes
// const auth = require('../middleware/auth');

console.log('📝 FEEDBACK ROUTES: Loading feedback routes...');

/**
 * @route   POST /api/feedback
 * @desc    Submit new feedback (public route)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    console.log('📝 FEEDBACK: New feedback submission received');
    console.log('📝 Feedback data:', req.body);

    const { name, email, subject, message, rating, category, isAnonymous } = req.body;

    // Validation
    if (!name || !email || !subject || !message || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Create new feedback
    const feedback = new Feedback({
      name: isAnonymous ? 'Anonymous User' : name,
      email: isAnonymous ? 'anonymous@agroguard.com' : email,
      subject,
      message,
      rating,
      category: category || 'general',
      isAnonymous: isAnonymous || false,
      userId: req.user ? req.user.id : null // If user is logged in
    });

    await feedback.save();

    console.log('✅ FEEDBACK: Feedback saved successfully');
    console.log('📝 Feedback ID:', feedback._id);

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! We appreciate your input.',
      feedback: {
        id: feedback._id,
        subject: feedback.subject,
        rating: feedback.rating,
        category: feedback.category,
        createdAt: feedback.createdAt
      }
    });

  } catch (error) {
    console.error('❌ FEEDBACK ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback (admin only)
 * @access  Private (Admin)
 */
router.get('/', async (req, res) => {
  try {
    console.log('📝 FEEDBACK: Admin fetching all feedback');

    const { status, category, rating, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (rating) filter.rating = parseInt(rating);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get feedback with pagination
    const feedback = await Feedback.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .lean();

    // Get total count for pagination
    const total = await Feedback.countDocuments(filter);

    // Calculate statistics
    const stats = await Feedback.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          statusCounts: {
            $push: '$status'
          },
          categoryCounts: {
            $push: '$category'
          },
          ratingCounts: {
            $push: '$rating'
          }
        }
      }
    ]);

    console.log('✅ FEEDBACK: Retrieved', feedback.length, 'feedback items');

    res.json({
      success: true,
      feedback,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      statistics: stats[0] || {
        totalFeedback: 0,
        averageRating: 0,
        statusCounts: [],
        categoryCounts: [],
        ratingCounts: []
      }
    });

  } catch (error) {
    console.error('❌ FEEDBACK ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/feedback/:id
 * @desc    Get single feedback by ID (admin only)
 * @access  Private (Admin)
 */
router.get('/:id', async (req, res) => {
  try {
    console.log('📝 FEEDBACK: Fetching feedback by ID:', req.params.id);

    const feedback = await Feedback.findById(req.params.id)
      .populate('userId', 'name email')
      .lean();

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    console.log('✅ FEEDBACK: Retrieved feedback:', feedback.subject);

    res.json({
      success: true,
      feedback
    });

  } catch (error) {
    console.error('❌ FEEDBACK ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/feedback/:id
 * @desc    Update feedback status/response (admin only)
 * @access  Private (Admin)
 */
router.put('/:id', async (req, res) => {
  try {
    console.log('📝 FEEDBACK: Updating feedback:', req.params.id);
    console.log('📝 Update data:', req.body);

    const { status, adminResponse } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Update fields
    if (status) feedback.status = status;
    if (adminResponse !== undefined) feedback.adminResponse = adminResponse;

    await feedback.save();

    console.log('✅ FEEDBACK: Updated feedback successfully');

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback
    });

  } catch (error) {
    console.error('❌ FEEDBACK ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/feedback/:id
 * @desc    Delete feedback (admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', async (req, res) => {
  try {
    console.log('📝 FEEDBACK: Deleting feedback:', req.params.id);

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    console.log('✅ FEEDBACK: Deleted feedback successfully');

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('❌ FEEDBACK ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/feedback/stats/summary
 * @desc    Get feedback statistics summary (admin only)
 * @access  Private (Admin)
 */
router.get('/stats/summary', async (req, res) => {
  try {
    console.log('📝 FEEDBACK: Fetching statistics summary');

    const stats = await Feedback.aggregate([
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                averageRating: { $avg: '$rating' }
              }
            }
          ],
          statusStats: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          categoryStats: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 }
              }
            }
          ],
          ratingStats: [
            {
              $group: {
                _id: '$rating',
                count: { $sum: 1 }
              }
            }
          ],
          recentFeedback: [
            {
              $sort: { createdAt: -1 }
            },
            {
              $limit: 5
            },
            {
              $project: {
                name: 1,
                subject: 1,
                rating: 1,
                category: 1,
                createdAt: 1
              }
            }
          ]
        }
      }
    ]);

    console.log('✅ FEEDBACK: Retrieved statistics summary');

    res.json({
      success: true,
      statistics: stats[0]
    });

  } catch (error) {
    console.error('❌ FEEDBACK ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

console.log('📝 FEEDBACK ROUTES: Routes configured successfully');
module.exports = router;
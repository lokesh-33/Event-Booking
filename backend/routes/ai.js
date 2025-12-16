const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// Middleware to check if user is a creator
const checkCreatorRole = (req, res, next) => {
  if (req.user.role !== 'creator') {
    return res.status(403).json({ 
      message: 'Access denied. Only event creators can use AI features.' 
    });
  }
  next();
};

// @route   POST /api/ai/generate-description
// @desc    Generate event description using AI
// @access  Private (Creator only)
router.post('/generate-description', protect, checkCreatorRole, [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('time').optional(),
  body('capacity').optional().isInt(),
  body('category').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, location, date, time, capacity, category } = req.body;

    const result = await aiService.generateEventDescription({
      title,
      location,
      date,
      time,
      capacity,
      category
    });

    if (!result.success) {
      return res.status(500).json({ 
        message: result.message,
        aiAvailable: false
      });
    }

    res.json({
      success: true,
      description: result.description,
      aiAvailable: true
    });
  } catch (error) {
    console.error('Generate description error:', error);
    res.status(500).json({ 
      message: 'Error generating description',
      aiAvailable: false
    });
  }
});

// @route   POST /api/ai/enhance-description
// @desc    Enhance existing event description using AI
// @access  Private (Creator only)
router.post('/enhance-description', protect, checkCreatorRole, [
  body('description').trim().notEmpty().withMessage('Current description is required'),
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('date').notEmpty().withMessage('Date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, title, location, date } = req.body;

    const result = await aiService.enhanceEventDescription(description, {
      title,
      location,
      date
    });

    if (!result.success) {
      return res.status(500).json({ 
        message: result.message,
        aiAvailable: false
      });
    }

    res.json({
      success: true,
      description: result.description,
      aiAvailable: true
    });
  } catch (error) {
    console.error('Enhance description error:', error);
    res.status(500).json({ 
      message: 'Error enhancing description',
      aiAvailable: false
    });
  }
});

module.exports = router;

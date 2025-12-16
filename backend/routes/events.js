const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const OTP = require('../models/OTP');
const { protect } = require('../middleware/auth');
const { upload, deleteImage } = require('../config/cloudinary');
const { sendOTPEmail, sendBookingConfirmationEmail } = require('../config/email');
const { format } = require('date-fns');

const router = express.Router();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('creator', 'name email')
      .populate('attendees', 'name email')
      .sort({ date: 1 });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('attendees', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
});

// Middleware to check if user is a creator
const checkCreatorRole = (req, res, next) => {
  if (req.user.role !== 'creator') {
    return res.status(403).json({ 
      message: 'Access denied. Only event creators can perform this action.' 
    });
  }
  next();
};

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Creator only)
router.post('/', protect, checkCreatorRole, upload.single('image'), [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description').trim().notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('date').notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('time').notEmpty().withMessage('Time is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('capacity').isInt({ min: 1, max: 10000 }).withMessage('Capacity must be between 1 and 10000')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded image if validation fails
      if (req.file) {
        await deleteImage(req.file.filename);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, date, time, location, capacity } = req.body;

    // Validate date is in future
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      if (req.file) {
        await deleteImage(req.file.filename);
      }
      return res.status(400).json({ message: 'Event date must be in the future' });
    }

    // Create event object
    const eventData = {
      title,
      description,
      date: eventDate,
      time,
      location,
      capacity: parseInt(capacity),
      creator: req.user._id
    };

    // Add image URL if uploaded
    if (req.file) {
      eventData.imageUrl = req.file.path;
      eventData.imagePublicId = req.file.filename;
    }

    const event = await Event.create(eventData);

    // Populate creator info
    await event.populate('creator', 'name email');

    res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    // Delete uploaded image if event creation fails
    if (req.file) {
      await deleteImage(req.file.filename);
    }
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Creator and owner only)
router.put('/:id', protect, checkCreatorRole, upload.single('image'), [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('time').optional().notEmpty().withMessage('Time cannot be empty'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('capacity').optional().isInt({ min: 1, max: 10000 }).withMessage('Capacity must be between 1 and 10000')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        await deleteImage(req.file.filename);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      if (req.file) {
        await deleteImage(req.file.filename);
      }
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.creator.toString() !== req.user._id.toString()) {
      if (req.file) {
        await deleteImage(req.file.filename);
      }
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    // Update fields
    const { title, description, date, time, location, capacity } = req.body;
    
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) {
      const eventDate = new Date(date);
      if (eventDate <= new Date()) {
        if (req.file) {
          await deleteImage(req.file.filename);
        }
        return res.status(400).json({ message: 'Event date must be in the future' });
      }
      event.date = eventDate;
    }
    if (time) event.time = time;
    if (location) event.location = location;
    if (capacity) {
      const newCapacity = parseInt(capacity);
      // Ensure new capacity is not less than current attendees
      if (newCapacity < event.attendees.length) {
        if (req.file) {
          await deleteImage(req.file.filename);
        }
        return res.status(400).json({ 
          message: `Capacity cannot be less than current attendees (${event.attendees.length})` 
        });
      }
      event.capacity = newCapacity;
    }

    // Update image if uploaded
    if (req.file) {
      // Delete old image if exists
      if (event.imagePublicId) {
        await deleteImage(event.imagePublicId);
      }
      event.imageUrl = req.file.path;
      event.imagePublicId = req.file.filename;
    }

    await event.save();
    await event.populate('creator', 'name email');
    await event.populate('attendees', 'name email');

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    if (req.file) {
      await deleteImage(req.file.filename);
    }
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Creator and owner only)
router.delete('/:id', protect, checkCreatorRole, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Check if event has attendees
    if (event.attendees.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete event with booked tickets. ${event.attendees.length} attendee(s) have registered for this event. Please cancel all registrations first.`,
        attendeeCount: event.attendees.length
      });
    }

    // Delete image from Cloudinary if exists
    if (event.imagePublicId) {
      await deleteImage(event.imagePublicId);
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

// @route   POST /api/events/:id/rsvp
// @desc    Request RSVP (sends OTP for verification)
// @access  Private
router.post('/:id/rsvp', protect, async (req, res) => {
  try {
    // Check if event exists and has capacity
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user already attending
    if (event.attendees.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Check if event is full
    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ 
        message: 'Event is full. No spots available.',
        availableSpots: 0
      });
    }

    // Delete any existing unverified OTPs for this user and event
    await OTP.deleteMany({ userId: req.user._id, eventId: event._id });

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to database
    const otpRecord = new OTP({
      userId: req.user._id,
      eventId: event._id,
      otp: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    await otpRecord.save();

    // Send OTP email
    try {
      await sendOTPEmail(req.user.email, req.user.name, otp, event.title);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue even if email fails (OTP is logged in console for dev)
    }

    res.json({
      success: true,
      message: 'Verification code sent to your email. Please check your inbox.',
      otpId: otpRecord._id,
      expiresIn: 600, // 10 minutes in seconds
      requiresVerification: true
    });
  } catch (error) {
    console.error('RSVP request error:', error);
    res.status(500).json({ message: 'Error processing RSVP request', error: error.message });
  }
});

// @route   POST /api/events/:id/rsvp/verify
// @desc    Verify OTP and complete RSVP
// @access  Private
router.post('/:id/rsvp/verify', protect, [
  body('otp').trim().notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { otp } = req.body;

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      userId: req.user._id,
      eventId: req.params.id,
      otp: otp,
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification code. Please request a new one.' 
      });
    }

    // Use findOneAndUpdate with atomic operation for concurrency safety
    const event = await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        // Ensure event has capacity
        $expr: { $lt: [{ $size: '$attendees' }, '$capacity'] },
        // Ensure user is not already attending
        attendees: { $ne: req.user._id }
      },
      {
        $addToSet: { attendees: req.user._id }
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('creator', 'name email')
     .populate('attendees', 'name email');

    if (!event) {
      // Check if event exists
      const existingEvent = await Event.findById(req.params.id);
      
      if (!existingEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if user already attending
      if (existingEvent.attendees.includes(req.user._id)) {
        return res.status(400).json({ message: 'You are already registered for this event' });
      }

      // Event is full
      return res.status(400).json({ 
        message: 'Event is full. No spots available.',
        availableSpots: 0
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Send confirmation email to attendee
    try {
      const eventDetails = {
        title: event.title,
        date: format(new Date(event.date), 'EEEE, MMMM dd, yyyy'),
        time: event.time,
        location: event.location,
        organizerName: event.creator.name,
        organizerEmail: event.creator.email
      };
      
      await sendBookingConfirmationEmail(req.user.email, req.user.name, eventDetails);
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
      // Continue even if email fails
    }

    // Log notification to organizer
    console.log('========== NEW TICKET BOOKING ==========');
    console.log(`Event: ${event.title}`);
    console.log(`Organizer Email: ${event.creator.email}`);
    console.log(`Attendee Name: ${req.user.name}`);
    console.log(`Attendee Email: ${req.user.email}`);
    console.log(`Total Attendees: ${event.attendees.length}/${event.capacity}`);
    console.log('=========================================');

    res.json({
      success: true,
      message: 'Registration confirmed! Confirmation email sent.',
      event,
      organizerEmail: event.creator.email
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
});

// @route   DELETE /api/events/:id/rsvp
// @desc    Cancel RSVP
// @access  Private
router.delete('/:id/rsvp', protect, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { attendees: req.user._id }
      },
      {
        new: true
      }
    ).populate('creator', 'name email')
     .populate('attendees', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      success: true,
      message: 'Successfully cancelled registration',
      event
    });
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    res.status(500).json({ message: 'Error cancelling registration', error: error.message });
  }
});

module.exports = router;

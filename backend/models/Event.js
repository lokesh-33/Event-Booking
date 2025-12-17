const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [10000, 'Capacity cannot exceed 10000']
  },
  category: {
    type: String,
    enum: ['conference', 'workshop', 'meetup', 'webinar', 'social', 'other'],
    default: 'other'
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/800x400?text=Event+Image'
  },
  imagePublicId: {
    type: String,  // Cloudinary public ID for deletion
    default: null
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual field for available spots
eventSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.attendees.length;
});

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

// Index for efficient queries
eventSchema.index({ date: 1 });
eventSchema.index({ creator: 1 });
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);

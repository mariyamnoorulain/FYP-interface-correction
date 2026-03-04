const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6 // 0 = Sunday, 6 = Saturday
  },
  startTime: {
    type: String,
    required: true // Format: "HH:MM" in 24-hour format
  },
  endTime: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  }
});

// Index for efficient queries
availabilitySchema.index({ tutorId: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);




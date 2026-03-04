const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tutorResponse: {
    type: String,
    default: ''
  },
  tutorResponseDate: {
    type: Date
  }
});

reviewSchema.index({ tutorId: 1, createdAt: -1 });
reviewSchema.index({ studentId: 1 });

module.exports = mongoose.model('Review', reviewSchema);




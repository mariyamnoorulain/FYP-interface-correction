const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const Booking = require('../models/booking');
const TutorProfile = require('../models/tutorProfile');
const { authenticate } = require('../middleware/auth');

// Create review
router.post('/', authenticate, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    
    // Check if booking exists and belongs to student
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.studentId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed lessons' });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists' });
    }
    
    const review = new Review({
      tutorId: booking.tutorId,
      studentId: req.user.userId,
      bookingId,
      rating,
      comment
    });
    
    await review.save();
    
    // Update tutor profile rating
    const tutorProfile = await TutorProfile.findOne({ userId: booking.tutorId });
    if (tutorProfile) {
      const allReviews = await Review.find({ tutorId: booking.tutorId });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      tutorProfile.rating = avgRating;
      tutorProfile.totalReviews = allReviews.length;
      await tutorProfile.save();
    }
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for tutor
router.get('/tutor/:tutorId', async (req, res) => {
  try {
    const reviews = await Review.find({ tutorId: req.params.tutorId })
      .populate('studentId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tutor response to review
router.post('/:id/response', authenticate, async (req, res) => {
  try {
    const { response } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if tutor owns this review
    const tutorProfile = await TutorProfile.findOne({ userId: req.user.userId });
    if (!tutorProfile || review.tutorId.toString() !== tutorProfile.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    review.tutorResponse = response;
    review.tutorResponseDate = new Date();
    await review.save();
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;




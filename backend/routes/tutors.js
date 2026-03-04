const express = require('express');
const router = express.Router();
const TutorProfile = require('../models/tutorProfile');
const Availability = require('../models/availability');
const Booking = require('../models/booking');
const Review = require('../models/review');
const User = require('../models/user');
const { authenticate } = require('../middleware/auth');

// Get all tutors (public - for search)
router.get('/', async (req, res) => {
  try {
    const { search, subject, minRating, maxPrice } = req.query;
    
    let query = { visibility: 'public' };
    
    if (search) {
      query.$or = [
        { bio: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }
    
    const tutors = await TutorProfile.find(query)
      .populate('userId', 'name email')
      .sort({ profileScore: -1, rating: -1 })
      .limit(50);
    
    // Filter by subject and price if provided
    let filteredTutors = tutors;
    if (subject) {
      filteredTutors = tutors.filter(t => 
        t.subjects.some(s => s.name.toLowerCase().includes(subject.toLowerCase()))
      );
    }
    
    if (maxPrice) {
      filteredTutors = filteredTutors.filter(t => 
        t.hourlyRate <= parseFloat(maxPrice)
      );
    }
    
    res.json(filteredTutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single tutor profile (public)
router.get('/:id', async (req, res) => {
  try {
    const tutor = await TutorProfile.findOne({ userId: req.params.id })
      .populate('userId', 'name email');
    
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    
    // Increment profile views
    tutor.profileViews += 1;
    await tutor.save();
    
    res.json(tutor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get or create tutor profile (tutor only)
router.get('/profile/me', authenticate, async (req, res) => {
  try {
    let profile = await TutorProfile.findOne({ userId: req.user.userId })
      .populate('userId', 'name email');
    
    if (!profile) {
      // Create default profile
      profile = new TutorProfile({
        userId: req.user.userId,
        bio: '',
        subjects: [],
        hourlyRate: 20
      });
      await profile.save();
      await profile.populate('userId', 'name email');
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update tutor profile (tutor only)
router.put('/profile/me', authenticate, async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ userId: req.user.userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const { bio, photo, introVideo, subjects, hourlyRate, timezone, languages, certifications, visibility } = req.body;
    
    if (bio !== undefined) profile.bio = bio;
    if (photo !== undefined) profile.photo = photo;
    if (introVideo !== undefined) profile.introVideo = introVideo;
    if (subjects !== undefined) profile.subjects = subjects;
    if (hourlyRate !== undefined) profile.hourlyRate = hourlyRate;
    if (timezone !== undefined) profile.timezone = timezone;
    if (languages !== undefined) profile.languages = languages;
    if (certifications !== undefined) profile.certifications = certifications;
    if (visibility !== undefined) profile.visibility = visibility;
    
    profile.updatedAt = new Date();
    profile.calculateProfileScore();
    
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tutor availability
router.get('/:id/availability', async (req, res) => {
  try {
    // Find tutor profile to get userId
    const tutorProfile = await TutorProfile.findOne({ userId: req.params.id });
    if (!tutorProfile) {
      return res.json([]);
    }
    
    const availability = await Availability.find({ 
      tutorId: tutorProfile.userId.toString(),
      isAvailable: true
    }).sort({ dayOfWeek: 1, startTime: 1 });
    
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update availability (tutor only)
router.put('/availability/me', authenticate, async (req, res) => {
  try {
    const { availability } = req.body;
    
    // Find tutor profile
    const tutorProfile = await TutorProfile.findOne({ userId: req.user.userId });
    if (!tutorProfile) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }
    
    // Delete existing availability
    await Availability.deleteMany({ tutorId: tutorProfile.userId.toString() });
    
    // Create new availability slots
    const slots = availability.map(slot => ({
      tutorId: tutorProfile.userId.toString(),
      ...slot
    }));
    
    await Availability.insertMany(slots);
    
    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get availability for logged-in tutor
router.get('/availability/me', authenticate, async (req, res) => {
  try {
    const tutorProfile = await TutorProfile.findOne({ userId: req.user.userId });
    if (!tutorProfile) {
      return res.json([]);
    }
    
    const availability = await Availability.find({ 
      tutorId: tutorProfile.userId.toString(),
      isAvailable: true
    }).sort({ dayOfWeek: 1, startTime: 1 });
    
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tutor reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ tutorId: req.params.id })
      .populate('studentId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tutor earnings (tutor only)
router.get('/earnings/me', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { 
      tutorId: req.user.userId,
      status: 'completed',
      paymentStatus: 'paid'
    };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const bookings = await Booking.find(query);
    
    const totalEarnings = bookings.reduce((sum, b) => sum + b.price, 0);
    const totalLessons = bookings.length;
    const averageEarnings = totalLessons > 0 ? totalEarnings / totalLessons : 0;
    
    // Monthly breakdown
    const monthlyEarnings = {};
    bookings.forEach(booking => {
      const month = booking.date.toISOString().substring(0, 7);
      monthlyEarnings[month] = (monthlyEarnings[month] || 0) + booking.price;
    });
    
    res.json({
      totalEarnings,
      totalLessons,
      averageEarnings,
      monthlyEarnings,
      recentBookings: bookings.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


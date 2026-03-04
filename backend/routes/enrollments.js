const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Tutor = require('../models/tutorProfile');
const User = require('../models/user');
const { authenticate } = require('../middleware/auth');

// @route   POST api/enrollments/enroll
// @desc    Enroll in a course with a tutor
// @access  Private (Student only)
router.post('/enroll', authenticate, async (req, res) => {
    try {
        const { tutorId, courseName } = req.body;

        // Check if tutor exists
        let tutor = await Tutor.findOne({ userId: tutorId });
        if (!tutor) {
            // Fallback: maybe the ID passed IS the Tutor ID?
            if (tutorId.match(/^[0-9a-fA-F]{24}$/)) {
                tutor = await Tutor.findById(tutorId);
            }
        }

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        // Check if already enrolled
        let enrollment = await Enrollment.findOne({
            student: req.user.userId,
            tutor: tutor._id
        });

        if (enrollment) {
            return res.status(400).json({ message: 'Already enrolled with this tutor' });
        }

        // Create new enrollment
        enrollment = new Enrollment({
            student: req.user.userId,
            tutor: tutor._id,
            courseName: courseName || `Course with ${tutor.userId.name || 'Tutor'}`
        });

        await enrollment.save();

        res.status(201).json(enrollment);
    } catch (err) {
        console.error('Enrollment error:', err);
        res.status(500).json({ message: 'Server error during enrollment' });
    }
});

// @route   GET api/enrollments/my-courses
// @desc    Get current user's enrollments
// @access  Private
router.get('/my-courses', authenticate, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user.userId })
            .populate({
                path: 'tutor',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            })
            .sort('-createdAt');

        res.json(enrollments);
    } catch (err) {
        console.error('Fetch enrollments error:', err);
        res.status(500).json({ message: 'Server error fetching enrollments' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const StudentProfile = require('../models/studentProfile');
const { authenticate } = require('../middleware/auth');

// Get profile for logged-in student
router.get('/profile/me', authenticate, async (req, res) => {
    try {
        let profile = await StudentProfile.findOne({ userId: req.user.userId })
            .populate('userId', 'name email role');

        if (!profile) {
            // Create default profile if not exists
            profile = new StudentProfile({
                userId: req.user.userId,
                bio: '',
                photo: '',
                socialLinks: {}
            });
            await profile.save();
            await profile.populate('userId', 'name email role');
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update profile for logged-in student
router.put('/profile/me', authenticate, async (req, res) => {
    try {
        let profile = await StudentProfile.findOne({ userId: req.user.userId });

        if (!profile) {
            // Create if doesn't exist (though GET should have handled it)
            profile = new StudentProfile({ userId: req.user.userId });
        }

        const {
            bio, photo, phone, location, education,
            interests, languages, achievements, socialLinks
        } = req.body;

        if (bio !== undefined) profile.bio = bio;
        if (photo !== undefined) profile.photo = photo;
        if (phone !== undefined) profile.phone = phone;
        if (location !== undefined) profile.location = location;
        if (education !== undefined) profile.education = education;
        if (interests !== undefined) profile.interests = interests;
        if (languages !== undefined) profile.languages = languages;
        if (achievements !== undefined) profile.achievements = achievements;
        if (socialLinks !== undefined) profile.socialLinks = socialLinks;

        profile.updatedAt = Date.now();
        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error('Error updating student profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

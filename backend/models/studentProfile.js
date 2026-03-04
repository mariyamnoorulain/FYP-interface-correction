const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bio: {
        type: String,
        default: ''
    },
    photo: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    education: [{
        institution: String,
        degree: String,
        year: Number
    }],
    interests: [String],
    languages: [String],
    achievements: [{
        title: String,
        description: String,
        year: Number
    }],
    socialLinks: {
        linkedin: String,
        github: String,
        portfolio: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);

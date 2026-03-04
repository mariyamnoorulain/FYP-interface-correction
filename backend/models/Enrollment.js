const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TutorProfile',
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'dropped'],
        default: 'active'
    },
    progress: {
        type: Number,
        default: 0
    },
    enrolledDate: {
        type: Date,
        default: Date.now
    },
    lastAccessDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Prevent duplicate enrollments
enrollmentSchema.index({ student: 1, tutor: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);

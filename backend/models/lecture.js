const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: String,
    default: 'default-course'
  },
  videoFileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files',
    required: true
  },
  videoFileName: {
    type: String,
    required: true
  },
  videoFileSize: {
    type: Number,
    required: true
  },
  videoMimeType: {
    type: String,
    default: 'video/mp4'
  },
  duration: {
    type: String, // e.g., "45:30"
    default: '0:00'
  },
  durationSeconds: {
    type: Number,
    default: 0
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
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

lectureSchema.index({ tutorId: 1, createdAt: -1 });
lectureSchema.index({ courseId: 1 });

module.exports = mongoose.model('Lecture', lectureSchema);


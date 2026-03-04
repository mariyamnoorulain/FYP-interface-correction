const mongoose = require('mongoose');

const tutorProfileSchema = new mongoose.Schema({
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
  introVideo: {
    type: String,
    default: ''
  },
  subjects: [{
    name: String,
    price: Number
  }],
  hourlyRate: {
    type: Number,
    default: 20
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  languages: [String],
  certifications: [{
    name: String,
    issuer: String,
    year: Number
  }],
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  responseRate: {
    type: Number,
    default: 100
  },
  profileScore: {
    type: Number,
    default: 0
  },
  visibility: {
    type: String,
    enum: ['public', 'hidden'],
    default: 'public'
  },
  profileViews: {
    type: Number,
    default: 0
  },
  bookingConversionRate: {
    type: Number,
    default: 0
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

tutorProfileSchema.methods.calculateProfileScore = function() {
  let score = 0;
  
  // Photo (20 points)
  if (this.photo) score += 20;
  
  // Intro video (25 points)
  if (this.introVideo) score += 25;
  
  // Bio (15 points)
  if (this.bio && this.bio.length > 100) score += 15;
  
  // Subjects (10 points)
  if (this.subjects && this.subjects.length > 0) score += 10;
  
  // Certifications (10 points)
  if (this.certifications && this.certifications.length > 0) score += 10;
  
  // Response rate (10 points)
  if (this.responseRate >= 90) score += 10;
  else if (this.responseRate >= 70) score += 5;
  
  // Reviews (10 points)
  if (this.totalReviews >= 10) score += 10;
  else if (this.totalReviews >= 5) score += 5;
  
  this.profileScore = Math.min(score, 100);
  return this.profileScore;
};

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);




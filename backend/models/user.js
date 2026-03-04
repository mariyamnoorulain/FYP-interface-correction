const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'tutor', 'admin'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Database Indexes for Performance
// Index on email (already unique, but explicit index improves query performance)
userSchema.index({ email: 1 });

// Index on role for role-based queries (e.g., "get all tutors")
userSchema.index({ role: 1 });

// Compound index for common queries (e.g., "get tutors by role and email")
userSchema.index({ role: 1, email: 1 });

// Index on createdAt for sorting and filtering by registration date
userSchema.index({ createdAt: -1 });

// Fixed: Removed 'next' parameter and all next() calls
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Helper method to get consistent user ID format
userSchema.methods.getId = function() {
  return this._id.toString();
};

// Helper method to get user object in consistent format
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
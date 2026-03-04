const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
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
  dailyRoomName: {
    type: String,
    required: true,
    unique: true
  },
  dailyRoomUrl: {
    type: String,
    required: true
  },
  dailyRoomToken: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  isRecorded: {
    type: Boolean,
    default: false
  },
  recordingUrl: {
    type: String,
    default: ''
  },
  whiteboardData: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
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

classroomSchema.index({ bookingId: 1 });
classroomSchema.index({ tutorId: 1, status: 1 });
classroomSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model('Classroom', classroomSchema);


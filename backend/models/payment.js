const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer'],
    default: 'card'
  },
  stripePaymentIntentId: {
    type: String,
    default: ''
  },
  stripeChargeId: {
    type: String,
    default: ''
  },
  refundId: {
    type: String,
    default: ''
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String,
    default: ''
  },
  transactionFee: {
    type: Number,
    default: 0
  },
  platformFee: {
    type: Number,
    default: 0
  },
  tutorEarnings: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  },
  paidAt: {
    type: Date
  },
  refundedAt: {
    type: Date
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

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ studentId: 1, createdAt: -1 });
paymentSchema.index({ tutorId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);


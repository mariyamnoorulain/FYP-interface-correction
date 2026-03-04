const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
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
  planType: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly'],
    required: true
  },
  lessonsPerPeriod: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  stripeSubscriptionId: {
    type: String,
    default: ''
  },
  stripeCustomerId: {
    type: String,
    default: ''
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  cancelledAt: {
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

subscriptionSchema.index({ studentId: 1, status: 1 });
subscriptionSchema.index({ tutorId: 1, status: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);


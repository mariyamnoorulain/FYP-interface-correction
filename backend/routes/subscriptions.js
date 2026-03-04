const express = require('express');
const router = express.Router();
const Subscription = require('../models/subscription');
const Booking = require('../models/booking');
const TutorProfile = require('../models/tutorProfile');
const { authenticate } = require('../middleware/auth');
const stripeService = require('../services/stripeService');
const notificationService = require('../services/notificationService');

// Create subscription
router.post('/create', authenticate, async (req, res) => {
  try {
    const { tutorId, planType, lessonsPerPeriod, startDate } = req.body;
    const studentId = req.user.userId;

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can create subscriptions' });
    }

    // Check if tutor exists
    const tutorProfile = await TutorProfile.findOne({ userId: tutorId });
    if (!tutorProfile) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Calculate pricing based on plan
    const basePrice = tutorProfile.hourlyRate * (planType === 'weekly' ? 1 : planType === 'biweekly' ? 2 : 4);
    const discount = planType === 'monthly' ? 0.15 : planType === 'biweekly' ? 0.10 : 0; // 15% discount for monthly, 10% for biweekly
    const totalPrice = basePrice * lessonsPerPeriod * (1 - discount);

    // Calculate dates
    const start = new Date(startDate || Date.now());
    let endDate, nextBilling;
    
    if (planType === 'weekly') {
      endDate = new Date(start);
      endDate.setDate(endDate.getDate() + 7);
      nextBilling = new Date(endDate);
    } else if (planType === 'biweekly') {
      endDate = new Date(start);
      endDate.setDate(endDate.getDate() + 14);
      nextBilling = new Date(endDate);
    } else { // monthly
      endDate = new Date(start);
      endDate.setMonth(endDate.getMonth() + 1);
      nextBilling = new Date(endDate);
    }

    // Create Stripe customer if needed (in real implementation, store customer ID in user model)
    // For now, create subscription record
    const subscription = new Subscription({
      studentId,
      tutorId,
      planType,
      lessonsPerPeriod,
      price: totalPrice,
      startDate: start,
      endDate,
      nextBillingDate: nextBilling,
      status: 'active',
      autoRenew: true
    });

    await subscription.save();

    // Create notifications
    await notificationService.createNotification(
      studentId,
      'subscription_created',
      'Subscription Created',
      `Your ${planType} subscription with ${lessonsPerPeriod} lessons has been created.`,
      subscription._id,
      'subscription'
    );

    await notificationService.createNotification(
      tutorId,
      'subscription_created',
      'New Subscription',
      `A student has subscribed to ${lessonsPerPeriod} ${planType} lessons with you.`,
      subscription._id,
      'subscription'
    );

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription: {
        id: subscription._id,
        planType: subscription.planType,
        lessonsPerPeriod: subscription.lessonsPerPeriod,
        price: subscription.price,
        nextBillingDate: subscription.nextBillingDate
      }
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ message: 'Failed to create subscription', error: error.message });
  }
});

// Get subscriptions
router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.studentId = req.user.userId;
    } else if (req.user.role === 'tutor') {
      query.tutorId = req.user.userId;
    }

    const subscriptions = await Subscription.find(query)
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email')
      .sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Failed to get subscriptions', error: error.message });
  }
});

// Pause subscription
router.post('/:id/pause', authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.studentId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ message: 'Subscription is not active' });
    }

    subscription.status = 'paused';
    subscription.updatedAt = new Date();
    await subscription.save();

    res.json({
      message: 'Subscription paused successfully',
      subscription
    });
  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({ message: 'Failed to pause subscription', error: error.message });
  }
});

// Resume subscription
router.post('/:id/resume', authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.studentId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (subscription.status !== 'paused') {
      return res.status(400).json({ message: 'Subscription is not paused' });
    }

    subscription.status = 'active';
    subscription.updatedAt = new Date();
    await subscription.save();

    res.json({
      message: 'Subscription resumed successfully',
      subscription
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({ message: 'Failed to resume subscription', error: error.message });
  }
});

// Cancel subscription
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.studentId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    subscription.cancelledAt = new Date();
    subscription.updatedAt = new Date();
    await subscription.save();

    // Cancel Stripe subscription if exists
    if (subscription.stripeSubscriptionId) {
      try {
        await stripeService.cancelSubscription(subscription.stripeSubscriptionId);
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError);
      }
    }

    await notificationService.createNotification(
      subscription.studentId,
      'subscription_cancelled',
      'Subscription Cancelled',
      'Your subscription has been cancelled successfully.',
      subscription._id,
      'subscription'
    );

    res.json({
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Failed to cancel subscription', error: error.message });
  }
});

module.exports = router;


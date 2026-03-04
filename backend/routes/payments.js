const express = require('express');
const router = express.Router();
const Payment = require('../models/payment');
const Booking = require('../models/booking');
const TutorProfile = require('../models/tutorProfile');
const { authenticate } = require('../middleware/auth');
const stripeService = require('../services/stripeService');
const notificationService = require('../services/notificationService');
const { sendPaymentConfirmation } = require('../services/emailService');

// Create payment intent for booking
router.post('/create-intent', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.studentId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ bookingId });
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripeService.createPaymentIntent(
      booking.price,
      'usd',
      {
        bookingId: booking._id.toString(),
        studentId: booking.studentId.toString(),
        tutorId: booking.tutorId.toString()
      }
    );

    // Create or update payment record
    let payment = await Payment.findOne({ bookingId });
    if (!payment) {
      payment = new Payment({
        bookingId: booking._id,
        studentId: booking.studentId,
        tutorId: booking.tutorId,
        amount: booking.price,
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id
      });
    } else {
      payment.stripePaymentIntentId = paymentIntent.id;
      payment.status = 'pending';
    }

    await payment.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: booking.price
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
  }
});

// Confirm payment
router.post('/confirm', authenticate, async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    const payment = await Payment.findOne({ 
      stripePaymentIntentId: paymentIntentId,
      bookingId 
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.studentId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Confirm payment with Stripe
    const paymentIntent = await stripeService.confirmPayment(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Calculate fees (example: 10% platform fee)
      const platformFeePercentage = 0.10;
      payment.platformFee = payment.amount * platformFeePercentage;
      payment.transactionFee = payment.amount * 0.029 + 0.30; // Stripe fee
      payment.tutorEarnings = payment.amount - payment.platformFee - payment.transactionFee;

      payment.status = 'completed';
      payment.stripeChargeId = paymentIntent.latest_charge || '';
      payment.paidAt = new Date();

      await payment.save();

      // Update booking payment status
      const booking = await Booking.findById(payment.bookingId);
      if (booking) {
        booking.paymentStatus = 'paid';
        await booking.save();

        // Create notifications
        await notificationService.createNotification(
          booking.studentId,
          'payment_received',
          'Payment Confirmed',
          `Your payment of $${payment.amount.toFixed(2)} has been confirmed.`,
          payment._id,
          'payment'
        );

        await notificationService.createNotification(
          booking.tutorId,
          'payment_received',
          'Payment Received',
          `You received $${payment.tutorEarnings.toFixed(2)} for your lesson.`,
          payment._id,
          'payment'
        );

        // Send email confirmation
        const user = await require('../models/user').findById(booking.studentId);
        if (user) {
          await sendPaymentConfirmation(
            user.email,
            user.name,
            payment.amount,
            booking.date
          );
        }
      }

      res.json({
        message: 'Payment confirmed successfully',
        payment: {
          id: payment._id,
          amount: payment.amount,
          status: payment.status,
          tutorEarnings: payment.tutorEarnings
        }
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({ 
        message: 'Payment failed', 
        status: paymentIntent.status 
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: 'Failed to confirm payment', error: error.message });
  }
});

// Process refund
router.post('/refund', authenticate, async (req, res) => {
  try {
    const { paymentId, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Only tutor or admin can initiate refund
    const user = await require('../models/user').findById(req.user.userId);
    if (payment.tutorId.toString() !== req.user.userId && user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({ message: 'Payment already refunded' });
    }

    // Create refund with Stripe
    const refund = await stripeService.createRefund(
      payment.stripeChargeId,
      payment.amount,
      reason || 'requested_by_customer'
    );

    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundAmount = payment.amount;
    payment.refundReason = reason || 'requested_by_customer';
    payment.refundedAt = new Date();

    await payment.save();

    // Update booking status
    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.paymentStatus = 'refunded';
      await booking.save();
    }

    res.json({
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Failed to process refund', error: error.message });
  }
});

// Get payment history
router.get('/history', authenticate, async (req, res) => {
  try {
    const { role } = req.user;
    let query = {};

    if (role === 'student') {
      query.studentId = req.user.userId;
    } else if (role === 'tutor') {
      query.tutorId = req.user.userId;
    }

    const payments = await Payment.find(query)
      .populate('bookingId', 'date startTime endTime')
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(payments);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to get payment history', error: error.message });
  }
});

// Get single payment
router.get('/:id', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('bookingId')
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check authorization
    if (payment.studentId._id.toString() !== req.user.userId && 
        payment.tutorId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Failed to get payment', error: error.message });
  }
});

module.exports = router;


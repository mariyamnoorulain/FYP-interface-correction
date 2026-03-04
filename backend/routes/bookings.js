const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const TutorProfile = require('../models/tutorProfile');
const Availability = require('../models/availability');
const Payment = require('../models/payment');
const User = require('../models/user');
const { authenticate } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const { sendBookingConfirmation, sendBookingReminder } = require('../services/emailService');
const stripeService = require('../services/stripeService');

// Create booking
router.post('/', authenticate, async (req, res) => {
  try {
    const { tutorId, date, startTime, endTime, duration, type } = req.body;
    
    // Check if tutor exists
    const TutorProfile = require('../models/tutorProfile');
    const tutor = await TutorProfile.findOne({ userId: tutorId });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    
    // Check availability
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay();
    const availability = await Availability.findOne({
      tutorId: tutor.userId.toString(),
      dayOfWeek,
      isAvailable: true,
      startTime: { $lte: startTime },
      endTime: { $gte: endTime }
    });
    
    if (!availability) {
      return res.status(400).json({ message: 'Time slot not available' });
    }
    
    // Check for conflicts
    const conflictingBooking = await Booking.findOne({
      tutorId: tutor.userId.toString(),
      date: bookingDate,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } }
      ]
    });
    
    if (conflictingBooking) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }
    
    // Calculate price
    const hours = (duration || 60) / 60;
    let price = tutor.hourlyRate * hours;
    if (type === 'trial') {
      price = tutor.hourlyRate * 0.5; // 50% off for trial
    }
    
    const booking = new Booking({
      tutorId: tutor.userId.toString(),
      studentId: req.user.userId,
      date: bookingDate,
      startTime,
      endTime,
      duration: duration || 60,
      type: type || 'regular',
      price,
      status: 'pending'
    });
    
    await booking.save();

    // Get tutor and student user info
    const tutorUser = await User.findById(tutor.userId);
    const student = await User.findById(req.user.userId);

    // Create notifications
    await notificationService.createNotification(
      req.user.userId,
      'booking_created',
      'Booking Created',
      `Your lesson with ${tutorUser?.name || 'tutor'} has been created.`,
      booking._id,
      'booking'
    );

    // Send confirmation email
    if (student && tutorUser) {
      await sendBookingConfirmation(
        student.email,
        student.name,
        tutorUser.name,
        bookingDate,
        `${startTime} - ${endTime}`
      );
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookings for tutor
router.get('/tutor/me', authenticate, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    // Find tutor profile to get the userId
    const TutorProfile = require('../models/tutorProfile');
    const tutorProfile = await TutorProfile.findOne({ userId: req.user.userId });
    
    if (!tutorProfile) {
      return res.json([]);
    }
    
    let query = { tutorId: tutorProfile.userId.toString() };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const bookings = await Booking.find(query)
      .populate('studentId', 'name email')
      .sort({ date: 1, startTime: 1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookings for student
router.get('/student/me', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.userId })
      .populate('tutorId', 'name email')
      .populate({
        path: 'tutorId',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name email'
        }
      })
      .sort({ date: 1, startTime: 1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('tutorId', 'name email')
      .populate('studentId', 'name email');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check authorization
    if (booking.tutorId.toString() !== req.user.userId && 
        booking.studentId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const oldStatus = booking.status;
    booking.status = status;
    if (notes) booking.notes = notes;
    booking.updatedAt = new Date();
    
    await booking.save();

    // Create notification
    if (status === 'confirmed') {
      await notificationService.createNotification(
        booking.studentId._id || booking.studentId,
        'booking_confirmed',
        'Booking Confirmed',
        `Your lesson has been confirmed by the tutor.`,
        booking._id,
        'booking'
      );
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking with refund policy
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('tutorId', 'name email')
      .populate('studentId', 'name email');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check authorization
    const userId = req.user.userId.toString();
    if (booking.tutorId.toString() !== userId && 
        booking.studentId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    // Cancellation policy: Free cancellation if cancelled 24 hours before lesson
    const bookingDateTime = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.startTime}`);
    const hoursUntilLesson = (bookingDateTime - new Date()) / (1000 * 60 * 60);
    const cancellationFee = hoursUntilLesson < 24 ? booking.price * 0.2 : 0; // 20% fee if less than 24h
    const refundAmount = booking.price - cancellationFee;

    // Find payment
    const payment = await Payment.findOne({ bookingId: booking._id });
    let refundResult = null;

    if (payment && payment.status === 'completed' && refundAmount > 0) {
      try {
        // Process refund through Stripe
        if (payment.stripeChargeId) {
          const refund = await stripeService.createRefund(
            payment.stripeChargeId,
            refundAmount,
            reason || 'booking_cancelled'
          );
          
          payment.status = 'refunded';
          payment.refundId = refund.id;
          payment.refundAmount = refundAmount;
          payment.refundReason = reason || 'booking_cancelled';
          payment.refundedAt = new Date();
          await payment.save();

          refundResult = {
            refundId: refund.id,
            refundAmount: refund.amount / 100,
            cancellationFee
          };
        }
      } catch (refundError) {
        console.error('Refund error:', refundError);
        // Continue with cancellation even if refund fails
      }
    }

    // Update booking
    booking.status = 'cancelled';
    booking.updatedAt = new Date();
    booking.notes = reason ? `${booking.notes || ''}\nCancellation reason: ${reason}`.trim() : booking.notes;
    await booking.save();

    // Create notifications
    await notificationService.createNotification(
      booking.studentId._id || booking.studentId,
      'booking_cancelled',
      'Booking Cancelled',
      `Your booking has been cancelled${refundResult ? `. Refund of $${refundResult.refundAmount.toFixed(2)} will be processed.` : '.'}`,
      booking._id,
      'booking'
    );

    await notificationService.createNotification(
      booking.tutorId._id || booking.tutorId,
      'booking_cancelled',
      'Booking Cancelled',
      `A booking has been cancelled.`,
      booking._id,
      'booking'
    );
    
    res.json({
      message: 'Booking cancelled successfully',
      booking,
      refund: refundResult
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
  }
});

// Reschedule booking
router.post('/:id/reschedule', authenticate, async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('tutorId', 'name email')
      .populate('studentId', 'name email');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check authorization
    const userId = req.user.userId.toString();
    if (booking.tutorId.toString() !== userId && 
        booking.studentId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Check if booking can be rescheduled
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot reschedule cancelled or completed booking' });
    }

    // Check availability for new time
    const newBookingDate = new Date(date);
    const tutorProfile = await TutorProfile.findOne({ userId: booking.tutorId });
    const dayOfWeek = newBookingDate.getDay();
    
    const availability = await Availability.findOne({
      tutorId: booking.tutorId.toString(),
      dayOfWeek,
      isAvailable: true,
      startTime: { $lte: startTime },
      endTime: { $gte: endTime }
    });
    
    if (!availability) {
      return res.status(400).json({ message: 'New time slot not available' });
    }
    
    // Check for conflicts
    const conflictingBooking = await Booking.findOne({
      tutorId: booking.tutorId.toString(),
      date: newBookingDate,
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: booking._id },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } }
      ]
    });
    
    if (conflictingBooking) {
      return res.status(400).json({ message: 'New time slot already booked' });
    }

    // Update booking
    const oldDate = booking.date;
    const oldTime = `${booking.startTime} - ${booking.endTime}`;
    booking.date = newBookingDate;
    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.updatedAt = new Date();
    booking.notes = `${booking.notes || ''}\nRescheduled from ${oldDate.toLocaleDateString()} ${oldTime} to ${newBookingDate.toLocaleDateString()} ${startTime} - ${endTime}`.trim();
    await booking.save();

    // Create notifications
    await notificationService.createNotification(
      booking.studentId._id || booking.studentId,
      'booking_rescheduled',
      'Booking Rescheduled',
      `Your lesson has been rescheduled to ${newBookingDate.toLocaleDateString()} at ${startTime}.`,
      booking._id,
      'booking'
    );

    await notificationService.createNotification(
      booking.tutorId._id || booking.tutorId,
      'booking_rescheduled',
      'Booking Rescheduled',
      `A booking has been rescheduled to ${newBookingDate.toLocaleDateString()} at ${startTime}.`,
      booking._id,
      'booking'
    );
    
    res.json({
      message: 'Booking rescheduled successfully',
      booking
    });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({ message: 'Failed to reschedule booking', error: error.message });
  }
});

module.exports = router;


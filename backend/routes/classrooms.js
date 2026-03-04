const express = require('express');
const router = express.Router();
const Classroom = require('../models/classroom');
const Booking = require('../models/booking');
const User = require('../models/user');
const EmotionSession = require('../models/emotionSession');
const { authenticate } = require('../middleware/auth');
const dailyService = require('../services/dailyService');
const notificationService = require('../services/notificationService');
const { sendLessonStartingEmail } = require('../services/emailService');

// Create classroom for booking
router.post('/create', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if classroom already exists
    let classroom = await Classroom.findOne({ bookingId });
    if (classroom) {
      return res.json({
        message: 'Classroom already exists',
        classroom: {
          id: classroom._id,
          dailyRoomUrl: classroom.dailyRoomUrl,
          dailyRoomName: classroom.dailyRoomName
        }
      });
    }

    // Get tutor and student info
    const tutor = await User.findById(booking.tutorId);
    const student = await User.findById(booking.studentId);

    // Generate unique room name
    const roomName = `lesson-${booking._id}-${Date.now()}`;

    // Create Daily.co room
    const dailyRoom = await dailyService.createRoom(roomName, {
      enableRecording: false
    });

    // Get room tokens for tutor and student
    const tutorToken = await dailyService.getRoomToken(roomName, tutor._id.toString(), tutor.name, true);
    const studentToken = await dailyService.getRoomToken(roomName, student._id.toString(), student.name, false);

    // Create classroom record
    classroom = new Classroom({
      bookingId: booking._id,
      tutorId: booking.tutorId,
      studentId: booking.studentId,
      dailyRoomName: roomName,
      dailyRoomUrl: dailyRoom.url,
      dailyRoomToken: tutorToken, // Store tutor token (student gets theirs separately)
      status: 'scheduled'
    });

    await classroom.save();

    // Update booking with meeting link
    booking.meetingLink = dailyRoom.url;
    await booking.save();

    res.status(201).json({
      message: 'Classroom created successfully',
      classroom: {
        id: classroom._id,
        dailyRoomUrl: dailyRoom.url,
        dailyRoomName: roomName,
        tutorToken,
        studentToken
      }
    });
  } catch (error) {
    console.error('Classroom creation error:', error);
    res.status(500).json({ message: 'Failed to create classroom', error: error.message });
  }
});

// Get classroom info
router.get('/:bookingId', authenticate, async (req, res) => {
  try {
    const classroom = await Classroom.findOne({ bookingId: req.params.bookingId })
      .populate('tutorId', 'name email')
      .populate('studentId', 'name email')
      .populate('bookingId');

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Check authorization
    const userId = req.user.userId.toString();
    if (classroom.tutorId._id.toString() !== userId && 
        classroom.studentId._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get appropriate token
    const isTutor = classroom.tutorId._id.toString() === userId;
    const user = await User.findById(userId);
    
    let token = classroom.dailyRoomToken;
    if (!isTutor) {
      token = await dailyService.getRoomToken(
        classroom.dailyRoomName,
        userId,
        user.name,
        false
      );
    }

    res.json({
      ...classroom.toObject(),
      dailyRoomToken: token,
      isOwner: isTutor
    });
  } catch (error) {
    console.error('Get classroom error:', error);
    res.status(500).json({ message: 'Failed to get classroom', error: error.message });
  }
});

// Start lesson
router.post('/:id/start', authenticate, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('tutorId')
      .populate('studentId');

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Only tutor can start the lesson
    if (classroom.tutorId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only tutor can start the lesson' });
    }

    classroom.status = 'active';
    classroom.startedAt = new Date();
    await classroom.save();

    // Automatically start emotion tracking session
    try {
      let emotionSession = await EmotionSession.findOne({ 
        bookingId: classroom.bookingId,
        status: 'active'
      });

      if (!emotionSession) {
        emotionSession = new EmotionSession({
          bookingId: classroom.bookingId,
          classroomId: classroom._id,
          studentId: classroom.studentId,
          tutorId: classroom.tutorId,
          status: 'active',
          startTime: new Date()
        });
        await emotionSession.save();
      }
    } catch (emotionError) {
      console.error('Failed to start emotion tracking:', emotionError);
      // Continue even if emotion tracking fails
    }

    // Send notification to student
    await notificationService.createNotification(
      classroom.studentId._id,
      'lesson_starting',
      'Lesson Starting',
      'Your lesson is starting now. Please join the classroom.',
      classroom.bookingId,
      'booking'
    );

    // Send email to student
    await sendLessonStartingEmail(
      classroom.studentId.email,
      classroom.studentId.name,
      classroom.tutorId.name,
      classroom.dailyRoomUrl
    );

    res.json({
      message: 'Lesson started successfully',
      classroom: {
        id: classroom._id,
        status: classroom.status,
        dailyRoomUrl: classroom.dailyRoomUrl
      }
    });
  } catch (error) {
    console.error('Start lesson error:', error);
    res.status(500).json({ message: 'Failed to start lesson', error: error.message });
  }
});

// End lesson
router.post('/:id/end', authenticate, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Tutor or student can end the lesson
    const userId = req.user.userId.toString();
    if (classroom.tutorId.toString() !== userId && 
        classroom.studentId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const startedAt = classroom.startedAt || new Date();
    const endedAt = new Date();
    const durationMinutes = Math.round((endedAt - startedAt) / (1000 * 60));

    classroom.status = 'ended';
    classroom.endedAt = endedAt;
    classroom.duration = durationMinutes;
    await classroom.save();

    // End emotion tracking session
    try {
      const emotionSession = await EmotionSession.findOne({
        bookingId: classroom.bookingId,
        status: 'active'
      });

      if (emotionSession) {
        emotionSession.calculateDominantEmotions();
        emotionSession.calculateEngagement();
        emotionSession.endTime = new Date();
        emotionSession.status = 'completed';
        
        // Calculate final metrics
        const totalDuration = (emotionSession.endTime - emotionSession.startTime) / 1000;
        const highEngagementPercentage = emotionSession.emotionDataPoints.filter(
          e => e.engagement >= 70
        ).length / emotionSession.emotionDataPoints.length * 100;

        emotionSession.feedbackScore = Math.round((emotionSession.averageEngagement / 100) * 10);
        
        // Determine strengths and improvement areas
        const topEmotions = emotionSession.dominantEmotions.slice(0, 3);
        const positiveEmotions = ['happy', 'engaged', 'excited'];
        const negativeEmotions = ['sad', 'bored', 'frustrated', 'confused'];

        emotionSession.strengths = topEmotions
          .filter(e => positiveEmotions.includes(e.emotion))
          .map(e => `High ${e.emotion} engagement (${e.percentage.toFixed(1)}%)`);

        emotionSession.improvementAreas = topEmotions
          .filter(e => negativeEmotions.includes(e.emotion))
          .map(e => `Reduce ${e.emotion} (${e.percentage.toFixed(1)}%)`);

        emotionSession.updatedAt = new Date();
        await emotionSession.save();
      }
    } catch (emotionError) {
      console.error('Failed to end emotion tracking:', emotionError);
      // Continue even if emotion tracking fails
    }

    // Update booking status if lesson completed
    const booking = await Booking.findById(classroom.bookingId);
    if (booking && booking.status === 'confirmed') {
      booking.status = 'completed';
      await booking.save();
    }

    res.json({
      message: 'Lesson ended successfully',
      classroom: {
        id: classroom._id,
        status: classroom.status,
        duration: classroom.duration
      }
    });
  } catch (error) {
    console.error('End lesson error:', error);
    res.status(500).json({ message: 'Failed to end lesson', error: error.message });
  }
});

// Get room token
router.post('/:id/token', authenticate, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    const userId = req.user.userId.toString();
    const isTutor = classroom.tutorId.toString() === userId;

    if (!isTutor && classroom.studentId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    const token = await dailyService.getRoomToken(
      classroom.dailyRoomName,
      userId,
      user.name,
      isTutor
    );

    res.json({
      token,
      dailyRoomUrl: classroom.dailyRoomUrl,
      isOwner: isTutor
    });
  } catch (error) {
    console.error('Get token error:', error);
    res.status(500).json({ message: 'Failed to get room token', error: error.message });
  }
});

module.exports = router;


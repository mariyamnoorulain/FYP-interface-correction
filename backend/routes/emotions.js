const express = require('express');
const router = express.Router();
const EmotionSession = require('../models/emotionSession');
const EmotionData = require('../models/emotionData');
const Classroom = require('../models/classroom');
const Booking = require('../models/booking');
const { authenticate } = require('../middleware/auth');
const emotionDetectionService = require('../services/emotionDetectionService');

// Start emotion tracking session for a classroom/booking
router.post('/session/start', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.userId;

    // Verify booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization (only student or tutor can start session)
    if (booking.studentId.toString() !== userId && booking.tutorId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if classroom exists
    const classroom = await Classroom.findOne({ bookingId });
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found. Please create classroom first.' });
    }

    // Check if session already exists
    let session = await EmotionSession.findOne({ 
      bookingId,
      status: 'active'
    });

    if (session) {
      return res.json({
        message: 'Emotion tracking session already active',
        sessionId: session._id
      });
    }

    // Create new emotion session
    session = new EmotionSession({
      bookingId,
      classroomId: classroom._id,
      studentId: booking.studentId,
      tutorId: booking.tutorId,
      status: 'active',
      startTime: new Date()
    });

    await session.save();

    res.status(201).json({
      message: 'Emotion tracking session started',
      sessionId: session._id,
      session
    });
  } catch (error) {
    console.error('Start emotion session error:', error);
    res.status(500).json({ message: 'Failed to start emotion session', error: error.message });
  }
});

// Submit emotion detection data (from Module 1 and/or Module 2)
router.post('/data', authenticate, async (req, res) => {
  try {
    const { 
      sessionId, 
      module1Data,  // Data from face detection module
      module2Data,  // Data from voice/speech detection module
      timestamp 
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    // Verify session exists
    const session = await EmotionSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Emotion session not found' });
    }

    // Check authorization
    const userId = req.user.userId.toString();
    if (session.studentId.toString() !== userId && session.tutorId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Process emotion detection from both modules
    const processedData = emotionDetectionService.processEmotionDetection(
      module1Data,
      module2Data,
      {
        fusionWeights: {
          module1: 0.5, // Adjust weights based on module reliability
          module2: 0.5
        }
      }
    );

    // Create emotion data point
    const emotionData = new EmotionData({
      emotionSessionId: session._id,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      emotions: processedData.emotions,
      dominantEmotion: processedData.dominantEmotion || 'neutral',
      confidence: processedData.confidence,
      engagement: processedData.engagement || 50,
      faceDetected: processedData.faceDetected || false,
      faceBoundingBox: processedData.faceBoundingBox || null,
      metadata: processedData.metadata || {},
      detectionSource: processedData.detectionSource || 'combined',
      rawData: {
        module1: module1Data || null,
        module2: module2Data || null
      }
    });

    await emotionData.save();

    // Update session with new data point
    session.emotionDataPoints.push({
      timestamp: emotionData.timestamp,
      emotion: emotionData.dominantEmotion,
      confidence: emotionData.confidence,
      engagement: emotionData.engagement,
      metadata: emotionData.metadata
    });

    // Recalculate metrics every 10 data points or at session end
    if (session.emotionDataPoints.length % 10 === 0 || req.body.finalDataPoint) {
      session.calculateDominantEmotions();
      session.calculateEngagement();
    }

    // Generate adaptive recommendations if engagement is low
    const recentEmotions = session.emotionDataPoints.slice(-10);
    if (recentEmotions.length >= 5) {
      const recommendations = emotionDetectionService.generateAdaptiveRecommendations(
        recentEmotions.map(e => ({
          dominantEmotion: e.emotion,
          engagement: e.engagement
        }))
      );

      // Add new recommendations that aren't already implemented
      recommendations.forEach(rec => {
        const exists = session.adaptiveRecommendations.some(
          r => r.recommendation === rec.recommendation && !r.implemented
        );
        if (!exists) {
          session.adaptiveRecommendations.push({
            timestamp: new Date(),
            ...rec
          });
        }
      });
    }

    session.updatedAt = new Date();
    await session.save();

    // Send real-time recommendation if engagement is critical
    const latestEngagement = emotionData.engagement;
    let recommendation = null;
    if (latestEngagement < 30 && session.adaptiveRecommendations.length > 0) {
      const latestRec = session.adaptiveRecommendations
        .filter(r => !r.implemented)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      
      if (latestRec && latestRec.priority === 'high') {
        recommendation = latestRec;
      }
    }

    res.status(201).json({
      message: 'Emotion data recorded successfully',
      emotionData: {
        id: emotionData._id,
        dominantEmotion: emotionData.dominantEmotion,
        confidence: emotionData.confidence,
        engagement: emotionData.engagement,
        timestamp: emotionData.timestamp
      },
      sessionMetrics: {
        averageEngagement: session.averageEngagement,
        engagementLevel: session.engagementLevel,
        totalDataPoints: session.emotionDataPoints.length
      },
      recommendation // Include recommendation if critical
    });
  } catch (error) {
    console.error('Submit emotion data error:', error);
    res.status(500).json({ message: 'Failed to submit emotion data', error: error.message });
  }
});

// End emotion tracking session
router.post('/session/:id/end', authenticate, async (req, res) => {
  try {
    const session = await EmotionSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Emotion session not found' });
    }

    // Check authorization
    const userId = req.user.userId.toString();
    if (session.studentId.toString() !== userId && session.tutorId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({ message: 'Session already completed' });
    }

    // Finalize calculations
    session.calculateDominantEmotions();
    session.calculateEngagement();
    session.endTime = new Date();
    session.status = 'completed';

    // Calculate final feedback metrics
    const totalDuration = (session.endTime - session.startTime) / 1000; // in seconds
    const highEngagementPercentage = session.emotionDataPoints.filter(
      e => e.engagement >= 70
    ).length / session.emotionDataPoints.length * 100;

    // Feedback score: 0-10 based on engagement
    session.feedbackScore = Math.round((session.averageEngagement / 100) * 10);

    // Determine strengths and improvement areas
    const topEmotions = session.dominantEmotions.slice(0, 3);
    const positiveEmotions = ['happy', 'engaged', 'excited'];
    const negativeEmotions = ['sad', 'bored', 'frustrated', 'confused'];

    session.strengths = topEmotions
      .filter(e => positiveEmotions.includes(e.emotion))
      .map(e => `High ${e.emotion} engagement (${e.percentage.toFixed(1)}%)`);

    session.improvementAreas = topEmotions
      .filter(e => negativeEmotions.includes(e.emotion))
      .map(e => `Reduce ${e.emotion} (${e.percentage.toFixed(1)}%)`);

    session.updatedAt = new Date();
    await session.save();

    res.json({
      message: 'Emotion tracking session completed',
      session: {
        id: session._id,
        duration: totalDuration,
        averageEngagement: session.averageEngagement,
        engagementLevel: session.engagementLevel,
        feedbackScore: session.feedbackScore,
        dominantEmotions: session.dominantEmotions,
        strengths: session.strengths,
        improvementAreas: session.improvementAreas,
        totalDataPoints: session.emotionDataPoints.length
      }
    });
  } catch (error) {
    console.error('End emotion session error:', error);
    res.status(500).json({ message: 'Failed to end emotion session', error: error.message });
  }
});

// Get emotion session data
router.get('/session/:id', authenticate, async (req, res) => {
  try {
    const session = await EmotionSession.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email')
      .populate('bookingId');

    if (!session) {
      return res.status(404).json({ message: 'Emotion session not found' });
    }

    // Check authorization
    const userId = req.user.userId.toString();
    if (session.studentId._id.toString() !== userId && session.tutorId._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get emotion session error:', error);
    res.status(500).json({ message: 'Failed to get emotion session', error: error.message });
  }
});

// Get emotion timeline data for a session
router.get('/session/:id/timeline', authenticate, async (req, res) => {
  try {
    const { limit = 100, startTime, endTime } = req.query;
    
    const session = await EmotionSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Emotion session not found' });
    }

    // Check authorization
    const userId = req.user.userId.toString();
    if (session.studentId.toString() !== userId && session.tutorId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Build query
    let query = { emotionSessionId: session._id };
    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) query.timestamp.$gte = new Date(startTime);
      if (endTime) query.timestamp.$lte = new Date(endTime);
    }

    const emotionData = await EmotionData.find(query)
      .sort({ timestamp: 1 })
      .limit(parseInt(limit));

    res.json({
      sessionId: session._id,
      totalDataPoints: emotionData.length,
      timeline: emotionData.map(d => ({
        timestamp: d.timestamp,
        dominantEmotion: d.dominantEmotion,
        confidence: d.confidence,
        engagement: d.engagement,
        emotions: d.emotions
      }))
    });
  } catch (error) {
    console.error('Get emotion timeline error:', error);
    res.status(500).json({ message: 'Failed to get emotion timeline', error: error.message });
  }
});

// Get adaptive recommendations for a session
router.get('/session/:id/recommendations', authenticate, async (req, res) => {
  try {
    const session = await EmotionSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Emotion session not found' });
    }

    // Check authorization
    const userId = req.user.userId.toString();
    if (session.tutorId.toString() !== userId) {
      return res.status(403).json({ message: 'Only tutor can view recommendations' });
    }

    const activeRecommendations = session.adaptiveRecommendations
      .filter(r => !r.implemented)
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    res.json({
      sessionId: session._id,
      currentEngagement: session.averageEngagement,
      engagementLevel: session.engagementLevel,
      recommendations: activeRecommendations,
      allRecommendations: session.adaptiveRecommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
  }
});

// Mark recommendation as implemented
router.patch('/session/:sessionId/recommendation/:recId', authenticate, async (req, res) => {
  try {
    const session = await EmotionSession.findById(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Emotion session not found' });
    }

    // Check authorization (only tutor)
    const userId = req.user.userId.toString();
    if (session.tutorId.toString() !== userId) {
      return res.status(403).json({ message: 'Only tutor can implement recommendations' });
    }

    const recommendation = session.adaptiveRecommendations.id(req.params.recId);
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    recommendation.implemented = true;
    session.updatedAt = new Date();
    await session.save();

    res.json({
      message: 'Recommendation marked as implemented',
      recommendation
    });
  } catch (error) {
    console.error('Mark recommendation implemented error:', error);
    res.status(500).json({ message: 'Failed to update recommendation', error: error.message });
  }
});

// Get student's emotion analytics (aggregated across all sessions)
router.get('/analytics/student/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    // Check authorization (student viewing own data or tutor viewing student)
    if (req.user.userId.toString() !== studentId && req.user.role !== 'tutor') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let query = { 
      studentId,
      status: 'completed'
    };

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const sessions = await EmotionSession.find(query)
      .populate('bookingId', 'date')
      .sort({ startTime: -1 });

    // Aggregate analytics
    const totalSessions = sessions.length;
    const avgEngagement = sessions.reduce((sum, s) => sum + (s.averageEngagement || 0), 0) / totalSessions || 0;
    
    const emotionCounts = {};
    sessions.forEach(session => {
      session.dominantEmotions.forEach(emo => {
        if (!emotionCounts[emo.emotion]) {
          emotionCounts[emo.emotion] = 0;
        }
        emotionCounts[emo.emotion] += emo.percentage;
      });
    });

    res.json({
      studentId,
      totalSessions,
      averageEngagement: avgEngagement,
      engagementTrend: sessions.map(s => ({
        date: s.startTime,
        engagement: s.averageEngagement,
        level: s.engagementLevel
      })),
      dominantEmotions: Object.entries(emotionCounts)
        .map(([emotion, total]) => ({ emotion, percentage: total / totalSessions }))
        .sort((a, b) => b.percentage - a.percentage),
      recentSessions: sessions.slice(0, 10).map(s => ({
        id: s._id,
        date: s.startTime,
        engagement: s.averageEngagement,
        feedbackScore: s.feedbackScore,
        duration: s.endTime ? (s.endTime - s.startTime) / 1000 : 0
      }))
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Failed to get analytics', error: error.message });
  }
});

module.exports = router;


const mongoose = require('mongoose');

const emotionSessionSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
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
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  // Aggregated emotion metrics
  dominantEmotions: [{
    emotion: {
      type: String,
      enum: ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral', 'confused', 'bored', 'engaged', 'frustrated', 'excited']
    },
    percentage: Number,
    duration: Number // in seconds
  }],
  averageEngagement: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  engagementLevel: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    default: 'medium'
  },
  // Emotion timeline data points
  emotionDataPoints: [{
    timestamp: Date,
    emotion: String,
    confidence: Number,
    engagement: Number,
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }],
  // Adaptive learning insights
  adaptiveRecommendations: [{
    timestamp: Date,
    recommendation: String,
    reason: String,
    action: {
      type: String,
      enum: ['slow_down', 'speed_up', 'repeat', 'simplify', 'encourage', 'change_topic', 'take_break', 'no_action']
    },
    implemented: {
      type: Boolean,
      default: false
    }
  }],
  // Feedback metrics
  feedbackScore: {
    type: Number,
    min: 0,
    max: 10
  },
  improvementAreas: [String],
  strengths: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

emotionSessionSchema.index({ bookingId: 1 });
emotionSessionSchema.index({ studentId: 1, createdAt: -1 });
emotionSessionSchema.index({ tutorId: 1, createdAt: -1 });
emotionSessionSchema.index({ status: 1 });

emotionSessionSchema.methods.calculateEngagement = function() {
  if (!this.emotionDataPoints || this.emotionDataPoints.length === 0) {
    return 50; // Default medium engagement
  }

  // Calculate engagement based on positive emotions
  const positiveEmotions = ['happy', 'engaged', 'excited'];
  const negativeEmotions = ['sad', 'bored', 'frustrated', 'confused'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  let totalConfidence = 0;

  this.emotionDataPoints.forEach(point => {
    if (positiveEmotions.includes(point.emotion)) {
      positiveCount += point.confidence;
    } else if (negativeEmotions.includes(point.emotion)) {
      negativeCount += point.confidence;
    }
    totalConfidence += point.confidence;
  });

  // Engagement score: 0-100
  const engagementScore = totalConfidence > 0 
    ? ((positiveCount / totalConfidence) * 100) - ((negativeCount / totalConfidence) * 50) + 50
    : 50;

  this.averageEngagement = Math.max(0, Math.min(100, engagementScore));
  
  // Determine engagement level
  if (this.averageEngagement >= 80) {
    this.engagementLevel = 'very_high';
  } else if (this.averageEngagement >= 60) {
    this.engagementLevel = 'high';
  } else if (this.averageEngagement >= 40) {
    this.engagementLevel = 'medium';
  } else if (this.averageEngagement >= 20) {
    this.engagementLevel = 'low';
  } else {
    this.engagementLevel = 'very_low';
  }

  return this.averageEngagement;
};

emotionSessionSchema.methods.calculateDominantEmotions = function() {
  if (!this.emotionDataPoints || this.emotionDataPoints.length === 0) {
    return [];
  }

  const emotionCounts = {};
  let totalDuration = 0;

  this.emotionDataPoints.forEach((point, index) => {
    const nextPoint = this.emotionDataPoints[index + 1];
    const duration = nextPoint 
      ? (new Date(nextPoint.timestamp) - new Date(point.timestamp)) / 1000
      : 1; // Default 1 second for last point

    if (!emotionCounts[point.emotion]) {
      emotionCounts[point.emotion] = { count: 0, duration: 0, totalConfidence: 0 };
    }
    
    emotionCounts[point.emotion].count += 1;
    emotionCounts[point.emotion].duration += duration;
    emotionCounts[point.emotion].totalConfidence += point.confidence;
    totalDuration += duration;
  });

  // Calculate percentages and average confidence
  this.dominantEmotions = Object.entries(emotionCounts).map(([emotion, data]) => ({
    emotion,
    percentage: totalDuration > 0 ? (data.duration / totalDuration) * 100 : 0,
    duration: data.duration,
    averageConfidence: data.count > 0 ? data.totalConfidence / data.count : 0
  })).sort((a, b) => b.percentage - a.percentage);

  return this.dominantEmotions;
};

module.exports = mongoose.model('EmotionSession', emotionSessionSchema);


const mongoose = require('mongoose');

const emotionDataSchema = new mongoose.Schema({
  emotionSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmotionSession',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  // Detected emotions with confidence scores
  emotions: {
    happy: { type: Number, min: 0, max: 1, default: 0 },
    sad: { type: Number, min: 0, max: 1, default: 0 },
    angry: { type: Number, min: 0, max: 1, default: 0 },
    fear: { type: Number, min: 0, max: 1, default: 0 },
    surprise: { type: Number, min: 0, max: 1, default: 0 },
    disgust: { type: Number, min: 0, max: 1, default: 0 },
    neutral: { type: Number, min: 0, max: 1, default: 0 },
    confused: { type: Number, min: 0, max: 1, default: 0 },
    bored: { type: Number, min: 0, max: 1, default: 0 },
    engaged: { type: Number, min: 0, max: 1, default: 0 },
    frustrated: { type: Number, min: 0, max: 1, default: 0 },
    excited: { type: Number, min: 0, max: 1, default: 0 }
  },
  // Dominant emotion
  dominantEmotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral', 'confused', 'bored', 'engaged', 'frustrated', 'excited'],
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  // Engagement metrics
  engagement: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  // Face detection metadata (if using face detection)
  faceDetected: {
    type: Boolean,
    default: false
  },
  faceBoundingBox: {
    x: Number,
    y: Number,
    width: Number,
    height: Number
  },
  // Additional metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Source of detection (e.g., 'module1', 'module2', 'combined')
  detectionSource: {
    type: String,
    default: 'combined'
  },
  // Raw detection data from modules
  rawData: {
    module1: mongoose.Schema.Types.Mixed,
    module2: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

emotionDataSchema.index({ emotionSessionId: 1, timestamp: 1 });
emotionDataSchema.index({ timestamp: -1 });

// Pre-save hook to calculate dominant emotion and engagement
emotionDataSchema.pre('save', function(next) {
  // Find dominant emotion
  const emotionValues = Object.entries(this.emotions);
  const sorted = emotionValues.sort((a, b) => b[1] - a[1]);
  this.dominantEmotion = sorted[0][0];
  this.confidence = sorted[0][1];

  // Calculate engagement score
  const positiveEmotions = ['happy', 'engaged', 'excited'];
  const negativeEmotions = ['sad', 'bored', 'frustrated', 'confused'];
  
  let positiveScore = 0;
  let negativeScore = 0;

  positiveEmotions.forEach(emo => {
    positiveScore += this.emotions[emo] || 0;
  });

  negativeEmotions.forEach(emo => {
    negativeScore += this.emotions[emo] || 0;
  });

  // Engagement: 0-100 scale
  this.engagement = Math.max(0, Math.min(100, (positiveScore * 100) - (negativeScore * 50) + 50));

  next();
});

module.exports = mongoose.model('EmotionData', emotionDataSchema);


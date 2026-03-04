// Emotion Detection Service
// This service integrates with your two emotion detection modules

/**
 * Process emotion data from Module 1 (Face-based detection)
 * @param {Object} faceDetectionData - Raw data from face detection module
 * @returns {Object} Normalized emotion data
 */
const processModule1Emotion = (faceDetectionData) => {
  try {
    // Expected format from Module 1 (face detection)
    // Adapt based on your actual module output format
    
    const emotions = {
      happy: faceDetectionData.happiness || faceDetectionData.happy || 0,
      sad: faceDetectionData.sadness || faceDetectionData.sad || 0,
      angry: faceDetectionData.anger || faceDetectionData.angry || 0,
      fear: faceDetectionData.fear || 0,
      surprise: faceDetectionData.surprise || 0,
      disgust: faceDetectionData.disgust || 0,
      neutral: faceDetectionData.neutral || 0,
      confused: faceDetectionData.confusion || faceDetectionData.confused || 0,
      bored: 0,
      engaged: 0,
      frustrated: 0,
      excited: 0
    };

    // Normalize values to 0-1 range if needed
    Object.keys(emotions).forEach(key => {
      if (emotions[key] > 1) {
        emotions[key] = emotions[key] / 100;
      }
      emotions[key] = Math.max(0, Math.min(1, emotions[key]));
    });

    return {
      emotions,
      faceDetected: faceDetectionData.faceDetected !== false,
      faceBoundingBox: faceDetectionData.boundingBox || faceDetectionData.bbox || null,
      confidence: faceDetectionData.confidence || 0.5,
      metadata: {
        faceQuality: faceDetectionData.quality || null,
        headPose: faceDetectionData.headPose || null,
        landmarks: faceDetectionData.landmarks || null
      }
    };
  } catch (error) {
    console.error('Module 1 processing error:', error);
    return getDefaultEmotionData();
  }
};

/**
 * Process emotion data from Module 2 (Voice/Speech-based detection)
 * @param {Object} voiceDetectionData - Raw data from voice detection module
 * @returns {Object} Normalized emotion data
 */
const processModule2Emotion = (voiceDetectionData) => {
  try {
    // Expected format from Module 2 (voice/speech detection)
    // Adapt based on your actual module output format
    
    const emotions = {
      happy: voiceDetectionData.happiness || voiceDetectionData.happy || 0,
      sad: voiceDetectionData.sadness || voiceDetectionData.sad || 0,
      angry: voiceDetectionData.anger || voiceDetectionData.angry || 0,
      fear: voiceDetectionData.fear || 0,
      surprise: voiceDetectionData.surprise || 0,
      disgust: voiceDetectionData.disgust || 0,
      neutral: voiceDetectionData.neutral || 0,
      confused: voiceDetectionData.confusion || voiceDetectionData.confused || 0,
      bored: voiceDetectionData.boredom || voiceDetectionData.bored || 0,
      engaged: voiceDetectionData.engagement || voiceDetectionData.engaged || 0,
      frustrated: voiceDetectionData.frustration || voiceDetectionData.frustrated || 0,
      excited: voiceDetectionData.excitement || voiceDetectionData.excited || 0
    };

    // Normalize values to 0-1 range if needed
    Object.keys(emotions).forEach(key => {
      if (emotions[key] > 1) {
        emotions[key] = emotions[key] / 100;
      }
      emotions[key] = Math.max(0, Math.min(1, emotions[key]));
    });

    return {
      emotions,
      faceDetected: false, // Voice module doesn't detect faces
      voiceFeatures: {
        pitch: voiceDetectionData.pitch || null,
        energy: voiceDetectionData.energy || null,
        tempo: voiceDetectionData.tempo || null,
        pauseFrequency: voiceDetectionData.pauseFrequency || null
      },
      confidence: voiceDetectionData.confidence || 0.5,
      metadata: {
        audioQuality: voiceDetectionData.quality || null,
        speechRate: voiceDetectionData.speechRate || null,
        volume: voiceDetectionData.volume || null
      }
    };
  } catch (error) {
    console.error('Module 2 processing error:', error);
    return getDefaultEmotionData();
  }
};

/**
 * Combine results from both modules using weighted fusion
 * @param {Object} module1Data - Processed data from Module 1
 * @param {Object} module2Data - Processed data from Module 2
 * @param {Object} weights - Weights for fusion (default: equal weights)
 * @returns {Object} Combined emotion data
 */
const fuseEmotionData = (module1Data, module2Data, weights = { module1: 0.5, module2: 0.5 }) => {
  try {
    const combinedEmotions = {};
    const emotionKeys = Object.keys(module1Data.emotions || module2Data.emotions || {});

    emotionKeys.forEach(emotion => {
      const value1 = (module1Data.emotions?.[emotion] || 0) * weights.module1;
      const value2 = (module2Data.emotions?.[emotion] || 0) * weights.module2;
      combinedEmotions[emotion] = value1 + value2;
    });

    // Normalize to ensure sum doesn't exceed 1 (optional)
    const sum = Object.values(combinedEmotions).reduce((a, b) => a + b, 0);
    if (sum > 1) {
      Object.keys(combinedEmotions).forEach(key => {
        combinedEmotions[key] = combinedEmotions[key] / sum;
      });
    }

    // Calculate combined confidence
    const combinedConfidence = (module1Data.confidence * weights.module1) + 
                               (module2Data.confidence * weights.module2);

    return {
      emotions: combinedEmotions,
      confidence: combinedConfidence,
      faceDetected: module1Data.faceDetected || false,
      faceBoundingBox: module1Data.faceBoundingBox || null,
      metadata: {
        ...module1Data.metadata,
        ...module2Data.metadata,
        fusionWeights: weights,
        module1Confidence: module1Data.confidence,
        module2Confidence: module2Data.confidence
      },
      rawData: {
        module1: module1Data,
        module2: module2Data
      }
    };
  } catch (error) {
    console.error('Emotion fusion error:', error);
    return module1Data || module2Data || getDefaultEmotionData();
  }
};

/**
 * Get default/neutral emotion data when detection fails
 * @returns {Object} Default emotion data
 */
const getDefaultEmotionData = () => {
  return {
    emotions: {
      happy: 0,
      sad: 0,
      angry: 0,
      fear: 0,
      surprise: 0,
      disgust: 0,
      neutral: 1,
      confused: 0,
      bored: 0,
      engaged: 0.5,
      frustrated: 0,
      excited: 0
    },
    dominantEmotion: 'neutral',
    confidence: 0.5,
    engagement: 50,
    faceDetected: false,
    metadata: {}
  };
};

/**
 * Main function to process emotion detection from both modules
 * @param {Object} module1RawData - Raw data from Module 1
 * @param {Object} module2RawData - Raw data from Module 2
 * @param {Object} options - Processing options
 * @returns {Object} Final combined emotion data
 */
const processEmotionDetection = (module1RawData = null, module2RawData = null, options = {}) => {
  try {
    let module1Data = null;
    let module2Data = null;

    // Process Module 1 if data provided
    if (module1RawData) {
      module1Data = processModule1Emotion(module1RawData);
    }

    // Process Module 2 if data provided
    if (module2RawData) {
      module2Data = processModule2Emotion(module2RawData);
    }

    // If only one module has data, return that
    if (!module1Data && module2Data) {
      return { ...module2Data, detectionSource: 'module2' };
    }
    if (module1Data && !module2Data) {
      return { ...module1Data, detectionSource: 'module1' };
    }

    // If both modules have data, fuse them
    if (module1Data && module2Data) {
      const weights = options.fusionWeights || { module1: 0.5, module2: 0.5 };
      return { ...fuseEmotionData(module1Data, module2Data, weights), detectionSource: 'combined' };
    }

    // If no data, return default
    return { ...getDefaultEmotionData(), detectionSource: 'none' };
  } catch (error) {
    console.error('Emotion detection processing error:', error);
    return { ...getDefaultEmotionData(), detectionSource: 'error' };
  }
};

/**
 * Generate adaptive learning recommendations based on emotion data
 * @param {Array} recentEmotions - Array of recent emotion data points
 * @returns {Array} Array of recommendations
 */
const generateAdaptiveRecommendations = (recentEmotions) => {
  const recommendations = [];
  
  if (!recentEmotions || recentEmotions.length === 0) {
    return recommendations;
  }

  // Calculate average engagement over last 5 data points
  const recent5 = recentEmotions.slice(-5);
  const avgEngagement = recent5.reduce((sum, e) => sum + (e.engagement || 50), 0) / recent5.length;

  // Check for confused/bored patterns
  const confusedCount = recent5.filter(e => e.dominantEmotion === 'confused').length;
  const boredCount = recent5.filter(e => e.dominantEmotion === 'bored').length;

  // Generate recommendations based on patterns
  if (avgEngagement < 30) {
    recommendations.push({
      recommendation: 'Student engagement is very low',
      reason: `Average engagement is ${avgEngagement.toFixed(0)}%`,
      action: 'take_break',
      priority: 'high'
    });
  } else if (confusedCount >= 3) {
    recommendations.push({
      recommendation: 'Student appears confused',
      reason: 'Confusion detected multiple times',
      action: 'repeat',
      priority: 'high'
    });
  } else if (boredCount >= 3) {
    recommendations.push({
      recommendation: 'Student appears bored',
      reason: 'Boredom detected multiple times',
      action: 'change_topic',
      priority: 'medium'
    });
  } else if (avgEngagement > 80) {
    recommendations.push({
      recommendation: 'Student is highly engaged',
      reason: `High engagement (${avgEngagement.toFixed(0)}%)`,
      action: 'speed_up',
      priority: 'low'
    });
  }

  return recommendations;
};

module.exports = {
  processEmotionDetection,
  processModule1Emotion,
  processModule2Emotion,
  fuseEmotionData,
  generateAdaptiveRecommendations,
  getDefaultEmotionData
};


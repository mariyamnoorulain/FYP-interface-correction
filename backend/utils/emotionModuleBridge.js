/**
 * Emotion Module Bridge
 * 
 * This utility helps integrate Python-based emotion detection modules
 * with the Node.js backend. It provides a bridge for calling Python
 * modules and formatting their output.
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * Call Python emotion detection module
 * @param {string} modulePath - Path to Python module script
 * @param {Object} inputData - Input data (e.g., image path, audio path, or base64 data)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Formatted emotion data
 */
async function callPythonModule(modulePath, inputData, options = {}) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [modulePath, JSON.stringify(inputData)]);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python module exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(formatEmotionData(result, options));
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error.message}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to spawn Python process: ${error.message}`));
    });
  });
}

/**
 * Format emotion data from Python module to match expected schema
 * @param {Object} rawData - Raw output from Python module
 * @param {Object} options - Formatting options
 * @returns {Object} - Formatted emotion data
 */
function formatEmotionData(rawData, options = {}) {
  const { moduleType = 'module1' } = options;

  // Normalize emotion keys (handle different naming conventions)
  const emotionMap = {
    happy: ['happiness', 'happy', 'joy', 'joyful'],
    sad: ['sadness', 'sad', 'sorrow'],
    angry: ['anger', 'angry', 'mad'],
    fear: ['fear', 'afraid', 'scared'],
    surprise: ['surprise', 'surprised'],
    disgust: ['disgust', 'disgusted'],
    neutral: ['neutral', 'calm'],
    confusion: ['confusion', 'confused', 'confused'],
    boredom: ['boredom', 'bored'],
    engagement: ['engagement', 'engaged'],
    frustration: ['frustration', 'frustrated'],
    excitement: ['excitement', 'excited']
  };

  const formatted = {
    emotions: {},
    dominantEmotion: null,
    confidence: rawData.confidence || 0.5
  };

  // Map emotions
  for (const [standardKey, variants] of Object.entries(emotionMap)) {
    for (const variant of variants) {
      if (rawData[variant] !== undefined) {
        // Normalize to 0-1 range if needed
        let value = rawData[variant];
        if (value > 1) value = value / 100;
        formatted.emotions[standardKey] = value;
        break;
      }
    }
  }

  // Determine dominant emotion
  let maxValue = 0;
  for (const [emotion, value] of Object.entries(formatted.emotions)) {
    if (value > maxValue) {
      maxValue = value;
      formatted.dominantEmotion = emotion;
    }
  }

  // Module 1 specific fields (face detection)
  if (moduleType === 'module1') {
    formatted.faceDetected = rawData.faceDetected !== false;
    formatted.boundingBox = rawData.boundingBox || rawData.bbox || null;
    formatted.quality = rawData.quality || formatted.confidence;
    if (rawData.headPose) formatted.headPose = rawData.headPose;
    if (rawData.landmarks) formatted.landmarks = rawData.landmarks;
  }

  // Module 2 specific fields (voice detection)
  if (moduleType === 'module2') {
    formatted.pitch = rawData.pitch || null;
    formatted.energy = rawData.energy || null;
    formatted.tempo = rawData.tempo || null;
    formatted.speechRate = rawData.speechRate || null;
    formatted.volume = rawData.volume || null;
    formatted.pauseFrequency = rawData.pauseFrequency || null;
  }

  return formatted;
}

/**
 * Process video frame for emotion detection (Module 1)
 * @param {string} imagePath - Path to image file or base64 data
 * @param {string} modulePath - Path to Python module
 * @returns {Promise<Object>} - Formatted emotion data
 */
async function detectEmotionsFromFrame(imagePath, modulePath) {
  const inputData = {
    image: imagePath,
    timestamp: new Date().toISOString()
  };

  return callPythonModule(modulePath, inputData, { moduleType: 'module1' });
}

/**
 * Process audio for emotion detection (Module 2)
 * @param {string} audioPath - Path to audio file or base64 data
 * @param {string} modulePath - Path to Python module
 * @returns {Promise<Object>} - Formatted emotion data
 */
async function detectEmotionsFromAudio(audioPath, modulePath) {
  const inputData = {
    audio: audioPath,
    timestamp: new Date().toISOString()
  };

  return callPythonModule(modulePath, inputData, { moduleType: 'module2' });
}

/**
 * Example: Real-time emotion detection from webcam
 * This can be called periodically during a lesson
 */
async function detectEmotionsRealTime(videoFrame, audioChunk, module1Path, module2Path) {
  const [module1Data, module2Data] = await Promise.all([
    detectEmotionsFromFrame(videoFrame, module1Path).catch(err => {
      console.error('Module 1 error:', err);
      return null;
    }),
    detectEmotionsFromAudio(audioChunk, module2Path).catch(err => {
      console.error('Module 2 error:', err);
      return null;
    })
  ]);

  return {
    module1Data,
    module2Data,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  callPythonModule,
  formatEmotionData,
  detectEmotionsFromFrame,
  detectEmotionsFromAudio,
  detectEmotionsRealTime
};


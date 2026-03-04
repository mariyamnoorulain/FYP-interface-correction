import { Brain, Eye, Lock, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function AIExplainability() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg border border-gray-200 p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">How the AI Works (Explainability)</h3>
            <p className="text-sm text-gray-600">Understanding the emotion detection system</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Detection Process */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Facial Landmark Detection</h4>
              </div>
              <p className="text-sm text-gray-700">
                Facial landmarks are detected using Convolutional Neural Networks (CNN) 
                to identify key facial features in real-time.
              </p>
            </div>

            {/* Emotion Classification */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Emotion Classification</h4>
              </div>
              <p className="text-sm text-gray-700">
                Emotions are classified into 5 main categories: Focus, Confusion, 
                Frustration, Engagement, and Disengagement using deep learning models.
              </p>
            </div>

            {/* Adaptive Response */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-gray-900">Content Adaptation</h4>
              </div>
              <p className="text-sm text-gray-700">
                Emotion scores influence content pacing, video replay suggestions, 
                and tutor recommendations to optimize learning effectiveness.
              </p>
            </div>

            {/* Privacy */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Privacy Protection</h4>
              </div>
              <p className="text-sm text-gray-700">
                No video is stored permanently. Only emotion scores and metadata 
                are saved. All processing happens in real-time with privacy-first design.
              </p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Technical Architecture</h4>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li><strong>Module 1:</strong> Face detection using MediaPipe/OpenCV with CNN-based emotion recognition</li>
              <li><strong>Module 2:</strong> Voice analysis for additional emotion context (pitch, energy, tempo)</li>
              <li><strong>Fusion:</strong> Weighted combination of both modules for improved accuracy</li>
              <li><strong>Real-time Processing:</strong> Analysis every 2-5 seconds during active learning sessions</li>
              <li><strong>Adaptive Engine:</strong> Rule-based + ML recommendations based on emotion patterns</li>
            </ul>
          </div>

          {/* Research Justification */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>Research Basis:</strong> This system implements emotion-aware adaptive learning 
              based on established research showing that emotional states significantly impact learning 
              effectiveness. The system adapts content delivery in real-time to optimize student 
              engagement and comprehension.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


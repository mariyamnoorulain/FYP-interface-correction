import { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, TrendingUp, TrendingDown, Brain } from 'lucide-react';

interface EmotionDetectorProps {
  bookingId: string;
  classroomId?: string;
  onEmotionDetected?: (emotion: any) => void;
  onRecommendation?: (recommendation: any) => void;
  isTutor?: boolean;
}

interface EmotionData {
  dominantEmotion: string;
  confidence: number;
  engagement: number;
  timestamp: string;
}

interface Recommendation {
  recommendation: string;
  reason: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export default function EmotionDetector({ 
  bookingId, 
  classroomId,
  onEmotionDetected,
  onRecommendation,
  isTutor = false
}: EmotionDetectorProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  const [averageEngagement, setAverageEngagement] = useState<number>(50);
  const [engagementLevel, setEngagementLevel] = useState<string>('medium');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [latestRecommendation, setLatestRecommendation] = useState<Recommendation | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataSubmissionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock emotion detection modules (replace with your actual modules)
  const module1Ref = useRef<any>(null); // Face detection module
  const module2Ref = useRef<any>(null); // Voice detection module

  useEffect(() => {
    // Initialize emotion tracking when component mounts
    startTracking();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (dataSubmissionIntervalRef.current) {
        clearInterval(dataSubmissionIntervalRef.current);
      }
      stopTracking();
    };
  }, [bookingId]);

  // Start emotion tracking session
  const startTracking = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, emotion tracking requires authentication');
        return;
      }

      const response = await fetch('http://localhost:5000/api/emotions/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId })
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setIsTracking(true);

        // Start periodic data submission (every 3 seconds)
        dataSubmissionIntervalRef.current = setInterval(() => {
          submitEmotionData(data.sessionId);
        }, 3000);

        // Check for recommendations every 10 seconds
        intervalRef.current = setInterval(() => {
          checkRecommendations(data.sessionId);
        }, 10000);
      } else {
        console.error('Failed to start emotion tracking:', await response.json());
      }
    } catch (error) {
      console.error('Error starting emotion tracking:', error);
    }
  };

  // Get mock emotion data (replace with actual module calls)
  const getMockEmotionData = () => {
    // This is a mock - replace with actual module1.getEmotionData() and module2.getEmotionData()
    const module1Data = {
      happiness: Math.random() * 0.5 + 0.3,
      sadness: Math.random() * 0.2,
      anger: Math.random() * 0.1,
      neutral: Math.random() * 0.3,
      faceDetected: true,
      boundingBox: { x: 100, y: 150, width: 200, height: 250 },
      confidence: 0.85 + Math.random() * 0.1
    };

    const module2Data = {
      happiness: Math.random() * 0.5 + 0.2,
      engagement: Math.random() * 0.4 + 0.4,
      boredom: Math.random() * 0.2,
      confidence: 0.80 + Math.random() * 0.15
    };

    return { module1Data, module2Data };
  };

  // Submit emotion data from both modules
  const submitEmotionData = async (sessionIdToUse: string) => {
    if (!sessionIdToUse) return;

    try {
      // Get data from your modules (replace with actual module calls)
      const { module1Data, module2Data } = getMockEmotionData();

      // In production, replace with:
      // const module1Data = module1Ref.current?.getEmotionData?.() || null;
      // const module2Data = module2Ref.current?.getEmotionData?.() || null;

      if (!module1Data && !module2Data) {
        return; // No data available yet
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/emotions/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: sessionIdToUse,
          module1Data: module1Data || null,
          module2Data: module2Data || null,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update current emotion state
        if (data.emotionData) {
          setCurrentEmotion(data.emotionData);
          setAverageEngagement(data.sessionMetrics?.averageEngagement || 50);
          setEngagementLevel(data.sessionMetrics?.engagementLevel || 'medium');
        }

        // Notify parent component
        if (onEmotionDetected && data.emotionData) {
          onEmotionDetected(data.emotionData);
        }

        // Handle recommendations
        if (data.recommendation) {
          setLatestRecommendation(data.recommendation);
          setShowRecommendation(true);
          
          if (onRecommendation) {
            onRecommendation(data.recommendation);
          }

          // Auto-hide recommendation after 10 seconds
          setTimeout(() => {
            setShowRecommendation(false);
          }, 10000);
        }
      }
    } catch (error) {
      console.error('Failed to submit emotion data:', error);
    }
  };

  // Check for recommendations
  const checkRecommendations = async (sessionIdToUse: string) => {
    if (!sessionIdToUse || !isTutor) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/emotions/session/${sessionIdToUse}/recommendations`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
          
          // Show high priority recommendations
          const highPriorityRec = data.recommendations.find(
            (r: Recommendation) => r.priority === 'high'
          );
          if (highPriorityRec) {
            setLatestRecommendation(highPriorityRec);
            setShowRecommendation(true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check recommendations:', error);
    }
  };

  // Stop emotion tracking
  const stopTracking = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (dataSubmissionIntervalRef.current) {
      clearInterval(dataSubmissionIntervalRef.current);
    }

    if (sessionId) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/emotions/session/${sessionId}/end`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Failed to end emotion tracking:', error);
      }
    }

    setIsTracking(false);
  };

  // Mark recommendation as implemented
  const markRecommendationImplemented = async (recId: string) => {
    if (!sessionId) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(
        `http://localhost:5000/api/emotions/session/${sessionId}/recommendation/${recId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Remove from recommendations list
      setRecommendations(prev => prev.filter(r => (r as any)._id !== recId));
    } catch (error) {
      console.error('Failed to mark recommendation as implemented:', error);
    }
  };

  const getEngagementColor = () => {
    if (averageEngagement >= 70) return 'text-green-600';
    if (averageEngagement >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEngagementIcon = () => {
    if (averageEngagement >= 70) return <TrendingUp className="w-5 h-5" />;
    if (averageEngagement >= 50) return <Brain className="w-5 h-5" />;
    return <TrendingDown className="w-5 h-5" />;
  };

  if (!isTracking) {
    return null; // Don't show UI if not tracking
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3">
      {/* Engagement Meter */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Engagement</span>
          {getEngagementIcon()}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                averageEngagement >= 70
                  ? 'bg-green-500'
                  : averageEngagement >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${averageEngagement}%` }}
            />
          </div>
          <span className={`text-sm font-bold ${getEngagementColor()}`}>
            {Math.round(averageEngagement)}%
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1 capitalize">
          {engagementLevel.replace('_', ' ')}
        </div>
      </div>

      {/* Current Emotion */}
      {currentEmotion && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[200px]">
          <div className="text-sm font-medium text-gray-600 mb-2">Current Emotion</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold capitalize text-teal-600">
              {currentEmotion.dominantEmotion}
            </span>
            <span className="text-xs text-gray-500">
              ({Math.round(currentEmotion.confidence * 100)}%)
            </span>
          </div>
        </div>
      )}

      {/* Recommendation Alert (for tutors) */}
      {isTutor && showRecommendation && latestRecommendation && (
        <div
          className={`bg-white rounded-lg shadow-xl border-2 p-4 min-w-[280px] ${
            latestRecommendation.priority === 'high'
              ? 'border-red-500'
              : latestRecommendation.priority === 'medium'
              ? 'border-yellow-500'
              : 'border-blue-500'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`${
                latestRecommendation.priority === 'high'
                  ? 'text-red-600'
                  : latestRecommendation.priority === 'medium'
                  ? 'text-yellow-600'
                  : 'text-blue-600'
              }`}
            >
              {latestRecommendation.priority === 'high' ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <Brain className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 mb-1">
                {latestRecommendation.recommendation}
              </div>
              <div className="text-sm text-gray-600 mb-2">{latestRecommendation.reason}</div>
              <div className="text-xs text-gray-500 capitalize">
                Suggested: {latestRecommendation.action.replace('_', ' ')}
              </div>
            </div>
            <button
              onClick={() => setShowRecommendation(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Recommendations List (for tutors) */}
      {isTutor && recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-h-[300px] overflow-y-auto">
          <div className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-teal-600" />
            Recommendations
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-2 bg-gray-50 rounded border border-gray-200 text-sm"
              >
                <div className="font-semibold text-gray-800">{rec.recommendation}</div>
                <div className="text-xs text-gray-600 mt-1">{rec.reason}</div>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      rec.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {rec.priority} priority
                  </span>
                  <button
                    onClick={() => markRecommendationImplemented((rec as any)._id || idx.toString())}
                    className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


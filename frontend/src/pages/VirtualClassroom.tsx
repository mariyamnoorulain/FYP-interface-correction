
import { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Monitor, X, AlertCircle, CheckCircle, Brain } from 'lucide-react';
import EmotionDetector from '../components/EmotionDetector';
import type { Page } from '../types';

interface VirtualClassroomProps {
  bookingId: string;
  onNavigate: (page: Page) => void;
  onEndLesson?: () => void;
}

export default function VirtualClassroom({ bookingId, onNavigate, onEndLesson }: VirtualClassroomProps) {
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [latestRecommendation, setLatestRecommendation] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isTutor = user.role === 'tutor';

  useEffect(() => {
    loadClassroom();
    return () => {
      // Cleanup
    };
  }, [bookingId]);

  const loadClassroom = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/classrooms/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClassroom(data);
        
        // Get emotion session ID
        const emotionResponse = await fetch(
          `http://localhost:5000/api/emotions/session?bookingId=${bookingId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (emotionResponse.ok) {
          const emotionData = await emotionResponse.json();
          if (emotionData.sessionId) {
            setSessionId(emotionData.sessionId);
          }
        }

        // Initialize Daily.co video (if using Daily.co)
        // For now, we'll use a placeholder video element
        if (videoRef.current && data.dailyRoomUrl) {
          // In production, initialize Daily.co video here
          // const daily = await DailyIframe.createFrame(videoRef.current, {
          //   showLeaveButton: true,
          //   iframeStyle: { width: '100%', height: '100%' }
          // });
          // await daily.join({ url: data.dailyRoomUrl, token: data.dailyRoomToken });
        }
      }
    } catch (error) {
      console.error('Error loading classroom:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndLesson = async () => {
    if (!classroom) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/classrooms/${classroom._id}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (onEndLesson) {
        onEndLesson();
      } else {
        onNavigate('studentDashboard');
      }
    } catch (error) {
      console.error('Error ending lesson:', error);
    }
  };

  const handleRecommendation = (recommendation: any) => {
    setLatestRecommendation(recommendation);
    setShowRecommendation(true);
    setRecommendations(prev => [...prev, recommendation]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading classroom...</p>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <p className="mb-4">Classroom not found</p>
          <button
            onClick={() => onNavigate('studentDashboard')}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Video Container */}
      <div className="h-screen flex flex-col">
        {/* Main Video Area */}
        <div className="flex-1 relative bg-black">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Video className="w-24 h-24 mx-auto mb-4 opacity-50" />
              <p className="text-xl">Video Classroom</p>
              <p className="text-sm text-gray-400 mt-2">
                {classroom.dailyRoomUrl ? 'Connecting to video room...' : 'Video room URL not available'}
              </p>
              {/* In production, Daily.co video frame would be rendered here */}
              <div ref={videoRef} className="w-full h-full" />
            </div>
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/70 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-4">
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition ${
                  isVideoOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
                }`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsAudioOn(!isAudioOn)}
                className={`p-3 rounded-full transition ${
                  isAudioOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
                }`}
              >
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-3 rounded-full transition ${
                  isScreenSharing ? 'bg-teal-600 text-white' : 'bg-gray-700 text-white'
                }`}
              >
                <Monitor className="w-5 h-5" />
              </button>
              <div className="w-px h-8 bg-gray-600" />
              <button
                onClick={handleEndLesson}
                className="px-6 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition"
              >
                End Lesson
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emotion Detector Component */}
      {sessionId && (
        <EmotionDetector
          bookingId={bookingId}
          classroomId={classroom._id}
          isTutor={isTutor}
          onRecommendation={handleRecommendation}
        />
      )}

      {/* Recommendation Alert (for tutors) */}
      {isTutor && showRecommendation && latestRecommendation && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div
            className={`bg-white rounded-lg shadow-2xl border-2 p-4 ${
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
                  Suggested action: {latestRecommendation.action.replace('_', ' ')}
                </div>
              </div>
              <button
                onClick={() => setShowRecommendation(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


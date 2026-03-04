import { TrendingUp, TrendingDown, Brain, AlertCircle, RefreshCw, User } from 'lucide-react';

interface AILearningSnapshotProps {
  courseCompletion: number;
  emotionalEngagement: {
    engaged: number;
    confused: number;
    disengaged: number;
  };
  aiAdaptations: {
    contentSlowed: number;
    videoReplaySuggested: number;
    tutorRecommended: number;
  };
  performanceTrend: 'improving' | 'declining' | 'stable';
  performanceChange: number;
}

export default function AILearningSnapshot({
  courseCompletion,
  emotionalEngagement,
  aiAdaptations,
  performanceTrend,
  performanceChange
}: AILearningSnapshotProps) {
  const getTrendIcon = () => {
    if (performanceTrend === 'improving') {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    } else if (performanceTrend === 'declining') {
      return <TrendingDown className="w-5 h-5 text-red-600" />;
    }
    return <Brain className="w-5 h-5 text-blue-600" />;
  };

  const getTrendColor = () => {
    if (performanceTrend === 'improving') return 'text-green-600';
    if (performanceTrend === 'declining') return 'text-red-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">AI Learning Snapshot</h2>
        <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
          Real-time AI Analysis
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Learning Progress */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">AI Tracked</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{courseCompletion}%</div>
          <div className="text-sm text-gray-600 mb-3">Course Completion</div>
          <div className="text-xs text-gray-500 italic">
            Based on watched video segments
          </div>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${courseCompletion}%` }}
            />
          </div>
        </div>

        {/* 2. Emotional Engagement (AI) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-xs text-gray-500 bg-teal-50 px-2 py-1 rounded">AI Detected</span>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">😊</span>
                <span className="text-sm text-gray-700">Engaged</span>
              </div>
              <span className="text-lg font-bold text-green-600">{emotionalEngagement.engaged}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">😐</span>
                <span className="text-sm text-gray-700">Confused</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{emotionalEngagement.confused}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">😴</span>
                <span className="text-sm text-gray-700">Disengaged</span>
              </div>
              <span className="text-lg font-bold text-red-600">{emotionalEngagement.disengaged}%</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 italic mt-2">
            Detected via facial expression analysis
          </div>
        </div>

        {/* 3. AI Adaptation Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">AI Actions</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span className="text-sm text-gray-700">Content slowed</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{aiAdaptations.contentSlowed}x</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔁</span>
                <span className="text-sm text-gray-700">Video replay</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{aiAdaptations.videoReplaySuggested}x</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧠</span>
                <span className="text-sm text-gray-700">Tutor recommended</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{aiAdaptations.tutorRecommended}x</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 italic mt-2">
            System adaptations based on emotions
          </div>
        </div>

        {/* 4. Performance Trend */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              {getTrendIcon()}
            </div>
            <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded">AI Linked</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {getTrendIcon()}
            <span className={`text-2xl font-bold ${getTrendColor()}`}>
              {performanceTrend === 'improving' ? '↑' : performanceTrend === 'declining' ? '↓' : '→'}
            </span>
            <span className={`text-xl font-bold ${getTrendColor()}`}>
              {performanceTrend === 'improving' ? 'Improving' : performanceTrend === 'declining' ? 'Declining' : 'Stable'}
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-1">
            {Math.abs(performanceChange)}% change
          </div>
          <div className="text-xs text-gray-500 italic">
            Linked to emotional stability
          </div>
        </div>
      </div>
    </div>
  );
}


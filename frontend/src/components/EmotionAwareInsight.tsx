import { Brain, TrendingDown, AlertCircle, Lightbulb } from 'lucide-react';

interface EmotionAwareInsightProps {
  insight: string;
  emotionData?: {
    confusion: number;
    frustration: number;
    engagement: number;
  };
}

export default function EmotionAwareInsight({ insight, emotionData }: EmotionAwareInsightProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl shadow-lg border-2 border-blue-200 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Learning Insight</h3>
          </div>
          <p className="text-gray-700 mb-3 leading-relaxed">{insight}</p>
          
          {emotionData && (
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-blue-200">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-semibold text-gray-600">Confusion</span>
                </div>
                <div className="text-lg font-bold text-yellow-600">{emotionData.confusion}%</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-semibold text-gray-600">Frustration</span>
                </div>
                <div className="text-lg font-bold text-red-600">{emotionData.frustration}%</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Brain className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-gray-600">Engagement</span>
                </div>
                <div className="text-lg font-bold text-green-600">{emotionData.engagement}%</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


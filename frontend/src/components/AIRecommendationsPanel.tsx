import { Brain, CheckCircle, AlertCircle, RefreshCw, User, Video } from 'lucide-react';
import { useState } from 'react';

interface Recommendation {
  id: string;
  type: 'content' | 'pacing' | 'tutor' | 'session';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reason: string;
  action: string;
  timestamp: string;
  implemented?: boolean;
}

interface AIRecommendationsPanelProps {
  recommendations: Recommendation[];
  onMarkImplemented?: (id: string) => void;
}

export default function AIRecommendationsPanel({ 
  recommendations, 
  onMarkImplemented 
}: AIRecommendationsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredRecs = filter === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.priority === filter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content': return <Video className="w-5 h-5" />;
      case 'pacing': return <RefreshCw className="w-5 h-5" />;
      case 'tutor': return <User className="w-5 h-5" />;
      case 'session': return <Brain className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Recommendations for You</h3>
            <p className="text-sm text-gray-500">Personalized adaptive learning suggestions</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({recommendations.length})
        </button>
        <button
          onClick={() => setFilter('high')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'high' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          High ({recommendations.filter(r => r.priority === 'high').length})
        </button>
        <button
          onClick={() => setFilter('medium')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'medium' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Medium ({recommendations.filter(r => r.priority === 'medium').length})
        </button>
        <button
          onClick={() => setFilter('low')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'low' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Low ({recommendations.filter(r => r.priority === 'low').length})
        </button>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recommendations match the selected filter.</p>
          </div>
        ) : (
          filteredRecs.map((rec) => (
            <div
              key={rec.id}
              className={`p-5 rounded-lg border-2 transition ${
                rec.implemented
                  ? 'bg-gray-50 border-gray-200 opacity-75'
                  : getPriorityColor(rec.priority)
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${
                    rec.implemented ? 'bg-gray-200' : 'bg-white'
                  }`}>
                    {getTypeIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-gray-900">{rec.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {rec.reason}
                      </span>
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Suggested: {rec.action}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(rec.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                {!rec.implemented && onMarkImplemented && (
                  <button
                    onClick={() => onMarkImplemented(rec.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Done
                  </button>
                )}
                {rec.implemented && (
                  <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg flex items-center gap-2 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Implemented
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900">
          <strong>💡 How it works:</strong> These recommendations are generated in real-time based on 
          emotion detection during your learning sessions. The AI analyzes your facial expressions 
          and learning patterns to suggest personalized adaptations.
        </p>
      </div>
    </div>
  );
}


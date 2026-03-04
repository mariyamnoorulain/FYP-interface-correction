import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Brain, Info } from 'lucide-react';
import { useState } from 'react';

interface EmotionDataPoint {
  timestamp: string;
  focus: number;
  confusion: number;
  frustration: number;
  engagement: number;
  sessionId?: string;
}

interface EmotionTimelineProps {
  data: EmotionDataPoint[];
  videoTimeline?: boolean;
}

export default function EmotionTimeline({ data, videoTimeline = false }: EmotionTimelineProps) {
  const [showInfo, setShowInfo] = useState(false);

  // Transform data for chart
  const chartData = data.map((point, index) => ({
    time: videoTimeline ? `Min ${index + 1}` : new Date(point.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    Focus: point.focus,
    Confusion: point.confusion,
    Frustration: point.frustration,
    Engagement: point.engagement
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Emotion vs Learning Timeline</h3>
            <p className="text-sm text-gray-500">
              {videoTimeline ? 'Video Timeline' : 'Session Timeline'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          title="How it works"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {showInfo && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>How it works:</strong> This timeline visualizes emotions detected during learning sessions 
            using facial expression analysis. The AI model processes video frames in real-time to identify 
            emotional states that correlate with learning effectiveness.
          </p>
        </div>
      )}

      <div className="mb-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              domain={[0, 100]}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: 'Emotion Score (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Focus" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Focus (Green)"
            />
            <Line 
              type="monotone" 
              dataKey="Confusion" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Confusion (Yellow)"
            />
            <Line 
              type="monotone" 
              dataKey="Frustration" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Frustration (Red)"
            />
            <Line 
              type="monotone" 
              dataKey="Engagement" 
              stroke="#3b82f6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              name="Overall Engagement"
            />
            <ReferenceLine y={50} stroke="#9ca3af" strokeDasharray="3 3" label="Baseline" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 italic">
          💡 <strong>Caption:</strong> Detected emotions during learning sessions using facial expression analysis. 
          Green indicates focus, yellow indicates confusion, and red indicates frustration. 
          The dashed line shows overall engagement levels.
        </p>
      </div>

      {/* Color Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">Focus - Positive learning state</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">Confusion - May need clarification</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-600">Frustration - Intervention recommended</span>
        </div>
      </div>
    </div>
  );
}


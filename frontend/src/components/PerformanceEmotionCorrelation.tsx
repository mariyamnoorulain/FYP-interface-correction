import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Brain, Award, AlertCircle } from 'lucide-react';

interface PerformanceData {
  session: string;
  quizScore: number;
  completionRate: number;
  engagement: number;
  confusion: number;
}

interface PerformanceEmotionCorrelationProps {
  performanceData: PerformanceData[];
  insights: string[];
}

export default function PerformanceEmotionCorrelation({ 
  performanceData, 
  insights 
}: PerformanceEmotionCorrelationProps) {
  // Calculate correlation insights
  const avgEngagement = performanceData.reduce((sum, d) => sum + d.engagement, 0) / performanceData.length;
  const avgConfusion = performanceData.reduce((sum, d) => sum + d.confusion, 0) / performanceData.length;
  const avgQuizScore = performanceData.reduce((sum, d) => sum + d.quizScore, 0) / performanceData.length;

  // Prepare chart data
  const chartData = performanceData.map(d => ({
    session: d.session,
    'Quiz Score': d.quizScore,
    'Completion Rate': d.completionRate,
    'Engagement': d.engagement,
    'Confusion': d.confusion
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* A. Academic Performance */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Academic Performance</h3>
            <p className="text-sm text-gray-500">Learning metrics over time</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{avgQuizScore.toFixed(0)}%</div>
            <div className="text-xs text-gray-600 mt-1">Avg Quiz Score</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {performanceData.reduce((sum, d) => sum + d.completionRate, 0) / performanceData.length}%
            </div>
            <div className="text-xs text-gray-600 mt-1">Completion Rate</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {performanceData.length > 0 ? 
                ((performanceData[performanceData.length - 1].quizScore - performanceData[0].quizScore) / performanceData[0].quizScore * 100).toFixed(0) 
                : 0}%
            </div>
            <div className="text-xs text-gray-600 mt-1">Improvement</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="session" stroke="#6b7280" style={{ fontSize: '11px' }} />
            <YAxis domain={[0, 100]} stroke="#6b7280" style={{ fontSize: '11px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="Quiz Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Completion Rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* B. Emotion Correlation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Emotion Correlation</h3>
            <p className="text-sm text-gray-500">How emotions affect performance</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-900">High Confusion → Lower Quiz Score</span>
            </div>
            <p className="text-xs text-red-700">
              Sessions with confusion above {avgConfusion.toFixed(0)}% showed {((100 - avgQuizScore) / 10).toFixed(0)}% lower average scores.
            </p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-900">High Engagement → Faster Completion</span>
            </div>
            <p className="text-xs text-green-700">
              Sessions with engagement above {avgEngagement.toFixed(0)}% showed improved completion rates.
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="session" stroke="#6b7280" style={{ fontSize: '11px' }} />
            <YAxis domain={[0, 100]} stroke="#6b7280" style={{ fontSize: '11px' }} />
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
              dataKey="Engagement" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Engagement"
            />
            <Line 
              type="monotone" 
              dataKey="Confusion" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Confusion"
            />
            <Line 
              type="monotone" 
              dataKey="Quiz Score" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Quiz Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI-Generated Insights */}
      {insights.length > 0 && (
        <div className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">AI-Generated Insights</h3>
          </div>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Brain, Smile, Frown, Meh } from 'lucide-react';

interface EmotionAnalyticsProps {
  studentId?: string;
  tutorId?: string;
  startDate?: string;
  endDate?: string;
}

interface AnalyticsData {
  totalSessions: number;
  averageEngagement: number;
  engagementTrend: Array<{
    date: string;
    engagement: number;
    level: string;
  }>;
  dominantEmotions: Array<{
    emotion: string;
    percentage: number;
  }>;
  recentSessions: Array<{
    id: string;
    date: string;
    engagement: number;
    feedbackScore: number;
    duration: number;
  }>;
}

const COLORS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1'];

export default function EmotionAnalytics({ studentId, tutorId, startDate, endDate }: EmotionAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [studentId, tutorId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      let userId = studentId || tutorId;
      if (!userId) {
        // Get current user
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) return;
        userId = user.id;
      }

      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/emotions/analytics/${studentId ? 'student' : 'tutor'}/${userId}?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  // Prepare chart data
  const engagementChartData = analytics.engagementTrend.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    engagement: item.engagement,
    level: item.level
  }));

  const emotionChartData = analytics.dominantEmotions.map(item => ({
    name: item.emotion.charAt(0).toUpperCase() + item.emotion.slice(1),
    value: Math.round(item.percentage)
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-sm text-gray-500">Total Sessions</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{analytics.totalSessions}</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Avg Engagement</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {Math.round(analytics.averageEngagement)}%
          </div>
          <div className="mt-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  analytics.averageEngagement >= 70
                    ? 'bg-green-500'
                    : analytics.averageEngagement >= 50
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${analytics.averageEngagement}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Smile className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Top Emotion</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 capitalize">
            {analytics.dominantEmotions[0]?.emotion || 'N/A'}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {analytics.dominantEmotions[0]?.percentage.toFixed(1)}% of time
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Engagement Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#14b8a6"
                strokeWidth={2}
                name="Engagement %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Dominant Emotions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Emotion Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emotionChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {emotionChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Sessions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Engagement</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Feedback Score</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentSessions.map((session) => (
                <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {new Date(session.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                        <div
                          className={`h-2 rounded-full ${
                            session.engagement >= 70
                              ? 'bg-green-500'
                              : session.engagement >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${session.engagement}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{Math.round(session.engagement)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < session.feedbackScore ? 'bg-teal-600' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">{session.feedbackScore}/10</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {Math.round(session.duration / 60)} min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emotion Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Emotion Breakdown</h3>
        <div className="space-y-3">
          {analytics.dominantEmotions.map((emotion, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                {emotion.emotion}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="h-4 rounded-full flex items-center justify-end pr-2"
                  style={{
                    width: `${emotion.percentage}%`,
                    backgroundColor: COLORS[idx % COLORS.length]
                  }}
                >
                  <span className="text-xs font-semibold text-white">
                    {emotion.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


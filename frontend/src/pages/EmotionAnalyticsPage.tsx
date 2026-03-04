import { useState, useEffect } from 'react';
import { Calendar, Filter, Download, TrendingUp, Brain, Smile } from 'lucide-react';
import EmotionAnalytics from '../components/EmotionAnalytics';
import type { Page } from '../types';

interface EmotionAnalyticsPageProps {
  onNavigate: (page: Page) => void;
}

export default function EmotionAnalyticsPage({ onNavigate }: EmotionAnalyticsPageProps) {
  const [user, setUser] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  // Set default date range (last month)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const handleExport = () => {
    // Export analytics data (implement CSV/PDF export)
    alert('Export functionality coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Emotion Analytics</h1>
              <p className="text-gray-600">
                Track engagement and emotions across all your learning sessions
              </p>
            </div>
            <button
              onClick={handleExport}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Report
            </button>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Component */}
        <EmotionAnalytics
          studentId={user?.role === 'student' ? user.id : undefined}
          tutorId={user?.role === 'tutor' ? user.id : undefined}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
}


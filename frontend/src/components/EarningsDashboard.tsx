import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Award } from 'lucide-react';

interface EarningsData {
  totalEarnings: number;
  totalLessons: number;
  averageEarnings: number;
  monthlyEarnings: Record<string, number>;
  recentBookings: Array<{
    _id: string;
    studentId: { name: string };
    date: string;
    price: number;
    status: string;
  }>;
}

export default function EarningsDashboard() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');

  useEffect(() => {
    loadEarnings();
  }, [period]);

  const loadEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5000/api/tutors/earnings/me';
      
      const now = new Date();
      let startDate: string;
      
      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      } else {
        startDate = new Date(2020, 0, 1).toISOString();
      }
      
      const endDate = now.toISOString();
      url += `?startDate=${startDate}&endDate=${endDate}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEarnings(data);
      }
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings...</p>
        </div>
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-600">No earnings data available</p>
      </div>
    );
  }

  const monthlyData = Object.entries(earnings.monthlyEarnings)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex gap-2">
          {['month', 'year', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === p
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-green-100 text-sm mb-1">Total Earnings</p>
          <p className="text-3xl font-bold">${earnings.totalEarnings.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Lessons</p>
          <p className="text-3xl font-bold">{earnings.totalLessons}</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-purple-100 text-sm mb-1">Average per Lesson</p>
          <p className="text-3xl font-bold">${earnings.averageEarnings.toFixed(2)}</p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Monthly Earnings</h2>
        <div className="space-y-4">
          {monthlyData.length === 0 ? (
            <p className="text-gray-500">No earnings data for this period</p>
          ) : (
            monthlyData.map(([month, amount]) => (
              <div key={month}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">
                    {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <span className="text-lg font-bold text-teal-600">${amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(amount / Math.max(...monthlyData.map(([, a]) => a))) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Earnings</h2>
        {earnings.recentBookings.length === 0 ? (
          <p className="text-gray-500">No recent bookings</p>
        ) : (
          <div className="space-y-3">
            {earnings.recentBookings.map((booking) => (
              <div
                key={booking._id}
                className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{booking.studentId.name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+${booking.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{booking.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




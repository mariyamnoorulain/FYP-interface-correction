import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Booking {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'trial' | 'regular';
  price: number;
  notes: string;
}

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?status=${filter}` : '';
      
      const response = await fetch(`http://localhost:5000/api/bookings/tutor/me${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        loadBookings();
      } else {
        alert('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const upcomingBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    return bookingDate >= new Date() && b.status !== 'cancelled';
  });

  const pastBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    return bookingDate < new Date() || b.status === 'completed';
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-teal-600" />
          Upcoming Bookings ({upcomingBookings.length})
        </h2>
        
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming bookings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div
                key={booking._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="font-bold text-lg">{booking.studentId.name}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                      {booking.type === 'trial' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          Trial
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="font-semibold text-teal-600">
                        ${booking.price}
                      </div>
                    </div>
                    {booking.notes && (
                      <p className="mt-2 text-sm text-gray-600">{booking.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'completed')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Past Bookings ({pastBookings.length})</h2>
        
        {pastBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No past bookings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastBookings.slice(0, 10).map((booking) => (
              <div
                key={booking._id}
                className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
              >
                <div>
                  <span className="font-semibold">{booking.studentId.name}</span>
                  <span className="text-sm text-gray-600 ml-4">
                    {new Date(booking.date).toLocaleDateString()} • {booking.startTime}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




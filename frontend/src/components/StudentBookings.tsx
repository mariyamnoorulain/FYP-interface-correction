import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, Star, MessageSquare } from 'lucide-react';

interface Booking {
  _id: string;
  tutorId: {
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
  meetingLink?: string;
}

export default function StudentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?status=${filter}` : '';
      
      const response = await fetch(`http://localhost:5000/api/bookings/student/me${params}`, {
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

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        loadBookings();
      } else {
        alert('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const submitReview = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId,
          rating: reviewRating,
          comment: reviewComment
        })
      });

      if (response.ok) {
        alert('Review submitted successfully!');
        setSelectedBooking(null);
        setReviewRating(5);
        setReviewComment('');
        loadBookings();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
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
          Upcoming Lessons ({upcomingBookings.length})
        </h2>
        
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming lessons</p>
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
                      <span className="font-bold text-lg">{booking.tutorId.name}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
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
                    {booking.meetingLink && (
                      <a
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Join Lesson
                      </a>
                    )}
                  </div>
                  {booking.status === 'pending' || booking.status === 'confirmed' ? (
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Past Lessons ({pastBookings.length})</h2>
        
        {pastBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No past lessons</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <div
                key={booking._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold">{booking.tutorId.name}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.date).toLocaleDateString()} • {booking.startTime}
                    </p>
                  </div>
                  {booking.status === 'completed' && (
                    <button
                      onClick={() => setSelectedBooking(booking._id)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm flex items-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Leave a Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setReviewRating(rating)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        rating <= reviewRating
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      <Star className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => submitReview(selectedBooking)}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    setReviewComment('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




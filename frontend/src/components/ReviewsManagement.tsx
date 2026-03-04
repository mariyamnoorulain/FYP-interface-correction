import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';

interface Review {
  _id: string;
  studentId: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  tutorResponse?: string;
  bookingId: string;
}

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`http://localhost:5000/api/reviews/tutor/${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async (reviewId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ response })
      });

      if (response.ok) {
        loadReviews();
        setSelectedReview(null);
        setResponse('');
        alert('Response submitted successfully!');
      } else {
        alert('Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response');
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
      : 0
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Star className="w-6 h-6 text-teal-600" />
            Reviews & Ratings
          </h2>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-gray-800">{averageRating.toFixed(1)}</span>
              <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-gray-600">{reviews.length} total reviews</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-20">
                <span className="text-sm font-medium">{rating}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">All Reviews</h3>
        
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-teal-600">
                          {review.studentId.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{review.studentId.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>

                {/* Tutor Response */}
                {review.tutorResponse ? (
                  <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <p className="text-sm font-semibold text-teal-600 mb-1">Your Response:</p>
                    <p className="text-gray-700">{review.tutorResponse}</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    {selectedReview === review._id ? (
                      <div className="space-y-2">
                        <textarea
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          placeholder="Write a response to this review..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => submitResponse(review._id)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                          >
                            Submit Response
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReview(null);
                              setResponse('');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedReview(review._id)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Respond to Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




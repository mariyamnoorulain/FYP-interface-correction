import { Brain, Star, DollarSign, TrendingUp, User, ArrowRight } from 'lucide-react';

interface RecommendedTutor {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  bio: string;
  photo?: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  subjects: Array<{ name: string; price: number }>;
  aiMatchScore: number;
  matchReason: string;
  specialization: string;
}

interface AITutorRecommendationsProps {
  tutors: RecommendedTutor[];
  onViewProfile: (tutorId: string) => void;
  onBookSession: (tutorId: string) => void;
}

export default function AITutorRecommendations({ 
  tutors, 
  onViewProfile, 
  onBookSession 
}: AITutorRecommendationsProps) {
  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Recommended Tutors for You (AI-Based)</h2>
          </div>
          <p className="text-gray-600 text-sm ml-13">
            Based on detected confusion during recent learning sessions.
          </p>
        </div>
      </div>

      {tutors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No AI recommendations available yet</p>
          <p className="text-sm text-gray-500">
            Complete more learning sessions to get personalized tutor recommendations
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <div
              key={tutor._id}
              className="bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:border-teal-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* AI Match Badge */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-gray-700">AI Match</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchColor(tutor.aiMatchScore)}`}>
                    {tutor.aiMatchScore}%
                  </div>
                </div>
              </div>

              {/* Tutor Info */}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  {tutor.photo ? (
                    <img
                      src={tutor.photo}
                      alt={tutor.userId.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-teal-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center border-2 border-teal-200">
                      <User className="w-8 h-8 text-teal-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{tutor.userId.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{tutor.rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">({tutor.totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-teal-600 font-bold">
                      <DollarSign className="w-4 h-4" />
                      <span>${tutor.hourlyRate}</span>
                      <span className="text-sm text-gray-500 font-normal">/hr</span>
                    </div>
                  </div>
                </div>

                {/* Specialization */}
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Specializes in:</span>
                  <p className="text-sm font-medium text-gray-900 mt-1">{tutor.specialization}</p>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tutor.bio || 'Experienced tutor ready to help'}</p>

                {/* Match Reason */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-900">
                      <span className="font-semibold">Why matched:</span> {tutor.matchReason}
                    </p>
                  </div>
                </div>

                {/* Subjects */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tutor.subjects.slice(0, 2).map((subject, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-medium"
                    >
                      {subject.name}
                    </span>
                  ))}
                  {tutor.subjects.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{tutor.subjects.length - 2} more
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onBookSession(tutor.userId._id)}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold text-sm transition flex items-center justify-center gap-2"
                  >
                    Book Session
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onViewProfile(tutor.userId._id)}
                    className="px-4 py-2 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 font-semibold text-sm transition"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


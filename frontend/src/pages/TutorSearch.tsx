import { useState, useEffect } from 'react';
import { Search, Star, DollarSign, Clock, Globe, Filter, Users, ArrowRight, User } from 'lucide-react';
import type { Page } from '../types';
import Header from '../components/Header';

interface Tutor {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  bio: string;
  photo: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalLessons: number;
  responseRate: number;
  profileScore: number;
  subjects: Array<{ name: string; price: number }>;
  languages: string[];
}

interface TutorSearchProps {
  onNavigate: (page: Page) => void;
  onBack: () => void;
}

export default function TutorSearch({ onNavigate, onBack }: TutorSearchProps) {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    loadTutors();
  }, [searchTerm, selectedSubject, minRating, maxPrice]);

  const loadTutors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (minRating) params.append('minRating', minRating);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const response = await fetch(`http://localhost:5000/api/tutors?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTutors(data);
      }
    } catch (error) {
      console.error('Error loading tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (tutorId: string) => {
    // Store tutor ID and previous page for back navigation
    localStorage.setItem('selectedTutorId', tutorId);
    localStorage.setItem('previousPage', 'tutor'); // Store that we came from tutor listing
    onNavigate('tutorProfile');
  };

  const handleBackClick = () => {
    // Check if we came from dashboard or navigation
    const prevPage = localStorage.getItem('tutorSearchPreviousPage');
    const prevDashboard = localStorage.getItem('tutorSearchPreviousDashboard');
    
    if (prevDashboard && prevPage) {
      // Came from dashboard
      localStorage.removeItem('tutorSearchPreviousPage');
      localStorage.removeItem('tutorSearchPreviousDashboard');
      localStorage.setItem('currentPage', prevDashboard);
      localStorage.setItem('studentDashboardActiveTab', prevPage);
      onNavigate(prevDashboard as Page);
    } else {
      // Came from navigation (landing page) - go back to landing
      onNavigate('landing');
    }
  };

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('user') !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <Header currentPage="tutor" onNavigate={onNavigate} />
      
      {/* Hero Section - Similar to Courses page */}
      <section className="py-24 bg-gradient-to-r from-teal-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Find Expert Tutors</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto mb-10">
            Connect with experienced tutors from around the world. Learn one-on-one with personalized guidance.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tutors by name, subject, or expertise..."
                className="w-full pl-16 pr-6 py-5 rounded-full text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl"
              />
              <button 
                onClick={loadTutors}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white text-teal-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
              >
                Search
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-lg">
            <div>👨‍🏫 {tutors.length > 0 ? `${tutors.length}+` : '200+'} Expert Tutors</div>
            <div>🌍 Available Worldwide</div>
            <div>⭐ 4.8+ Average Rating</div>
            <div>📚 Multiple Subjects</div>
          </div>
        </div>
      </section>

      {/* Filters Section - Similar to Courses */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-6 py-3 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 transition flex items-center gap-2">
              <Filter className="w-5 h-5" />
              All Tutors
            </button>
            {['Math', 'English', 'Science', 'Programming', 'Business', 'Languages'].map((subject) => (
              <button 
                key={subject}
                onClick={() => {
                  if (selectedSubject === subject) {
                    setSelectedSubject('');
                  } else {
                    setSelectedSubject(subject);
                  }
                }}
                className={`px-6 py-3 rounded-full font-medium transition ${
                  selectedSubject === subject
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-teal-100 hover:text-teal-700'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Filters */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Subject</label>
                <input
                  type="text"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  placeholder="e.g., English, Math, Science"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Min Rating</label>
                <input
                  type="number"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  placeholder="0.0"
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Max Price ($/hr)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="100"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tutors Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading tutors...</p>
            </div>
          ) : tutors.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Tutors Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search filters or browse all tutors.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('');
                  setMinRating('');
                  setMaxPrice('');
                  loadTutors();
                }}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  {tutors.length} {tutors.length === 1 ? 'Tutor' : 'Tutors'} Found
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Sort by:</span>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                    <option>Highest Rated</option>
                    <option>Lowest Price</option>
                    <option>Most Reviews</option>
                    <option>Most Lessons</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tutors.map((tutor) => (
                  <div
                    key={tutor._id}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-4 transition-all duration-300 cursor-pointer"
                    onClick={() => handleViewProfile(tutor.userId._id)}
                  >
                    {/* Tutor Card Header */}
                    <div className="bg-gradient-to-br from-teal-500 to-blue-500 h-32 flex items-center justify-center relative">
                      {tutor.photo ? (
                        <img
                          src={tutor.photo}
                          alt={tutor.userId.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white shadow-lg flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">
                            {tutor.userId.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {tutor.profileScore >= 80 && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Tutor Card Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{tutor.userId.name}</h3>
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-900">{tutor.rating.toFixed(1)}</span>
                            <span className="text-gray-500 text-sm">({tutor.totalReviews} reviews)</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                        {tutor.bio || 'Experienced tutor ready to help you achieve your learning goals.'}
                      </p>

                      {/* Subjects */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tutor.subjects.slice(0, 3).map((subject, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium"
                          >
                            {subject.name}
                          </span>
                        ))}
                        {tutor.subjects.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            +{tutor.subjects.length - 3} more
                          </span>
                        )}
                        {tutor.subjects.length === 0 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            Multiple Subjects
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-teal-600" />
                          <span>{tutor.totalLessons} lessons</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <span>{tutor.responseRate}% response</span>
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-5 h-5 text-teal-600" />
                          <span className="text-2xl font-bold text-teal-600">${tutor.hourlyRate}</span>
                          <span className="text-gray-500 text-sm">/hr</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProfile(tutor.userId._id);
                          }}
                          className="px-6 py-2 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition flex items-center gap-2"
                        >
                          View Profile
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Languages */}
                      {tutor.languages && tutor.languages.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {tutor.languages.slice(0, 3).map((lang, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                              >
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              <div className="text-center mt-12">
                <button className="px-10 py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition">
                  Load More Tutors →
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Sign up now to book lessons with expert tutors and begin your learning journey.
          </p>
          {!isLoggedIn ? (
            <button
              onClick={() => onNavigate('signup')}
              className="px-12 py-6 bg-white text-teal-600 rounded-full font-bold text-2xl shadow-2xl hover:shadow-xl hover:scale-110 transition transform"
            >
              Get Started Free
            </button>
          ) : (
            <button
              onClick={() => {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.role === 'student') {
                  onNavigate('studentDashboard');
                } else {
                  onNavigate('tutorDashboard');
                }
              }}
              className="px-12 py-6 bg-white text-teal-600 rounded-full font-bold text-2xl shadow-2xl hover:shadow-xl hover:scale-110 transition transform"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

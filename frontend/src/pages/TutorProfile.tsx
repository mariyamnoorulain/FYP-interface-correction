import { useState, useEffect } from 'react';
import {
  Star, Clock, Globe, Video, Calendar, MessageSquare,
  DollarSign, Award, CheckCircle, LayoutDashboard,
  BookOpen, Search, Brain, Settings
} from 'lucide-react';
import type { Page } from '../types';
import { getUserId, getUserRole, getUserFromStorage } from '../utils/userHelper';
import DashboardLayout from '../components/DashboardLayout';

interface TutorProfileProps {
  tutorId: string;
  onNavigate: (page: Page) => void;
  onBack: () => void;
}

interface TutorProfileData {
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  bio: string;
  photo: string;
  introVideo: string;
  subjects: Array<{ name: string; price: number }>;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalLessons: number;
  responseRate: number;
  profileScore: number;
  languages: string[];
  certifications: Array<{ name: string; issuer: string; year: number }>;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  studentId: {
    name: string;
  };
  createdAt: string;
  tutorResponse?: string;
}

export default function TutorProfile({ tutorId, onNavigate, onBack }: TutorProfileProps) {
  const [tutor, setTutor] = useState<TutorProfileData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Check if user is logged in
  const user = getUserFromStorage();
  const isLoggedIn = !!user;

  // Define the menu items for the Student Sidebar (matching StudentDashboard)
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'findTutors', label: 'Find Tutors', icon: Search },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'emotionAnalytics', label: 'Emotion Analytics', icon: Brain },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'reviews', label: 'My Reviews', icon: Star },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  const handleTabChange = (tab: string) => {
    localStorage.setItem('studentDashboardActiveTab', tab);
    onNavigate('studentDashboard');
  };

  useEffect(() => {
    fetchTutorProfile();
    fetchReviews();
  }, [tutorId]);

  const fetchTutorProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:5000/api/tutors/${tutorId}`, {
        headers
      });
      const data = await response.json();
      setTutor(data);
    } catch (error) {
      console.error('Error fetching tutor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/tutor/${tutorId}`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleBookLesson = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = getUserId(user);

      if (!userId) {
        alert('Please login to book a lesson');
        onNavigate('login');
        return;
      }

      const [startTime, endTime] = selectedTime.split('-');
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tutorId,
          date: selectedDate,
          startTime,
          endTime,
          duration: 60,
          type: 'trial'
        })
      });

      if (response.ok) {
        alert('Lesson booked successfully!');
        setSelectedDate('');
        setSelectedTime('');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to book lesson');
      }
    } catch (error) {
      console.error('Error booking lesson:', error);
      alert('Failed to book lesson');
    }
  };

  const handleEnrollInCourse = async () => {
    const userId = getUserId(user);
    const userRole = getUserRole(user);

    if (!userId || userRole !== 'student') {
      alert('Only students can enroll in courses');
      return;
    }

    if (!tutor?.userId?._id) {
      alert('Unable to enroll. Tutor information not available.');
      return;
    }

    const tutorId = tutor.userId._id;
    const token = localStorage.getItem('token');

    const saveEnrollmentLocally = () => {
      const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      const alreadyEnrolled = enrolledCourses.some((c: any) => c.tutorId === tutorId);
      if (!alreadyEnrolled) {
        enrolledCourses.push({
          tutorId,
          tutorName: tutor.userId.name,
          enrolledDate: new Date().toISOString(),
        });
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
      }
    };

    try {
      const response = await fetch('http://localhost:5000/api/enrollments/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tutorId: tutorId,
          courseName: `Course with ${tutor.userId.name}`
        })
      });

      if (response.ok) {
        await response.json(); // consume body
        saveEnrollmentLocally();
        alert(`Successfully enrolled in course with ${tutor.userId.name}!`);
      } else if (response.status === 404) {
        // Enrollment API not available; fall back to local tracking so students can see content
        saveEnrollmentLocally();
        alert(`Enrolled locally with ${tutor.userId.name}. (Enrollment service unavailable)`);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to enroll in course');
        return;
      }

      // Navigate to student dashboard
      onNavigate('studentDashboard');
      localStorage.setItem('studentDashboardActiveTab', 'courses');
      localStorage.setItem('currentPage', 'studentDashboard');
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setSendingMessage(true);
      const token = localStorage.getItem('token');
      const userId = getUserId(user);

      if (!userId) {
        alert('Please login to send a message');
        onNavigate('login');
        return;
      }

      // Get the tutor's userId from the tutor data
      const receiverId = tutor?.userId?._id;
      if (!receiverId) {
        alert('Unable to send message. Tutor information not available.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId,
          content: messageContent.trim()
        })
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setMessageContent('');
        setShowMessageModal(false);
        // Navigate to messages page
        const userRole = getUserRole(user);
        if (userRole === 'student') {
          onNavigate('studentDashboard');
          // Set active tab to messages
          localStorage.setItem('studentDashboardActiveTab', 'messages');
        } else {
          onNavigate('tutorDashboard');
          // Set active tab to messages
          localStorage.setItem('tutorDashboardActiveTab', 'messages');
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        user={user}
        activeTab="findTutors"
        setActiveTab={handleTabChange}
        onNavigate={onNavigate}
        menuItems={menuItems}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tutor profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!tutor) {
    return (
      <DashboardLayout
        user={user}
        activeTab="findTutors"
        setActiveTab={handleTabChange}
        onNavigate={onNavigate}
        menuItems={menuItems}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Tutor not found</p>
            <button onClick={onBack} className="px-6 py-2 bg-teal-600 text-white rounded-lg">
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const ratingStars = Array.from({ length: 5 }, (_, i) => i < Math.floor(tutor.rating));

  return (
    <DashboardLayout
      user={user}
      activeTab="findTutors"
      setActiveTab={handleTabChange}
      onNavigate={onNavigate}
      menuItems={menuItems}
    >
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="mb-6 text-teal-600 hover:text-teal-700 flex items-center">
          ← Back
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-8 text-white">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                {tutor.photo ? (
                  <img src={tutor.photo} alt={tutor.userId.name} className="w-32 h-32 rounded-full border-4 border-white" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
                    {tutor.userId.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{tutor.userId.name}</h1>
                  {tutor.profileScore >= 80 && (
                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    {ratingStars.map((filled, i) => (
                      <Star key={i} className={`w-5 h-5 ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="ml-2 font-semibold">{tutor.rating.toFixed(1)}</span>
                    <span className="ml-1 text-white/80">({tutor.totalReviews} reviews)</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{tutor.totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>{tutor.responseRate}% response rate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>${tutor.hourlyRate}/hour</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={handleBookLesson}
                      className="px-6 py-3 bg-white text-teal-600 rounded-lg font-bold hover:bg-gray-100 transition"
                    >
                      Book Trial Lesson
                    </button>
                    <button
                      onClick={handleEnrollInCourse}
                      className="px-6 py-3 bg-teal-500 text-white rounded-lg font-bold hover:bg-teal-600 transition"
                    >
                      Enroll in Course
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-6 py-3 bg-white text-teal-600 rounded-lg font-bold hover:bg-gray-100 transition"
                  >
                    Login to Book
                  </button>
                )}
                {isLoggedIn && (
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition"
                  >
                    <MessageSquare className="w-5 h-5 inline mr-2" />
                    Message
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Intro Video */}
                {tutor.introVideo && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Video className="w-6 h-6 text-teal-600" />
                      Introduction Video
                    </h2>
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      <video src={tutor.introVideo} controls className="w-full h-full" />
                    </div>
                  </div>
                )}

                {/* About */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">About</h2>
                  <p className="text-gray-700 leading-relaxed">{tutor.bio || 'No bio available'}</p>
                </div>

                {/* Subjects & Pricing */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Subjects & Pricing</h2>
                  <div className="space-y-3">
                    {tutor.subjects.map((subject, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span className="font-semibold">{subject.name}</span>
                        <span className="text-teal-600 font-bold">${subject.price}/hour</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Reviews ({tutor.totalReviews})</h2>
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <p className="text-gray-500">No reviews yet</p>
                    ) : (
                      reviews.map((review) => (
                        <div key={review._id} className="border-b pb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="font-semibold">{review.studentId.name}</span>
                            <span className="text-gray-500 text-sm">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                          {review.tutorResponse && (
                            <div className="mt-3 p-3 bg-teal-50 rounded-lg">
                              <p className="text-sm font-semibold text-teal-600 mb-1">Tutor's Response:</p>
                              <p className="text-gray-700">{review.tutorResponse}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Booking Calendar */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    Book a Lesson
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Time</label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Choose time</option>
                        <option value="09:00-10:00">9:00 AM - 10:00 AM</option>
                        <option value="10:00-11:00">10:00 AM - 11:00 AM</option>
                        <option value="11:00-12:00">11:00 AM - 12:00 PM</option>
                        <option value="14:00-15:00">2:00 PM - 3:00 PM</option>
                        <option value="15:00-16:00">3:00 PM - 4:00 PM</option>
                        <option value="16:00-17:00">4:00 PM - 5:00 PM</option>
                      </select>
                    </div>
                    {isLoggedIn ? (
                      <button
                        onClick={handleBookLesson}
                        className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition"
                      >
                        Confirm Booking
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigate('login')}
                        className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition"
                      >
                        Login to Book Lesson
                      </button>
                    )}
                  </div>
                </div>

                {/* Certifications */}
                {tutor.certifications && tutor.certifications.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-teal-600" />
                      Certifications
                    </h3>
                    <div className="space-y-3">
                      {tutor.certifications.map((cert, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-semibold">{cert.name}</p>
                          <p className="text-sm text-gray-600">{cert.issuer} • {cert.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {tutor.languages && tutor.languages.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-teal-600" />
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tutor.languages.map((lang, idx) => (
                        <span key={idx} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Profile Score */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-2">Profile Score</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-teal-600 h-3 rounded-full transition-all"
                        style={{ width: `${tutor.profileScore}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-teal-600">{tutor.profileScore}/100</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Higher score = Better visibility in search
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Send Message</h3>
              <button
                onClick={() => {
                  if (!sendingMessage) {
                    setShowMessageModal(false);
                    setMessageContent('');
                  }
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={sendingMessage}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-semibold">
                    {tutor?.userId?.name?.charAt(0) || 'T'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{tutor?.userId?.name || 'Tutor'}</p>
                  <p className="text-sm text-gray-600">To: {tutor?.userId?.email || ''}</p>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
                disabled={sendingMessage}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (!sendingMessage) {
                    setShowMessageModal(false);
                    setMessageContent('');
                  }
                }}
                disabled={sendingMessage}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageContent.trim()}
                className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingMessage ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}




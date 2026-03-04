import { useEffect, useState } from 'react';
import { 
  BookOpen, Users, Video, DollarSign, Star, LayoutDashboard, User,
  Calendar, MessageSquare, Settings, TrendingUp, BarChart3, Brain
} from 'lucide-react';
import type { Page } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import BookingsManagement from '../components/BookingsManagement';
import EarningsDashboard from '../components/EarningsDashboard';
import ProfileManagement from '../components/ProfileManagement';
import ReviewsManagement from '../components/ReviewsManagement';
import Messaging from '../components/Messaging';
import EmotionAnalytics from '../components/EmotionAnalytics';

interface Props {
  onNavigate: (page: Page) => void;
}

// ... Keep your interfaces (Course, Lecture, Student) exactly as they were ...
interface Course {
  id: number;
  title: string;
  category: string;
  students: number;
  lectures: number;
  rating: number;
  revenue: number;
  status: 'published' | 'draft' | 'archived';
  lastUpdated: string;
}

interface Lecture {
  id: string;
  title: string;
  duration: string;
  uploadDate: string;
  views: number;
  studentsCompleted: number;
  type: 'video' | 'pdf' | 'quiz';
}

interface Student {
  id: number;
  name: string;
  email: string;
  progress: number;
  lastActive: string;
  grade?: string;
}

export default function TutorDashboard({ onNavigate }: Props) {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  }

  // Define the menu items for the Tutor Sidebar
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'lectures', label: 'Lectures', icon: Video },
    { id: 'analytics', label: 'Learning & Emotion Analytics', icon: BarChart3 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'availability', label: 'Availability', icon: Calendar },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  // ... Keep all your existing state (courses, lectures, students) ...
  const [courses, setCourses] = useState<Course[]>([
    { 
      id: 1, 
      title: 'Introduction to Computer Technology', 
      category: 'Computer Science', 
      students: 0,
      lectures: 0,
      rating: 5.0, 
      revenue: 0, 
      status: 'published', 
      lastUpdated: new Date().toLocaleDateString() 
    }
  ]);

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // ... Keep your useEffect logic exactly as it was ...
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const parsedUser = JSON.parse(saved);
      setUser(parsedUser);
      
      // Create/load tutor profile when dashboard loads
      if (parsedUser.role === 'tutor') {
        const token = localStorage.getItem('token');
        if (token) {
          fetch('http://localhost:5000/api/tutors/profile/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-auth-token': token
            }
          })
          .then(res => res.json())
          .then(profile => {
            // Profile created/loaded successfully
            console.log('Tutor profile loaded:', profile);
            // Update user state with fresh profile data
            setUser((prev: any) => ({ ...prev, ...profile }));
          })
          .catch(err => {
            console.error('Error loading tutor profile:', err);
          });
        }
      }
    }

    const savedLectures = localStorage.getItem('courseLectures');
    if (savedLectures) {
      const parsedLectures = JSON.parse(savedLectures);
      const formattedLectures = parsedLectures.slice(0, 4).map((lec: any) => ({
        id: lec.id,
        title: lec.title,
        duration: lec.duration,
        uploadDate: lec.uploadDate,
        views: Math.floor(Math.random() * 100),
        studentsCompleted: Math.floor(Math.random() * 80),
        type: 'video' as const
      }));
      setLectures(formattedLectures);
    }

    // Load enrolled students from enrolledCourses (students who enrolled in courses)
    const savedEnrolledCourses = localStorage.getItem('enrolledCourses');
    if (savedEnrolledCourses) {
      const enrolledCourses = JSON.parse(savedEnrolledCourses);
      // Convert enrolled courses to student list
      const studentList = enrolledCourses.map((course: any, idx: number) => ({
        id: idx + 1,
        name: course.tutorName || 'Student',
        email: `student${idx + 1}@example.com`,
        progress: course.progress || 0,
        lastActive: course.enrolledDate || 'Recently',
        grade: course.progress >= 90 ? 'A+' : course.progress >= 80 ? 'A' : course.progress >= 70 ? 'B' : 'C'
      }));
      setStudents(studentList);
    }

    const updateCourseStats = () => {
      const lecturesData = localStorage.getItem('courseLectures');
      const enrolledCoursesData = localStorage.getItem('enrolledCourses');
      
      // Safe parsing with fallback to 0
      const lectureCount = lecturesData ? (JSON.parse(lecturesData).length || 0) : 0;
      const studentCount = enrolledCoursesData ? (JSON.parse(enrolledCoursesData).length || 0) : 0;
      
      setCourses(prevCourses => prevCourses.map(course => ({
        ...course,
        lectures: lectureCount,
        students: studentCount,
        revenue: studentCount * 10
      })));
    };

    updateCourseStats();
  }, []);

  const totalLectures = courses.reduce((sum, course) => sum + course.lectures, 0);
  const totalRevenue = courses.reduce((sum, course) => sum + course.revenue, 0);
  const totalStudents = students.length;

  // ... Keep your renderContent function logic exactly as it was ...
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        // Mock emotion data for AI visibility
        const emotionEngagement = {
          focused: 68,
          confused: 22,
          disengaged: 10
        };

        return (
          <div className="space-y-8 fade-in">
             <div className="mb-6">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-800">Tutor Dashboard</h1>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold uppercase">
                    {user?.role || 'Tutor'}
                  </span>
                </div>
                <p className="text-gray-500 mt-1">Welcome back, {user?.name}!</p>
             </div>
             
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Cards - Kept identical */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Courses</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{courses.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Students</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{totalStudents}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Lectures</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{totalLectures}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">${totalRevenue}</p>
                    {totalRevenue === 0 && totalLectures === 0 && (
                      <p className="text-xs text-gray-600 mt-1">(Demo Data)</p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Emotion Engagement Card - FYP Critical */}
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl shadow-sm border border-teal-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-teal-600" />
                  <h2 className="text-xl font-bold text-gray-800">Student Engagement (AI)</h2>
                </div>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Based on emotion detection</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">😊</div>
                  <p className="text-xs text-gray-500 mb-1">Focused</p>
                  <p className="text-2xl font-bold text-teal-600">{emotionEngagement.focused}%</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">😐</div>
                  <p className="text-xs text-gray-500 mb-1">Confused</p>
                  <p className="text-2xl font-bold text-yellow-600">{emotionEngagement.confused}%</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">😴</div>
                  <p className="text-xs text-gray-500 mb-1">Disengaged</p>
                  <p className="text-2xl font-bold text-red-600">{emotionEngagement.disengaged}%</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-4 text-center italic">
                Emotion data captured during learning sessions using facial expression analysis
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* My Courses Section */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">My Courses</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                        {course.status}
                      </span>
                      <span className="text-xs text-gray-600">{course.lastUpdated}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2 text-gray-800">{course.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">{course.category}</p>
                    
                    <div className="space-y-3 mb-6 pt-4 border-t border-gray-50">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Students</span>
                        <span className="font-semibold text-gray-700">{course.students}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Lectures</span>
                        <span className="font-semibold text-gray-700">{course.lectures}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        localStorage.setItem('courseManagementPreviousPage', 'tutorDashboard');
                        onNavigate('courseManagement');
                      }}
                      className="w-full px-4 py-2.5 bg-[#032E3F] text-white rounded-lg hover:bg-[#02222f] text-sm font-medium transition"
                    >
                      Manage Course
                    </button>
                  </div>
                ))}
                </div>
              </div>

              {/* AI Teaching Insights Panel - FYP Critical */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-800">AI Teaching Insights</h3>
                </div>
                <div className="space-y-4">
                  {totalStudents > 0 ? (
                    <>
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-500">⚠️</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Confusion Detected</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Students show confusion in recent sessions (22% average)
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-500">💡</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Suggested Action</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Add slower explanation or insert quiz checkpoint
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-start gap-2">
                          <span className="text-green-500">✅</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Engagement Trend</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Focus levels improved by 15% after recent adjustments
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-lg p-4 border border-purple-100 text-center">
                      <p className="text-sm text-gray-600">
                        AI insights will appear once students enroll and start learning sessions
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleTabChange('analytics')}
                  className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition"
                >
                  View Detailed Analytics
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Lectures */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Lectures</h3>
                {lectures.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No lectures uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lectures.map((lecture) => (
                      <div key={lecture.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition border border-gray-100">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-red-50 text-red-600">
                            <Video className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{lecture.title}</p>
                            <p className="text-xs text-gray-500">{lecture.duration}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => {
                    localStorage.setItem('courseManagementPreviousPage', 'tutorDashboard');
                    onNavigate('courseManagement');
                  }}
                  className="w-full mt-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 text-sm font-medium"
                >
                  View All Lectures
                </button>
              </div>

              {/* Enrolled Students Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Enrolled Students</h3>
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No students enrolled yet</p>
                    <p className="text-sm text-gray-600 mt-2">Students will appear here once they enroll in your courses</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.slice(0, 4).map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition border border-gray-100">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center mr-3 text-teal-600">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{student.name}</p>
                            <div className="flex items-center mt-1">
                                <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                                <div 
                                    className="bg-green-500 h-1.5 rounded-full" 
                                    style={{ width: `${student.progress}%` }}
                                ></div>
                                </div>
                                <span className="text-xs text-green-600 font-bold">{student.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {students.length > 0 && (
                  <button 
                    onClick={() => handleTabChange('analytics')}
                    className="w-full mt-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
                  >
                    View Full Analytics
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case 'courses':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Course Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Cards */}
              <div className="lg:col-span-2 space-y-6">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
                        <p className="text-gray-500">{course.category}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {course.status}
                      </span>
                    </div>
                    
                    {/* AI Engagement Status - FYP Critical */}
                    {course.students > 0 ? (
                      <div className="mb-4 p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-teal-600" />
                          <span className="text-xs font-semibold text-gray-700">AI Engagement Status</span>
                        </div>
                        {course.lectures === 0 ? (
                          <p className="text-xs text-gray-600">🟡 No engagement data yet - upload lectures to start tracking</p>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-700">🟢 Mostly Engaged (68% average)</p>
                            <p className="text-xs text-yellow-600">⚠️ Confusion detected in recent sessions (22%)</p>
                          </div>
                        )}
                      </div>
                    ) : null}
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase">Students</p>
                        <p className="text-lg font-bold text-gray-800">{course.students}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase">Lectures</p>
                        <p className="text-lg font-bold text-gray-800">{course.lectures}</p>
                        {course.lectures === 0 && course.revenue > 0 && (
                          <p className="text-xs text-gray-600 mt-1">(Demo Data)</p>
                        )}
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase">Rating</p>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="font-bold text-gray-800">{course.rating}</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase">Revenue</p>
                        <p className="text-lg font-bold text-green-600">${course.revenue}</p>
                        {course.revenue > 0 && course.lectures === 0 && (
                          <p className="text-xs text-gray-600 mt-1">(Demo Data)</p>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        localStorage.setItem('courseManagementPreviousPage', 'tutorDashboard');
                        onNavigate('courseManagement');
                      }}
                      className="w-full px-4 py-3 bg-[#032E3F] text-white rounded-lg hover:bg-[#02222f] transition font-medium"
                    >
                      Manage Content
                    </button>
                  </div>
                ))}
              </div>

              {/* AI Teaching Insights Panel - FYP Critical */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200 p-6 h-fit">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-800">AI Teaching Insights</h3>
                </div>
                <div className="space-y-4">
                  {totalStudents > 0 ? (
                    <>
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-500">⚠️</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Progress Alert</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Students show slower progress in Topic 1
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-500">💡</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Suggested Action</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Add recap lecture or simplified explanation
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-500">📊</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Emotion Trend</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Mild confusion detected (22% average)
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-lg p-4 border border-purple-100 text-center">
                      <p className="text-sm text-gray-600">
                        AI insights will appear once students enroll and start learning sessions
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleTabChange('analytics')}
                  className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition"
                >
                  View Full Analytics
                </button>
              </div>
            </div>
          </div>
        );

      case 'lectures':
        return (
          <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Lecture Management</h2>
              <button 
                onClick={() => {
                  localStorage.setItem('courseManagementPreviousPage', 'tutorDashboard');
                  onNavigate('courseManagement');
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
              >
                Go to Course
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {lectures.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No lectures uploaded yet</p>
                  <button 
                    onClick={() => {
                      localStorage.setItem('courseManagementPreviousPage', 'tutorDashboard');
                      onNavigate('courseManagement');
                    }}
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Upload First Lecture
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {lectures.map((lecture) => (
                    <div key={lecture.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mr-4">
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{lecture.title}</p>
                          <p className="text-sm text-gray-500">{lecture.duration} • {lecture.uploadDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">{lecture.views} views</p>
                        <p className="text-xs text-gray-500">{lecture.studentsCompleted} completed</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'analytics':
        const avgProgress = students.length > 0 
          ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length)
          : 0;
        const analyticsTotalStudents = students.length;
        const highPerformers = students.filter(s => s.progress >= 80).length;
        const needsAttention = students.filter(s => s.progress < 50).length;

        return (
          <div className="space-y-6 fade-in">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-800">Student Learning Analytics</h2>
              <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">
                AI-Powered
              </span>
            </div>
            <p className="text-gray-600 mb-6">Comprehensive analytics combining academic performance with emotion-based engagement insights</p>
            
            {/* Combined Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Students</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{analyticsTotalStudents}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Avg. Progress</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{avgProgress}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">High Performers</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{highPerformers}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Needs Attention</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{needsAttention}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Column Layout: Learning Analytics + Emotion Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Learning Performance Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">Learning Performance</h3>
                </div>
                
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No students enrolled yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                        <div className="flex items-center flex-1">
                          <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1 justify-end">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  student.progress >= 80 ? 'bg-green-600' :
                                  student.progress >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-sm text-gray-800 w-10">{student.progress}%</span>
                          </div>
                          <p className="text-xs text-gray-500">Grade: {student.grade || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress Distribution */}
                {students.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Progress Distribution</h4>
                    <div className="space-y-2">
                      {['90-100%', '80-89%', '70-79%', '60-69%', '0-59%'].map((range) => {
                        const [min, max] = range.split('-').map(r => parseInt(r.replace('%', '')));
                        const count = students.filter(s => s.progress >= min && s.progress <= max).length;
                        const percentage = analyticsTotalStudents > 0 ? (count / analyticsTotalStudents) * 100 : 0;
                        return (
                          <div key={range}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-gray-600">{range}</span>
                              <span className="text-xs font-bold text-gray-800">{count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-teal-600 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Emotion & Engagement Analytics Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-800">Emotion & Engagement</h3>
                </div>
                <EmotionAnalytics tutorId={user?.id} />
              </div>
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Bookings Management</h2>
            <BookingsManagement />
          </div>
        );

      case 'availability':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Availability Calendar</h2>
            <AvailabilityCalendar />
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Reviews & Ratings</h2>
            <ReviewsManagement />
          </div>
        );

      case 'earnings':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Earnings Dashboard</h2>
            <EarningsDashboard />
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
            <Messaging />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Profile Management</h2>
            <ProfileManagement />
          </div>
        );

      default:
        return null;
    }
  };

  // 3. RETURN STATEMENT - WRAPPED IN DASHBOARDLAYOUT
  return (
    <DashboardLayout
      user={user}
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      onNavigate={onNavigate}
      menuItems={menuItems}
    >
      {renderContent()}

    </DashboardLayout>
  );
}
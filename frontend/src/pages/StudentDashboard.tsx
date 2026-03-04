import { useEffect, useState } from 'react';
import {
  LayoutDashboard, BookOpen, Calendar, Search, MessageSquare,
  Star, User, Award, BarChart3, Settings, Brain
} from 'lucide-react';
import type { Page } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import HoursChart from '../components/HoursChart';
import PerformanceGauge from '../components/PerformanceGauge';
import Leaderboard from '../components/Leaderboard';
import StudentBookings from '../components/StudentBookings';
import StudentMessaging from '../components/StudentMessaging';
import StudentProfileManagement from '../components/StudentProfileManagement';
import EmotionAnalytics from '../components/EmotionAnalytics';
import AILearningSnapshot from '../components/AILearningSnapshot';
import EmotionTimeline from '../components/EmotionTimeline';
import PerformanceEmotionCorrelation from '../components/PerformanceEmotionCorrelation';
import AIRecommendationsPanel from '../components/AIRecommendationsPanel';
import AIExplainability from '../components/AIExplainability';
import AITutorRecommendations from '../components/AITutorRecommendations';
import EmotionAwareInsight from '../components/EmotionAwareInsight';
import HowAIMatches from '../components/HowAIMatches';
import TutorSearchFilters from '../components/TutorSearchFilters';
import TutoringImprovementStat from '../components/TutoringImprovementStat';
import CourseManagement from './CourseManagement';

interface Props {
  onNavigate: (page: Page) => void;
}

export default function StudentDashboard({ onNavigate }: Props) {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleTabChange = (tab: string) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      // Save current tab to localStorage for navigation
      localStorage.setItem('studentDashboardCurrentTab', tab);
    }
  }

  const [lectureCount, setLectureCount] = useState(0);
  const [tutorCount, setTutorCount] = useState(0);
  const [availableTutors, setAvailableTutors] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // Find Tutors state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showAIMatch, setShowAIMatch] = useState(true);
  const [recommendedTutors, setRecommendedTutors] = useState<any[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);

  // Define the menu items for the Student Sidebar
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

  const courses = [
    {
      id: 1,
      name: 'Introduction to Computer Technology',
      teacher: 'Dr. Sarah Johnson',
      progress: 45,
      attendance: 92,
      description: 'Learn the fundamentals of computer technology',
      category: 'Computer Science',
      duration: '12 weeks',
      lectures: lectureCount,
      assignments: 5,
      quizzes: 3,
    }
  ];

  const upcomingClasses = [
    { id: 1, subject: 'Introduction to Computer Technology', time: '10:00 AM', room: 'Room 301' },
    { id: 2, subject: 'Lab Session', time: '2:00 PM', room: 'Lab 102' },
  ];

  const assignments = [
    { id: 1, title: 'Programming Assignment 1', course: 'Intro to CT', dueDate: 'Jan 25, 2024', status: 'pending' },
    { id: 2, title: 'Research Paper', course: 'Intro to CT', dueDate: 'Jan 28, 2024', status: 'submitted' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));

    // Restore active tab if coming back from another page
    const savedTab = localStorage.getItem('studentDashboardActiveTab');
    const currentTab = localStorage.getItem('studentDashboardCurrentTab');
    if (savedTab) {
      setActiveTab(savedTab);
      localStorage.removeItem('studentDashboardActiveTab');
    } else if (currentTab) {
      setActiveTab(currentTab);
    }

    const savedLectures = localStorage.getItem('courseLectures');
    if (savedLectures) {
      const lectures = JSON.parse(savedLectures);
      setLectureCount(lectures.length);
    }

    // Load enrolled courses from API
    loadEnrolledCourses();

    // Load tutor count and available tutors
    loadTutors();
  }, []);

  useEffect(() => {
    // Load AI-recommended tutors when user is available
    if (user?.id) {
      loadRecommendedTutors();
    }
  }, [user]);

  const loadTutors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tutors');
      if (response.ok) {
        const tutors = await response.json();
        setTutorCount(tutors.length);
        setAvailableTutors(tutors.slice(0, 6)); // Show first 6 tutors
      }
    } catch (error) {
      console.error('Error loading tutors:', error);
    }
  };

  const loadEnrolledCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/enrollments/my-courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const enrollments = await response.json();
        // Transform API data to match expected format
        const courses = enrollments.map((enrollment: any) => ({
          id: enrollment._id,
          name: enrollment.courseName || 'Untitled Course',
          tutorId: enrollment.tutor?._id,
          tutorName: enrollment.tutor?.userId?.name || 'Unknown Tutor',
          enrolledDate: new Date(enrollment.enrolledDate || enrollment.createdAt).toLocaleDateString(),
          progress: enrollment.progress || 0,
          status: enrollment.status || 'active'
        }));
        setEnrolledCourses(courses);
      }
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
    }
  };

  const loadRecommendedTutors = async () => {
    try {
      setLoadingTutors(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Get emotion analytics to determine recommendations
      const emotionResponse = await fetch(
        `http://localhost:5000/api/emotions/analytics/student/${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      let confusionAreas: string[] = [];
      if (emotionResponse.ok) {
        const emotionData = await emotionResponse.json();
        // Extract areas where confusion was high
        if (emotionData.emotionDistribution?.confusion > 0.2) {
          confusionAreas = ['Data Structures', 'Algorithms', 'Programming']; // Mock - replace with actual data
        }
      }

      // Load all tutors
      const tutorsResponse = await fetch('http://localhost:5000/api/tutors');
      if (tutorsResponse.ok) {
        const allTutors = await tutorsResponse.json();

        // Mock AI matching - in production, this would be done on backend
        const recommended = allTutors.slice(0, 3).map((tutor: any, index: number) => ({
          ...tutor,
          aiMatchScore: 85 - (index * 5), // Mock scores: 85%, 80%, 75%
          matchReason: confusionAreas.length > 0
            ? `Matched due to difficulty in ${confusionAreas[0]}`
            : 'Recommended after confusion detected in recent sessions',
          specialization: tutor.subjects?.[0]?.name || 'General Tutoring'
        }));

        setRecommendedTutors(recommended);
      }
    } catch (error) {
      console.error('Error loading recommended tutors:', error);
      // Fallback to mock data
      setRecommendedTutors([]);
    } finally {
      setLoadingTutors(false);
    }
  };

  const enrollInCourse = (tutorId: string, tutorName: string) => {
    const course = {
      id: Date.now(),
      tutorId,
      tutorName,
      name: `Course with ${tutorName}`,
      enrolledDate: new Date().toLocaleDateString(),
      progress: 0
    };
    const updated = [...enrolledCourses, course];
    setEnrolledCourses(updated);
    localStorage.setItem('enrolledCourses', JSON.stringify(updated));
    alert(`Successfully enrolled in course with ${tutorName}!`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        // Calculate AI metrics from emotion data
        const courseCompletion = enrolledCourses.length > 0
          ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / enrolledCourses.length)
          : 0;

        // Mock emotion data - replace with actual API call
        const emotionalEngagement = {
          engaged: 72,
          confused: 18,
          disengaged: 10
        };

        const aiAdaptations = {
          contentSlowed: 3,
          videoReplaySuggested: 2,
          tutorRecommended: 1
        };

        const performanceTrend = courseCompletion > 50 ? 'improving' : courseCompletion < 30 ? 'declining' : 'stable';
        const performanceChange = 15; // Calculate from actual data

        // Mock emotion timeline data - replace with actual API call
        const emotionTimelineData = [
          { timestamp: new Date().toISOString(), focus: 75, confusion: 15, frustration: 10, engagement: 80 },
          { timestamp: new Date().toISOString(), focus: 70, confusion: 20, frustration: 10, engagement: 75 },
          { timestamp: new Date().toISOString(), focus: 65, confusion: 25, frustration: 10, engagement: 70 },
          { timestamp: new Date().toISOString(), focus: 80, confusion: 10, frustration: 10, engagement: 85 },
          { timestamp: new Date().toISOString(), focus: 85, confusion: 5, frustration: 10, engagement: 90 },
        ];

        // Mock performance data - replace with actual API call
        const performanceData = [
          { session: 'Session 1', quizScore: 65, completionRate: 70, engagement: 60, confusion: 30 },
          { session: 'Session 2', quizScore: 72, completionRate: 75, engagement: 70, confusion: 25 },
          { session: 'Session 3', quizScore: 78, completionRate: 80, engagement: 75, confusion: 20 },
          { session: 'Session 4', quizScore: 85, completionRate: 85, engagement: 80, confusion: 15 },
        ];

        // Mock AI insights - replace with actual API call
        const aiInsights = [
          `Student performed ${performanceChange}% better during sessions with high engagement (above ${emotionalEngagement.engaged}%).`,
          `Confusion levels decreased by ${(30 - 15)}% over the last ${performanceData.length} sessions, correlating with improved quiz scores.`,
        ];

        // Mock recommendations - replace with actual API call
        const recommendations = [
          {
            id: '1',
            type: 'content' as const,
            priority: 'high' as const,
            title: 'Confusion detected during "Sorting Algorithms"',
            description: 'You seemed confused during the Sorting Algorithms lesson. Consider reviewing the simplified explanation video.',
            reason: 'High confusion detected (25%)',
            action: 'Watch simplified video',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            implemented: false
          },
          {
            id: '2',
            type: 'session' as const,
            priority: 'medium' as const,
            title: 'Engagement drops after 18 minutes',
            description: 'Your engagement typically decreases after 18 minutes of continuous learning. Consider taking shorter, focused sessions.',
            reason: 'Pattern detected in engagement data',
            action: 'Schedule shorter sessions',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            implemented: false
          },
          {
            id: '3',
            type: 'tutor' as const,
            priority: 'low' as const,
            title: 'Tutor Ali recommended',
            description: 'Based on frustration detection during recent sessions, one-on-one tutoring with Ali is recommended.',
            reason: 'Frustration detected in multiple sessions',
            action: 'Book session with tutor',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            implemented: false
          }
        ];

        return (
          <div className="space-y-8 fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
              <p className="text-gray-500">Welcome back, {user?.name}!</p>
              <p className="text-sm text-gray-600 mt-1">
                AI-powered adaptive learning insights • Real-time emotion detection active
              </p>
            </div>

            {/* 1. AI Learning Snapshot - TOP SECTION (MOST IMPORTANT) */}
            <AILearningSnapshot
              courseCompletion={courseCompletion}
              emotionalEngagement={emotionalEngagement}
              aiAdaptations={aiAdaptations}
              performanceTrend={performanceTrend}
              performanceChange={performanceChange}
            />

            {/* 2. Emotion Timeline - CORE FYP FEATURE */}
            <EmotionTimeline
              data={emotionTimelineData}
              videoTimeline={false}
            />

            {/* 3. Performance + Emotion Correlation - RESEARCH GOLD */}
            <PerformanceEmotionCorrelation
              performanceData={performanceData}
              insights={aiInsights}
            />

            {/* 4. AI Recommendations Panel - ADAPTIVE SYSTEM PROOF */}
            <AIRecommendationsPanel
              recommendations={recommendations}
              onMarkImplemented={(id) => {
                // Handle marking recommendation as implemented
                console.log('Marked as implemented:', id);
              }}
            />

            {/* 5. Explainability Section - FYP HACK */}
            <AIExplainability />

            {/* Additional Sections - Keep existing but with better labels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* My Enrolled Courses */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">My Enrolled Courses</h2>
                <div className="space-y-4">
                  {enrolledCourses.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">No courses enrolled yet</p>
                      <p className="text-xs text-gray-600 mb-4">Enroll in courses to start tracking progress</p>
                      <button
                        onClick={() => handleTabChange('findTutors')}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                      >
                        Find Tutors to Enroll
                      </button>
                    </div>
                  ) : (
                    enrolledCourses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-black">{course.name}</h3>
                            <p className="text-gray-600 text-sm">Tutor: {course.tutorName}</p>
                            <p className="text-gray-500 text-xs mt-1">Enrolled: {course.enrolledDate}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm font-bold text-teal-600">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleTabChange('courseContent')}
                          className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm"
                        >
                          View Course Details →
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Today's Classes & Quick Actions */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                    <Calendar className="w-6 h-6 mr-2 text-teal-600" />
                    Today's Classes
                  </h2>
                  <div className="space-y-3">
                    {upcomingClasses.length === 0 ? (
                      <p className="text-gray-500 text-sm">No classes scheduled for today</p>
                    ) : (
                      upcomingClasses.map((cls) => (
                        <div key={cls.id} className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                          <h3 className="font-semibold text-gray-800">{cls.subject}</h3>
                          <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {cls.time}
                            </span>
                            <span>{cls.room}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Pending Assignments</h2>
                  <div className="space-y-3">
                    {assignments.length === 0 ? (
                      <p className="text-gray-500 text-sm">No pending assignments</p>
                    ) : (
                      assignments.map((assignment) => (
                        <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-800">{assignment.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs ${assignment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                              }`}>
                              {assignment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{assignment.course}</p>
                          <p className="text-xs text-gray-500 mt-1">Due: {assignment.dueDate}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <Leaderboard />
            </div>
          </div>
        );

      case 'courses':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-2xl font-bold text-gray-800">My Enrolled Courses</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No courses enrolled yet</p>
                  <button
                    onClick={() => handleTabChange('findTutors')}
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Find Tutors to Enroll
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-black">{course.name}</h3>
                          <p className="text-gray-600 text-sm">Tutor: {course.tutorName}</p>
                          <p className="text-gray-500 text-sm mt-1">Enrolled: {course.enrolledDate}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm font-bold text-teal-600">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          // Store the selected course info for the content page
                          setSelectedCourse(course);
                          localStorage.setItem('selectedCourseTutorId', course.tutorId);
                          localStorage.setItem('selectedCourseName', course.name);
                          handleTabChange('courseContent');
                        }}
                        className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
                      >
                        View Course Details →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'findTutors':
        // Mock emotion data for insight - replace with actual API call
        const emotionInsight = {
          confusion: 25,
          frustration: 15,
          engagement: 70
        };

        const insightText = "You showed increased confusion in Data Structures videos. Tutors specializing in simplified explanations are prioritized.";

        return (
          <div className="space-y-8 fade-in">
            {/* 1. Page Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">Find Tutors (AI-Assisted Matching)</h2>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  AI-Powered
                </span>
              </div>
              <p className="text-gray-600 text-lg">
                Tutors are recommended based on your learning progress, emotional engagement, and topic difficulty.
              </p>
            </div>

            {/* 2. Search & Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <TutorSearchFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedSubject={selectedSubject}
                onSubjectChange={setSelectedSubject}
                minRating={minRating}
                onMinRatingChange={setMinRating}
                maxPrice={maxPrice}
                onMaxPriceChange={setMaxPrice}
                showAIMatch={showAIMatch}
                onAIMatchToggle={setShowAIMatch}
              />
            </div>

            {/* 3. AI Tutor Recommendations */}
            {loadingTutors ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading AI recommendations...</p>
              </div>
            ) : (
              <AITutorRecommendations
                tutors={recommendedTutors}
                onViewProfile={(tutorId) => {
                  localStorage.setItem('selectedTutorId', tutorId);
                  localStorage.setItem('previousPage', 'studentDashboard');
                  onNavigate('tutorProfile');
                }}
                onBookSession={(tutorId) => {
                  localStorage.setItem('selectedTutorId', tutorId);
                  onNavigate('tutorProfile');
                }}
              />
            )}

            {/* 4. Emotion-Aware Insight Panel */}
            <EmotionAwareInsight
              insight={insightText}
              emotionData={emotionInsight}
            />

            {/* 5. How AI Matches You Section */}
            <HowAIMatches />

            {/* 6. Improvement Stat */}
            <TutoringImprovementStat
              improvementPercentage={22}
              totalSessions={15}
            />

            {/* 7. Browse All Tutors - Secondary CTA */}
            <div className="text-center">
              <button
                onClick={() => {
                  localStorage.setItem('tutorSearchPreviousPage', 'findTutors');
                  localStorage.setItem('tutorSearchPreviousDashboard', 'studentDashboard');
                  onNavigate('tutorSearch');
                }}
                className="px-8 py-3 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 font-semibold transition"
              >
                Browse All Tutors →
              </button>
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-2xl font-bold text-gray-800">My Bookings</h2>
            <StudentBookings />
          </div>
        );

      case 'emotionAnalytics':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Emotion Analytics</h2>
            <EmotionAnalytics studentId={user?.id} />
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
            <StudentMessaging />
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-2xl font-bold text-gray-800">My Reviews</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-gray-600">
                Your reviews will appear here after you complete lessons with tutors.
                Go to "My Bookings" to leave reviews for completed lessons.
              </p>
            </div>
          </div>
        );


      case 'profile':
        return (
          <div className="space-y-6 fade-in">
            <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
            <StudentProfileManagement />
          </div>
        );

      case 'courseContent':
        // Render CourseManagement content embedded in StudentDashboard
        return (
          <div className="space-y-6 fade-in">
            <CourseManagement onNavigate={onNavigate} userRole="student" />
          </div>
        );

      default:
        return null;
    }
  };

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
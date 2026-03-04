// components/CourseDetails.tsx
import { useState, useEffect } from 'react';
import {
  User, BookOpen, Calendar, Clock, Video, FileText,
  BarChart, Award, Download, ArrowLeft, MessageSquare,
  Star, Users, Bookmark, PlayCircle
} from 'lucide-react';

interface Course {
  id: number;
  name: string;
  teacher: string;
  progress: number;
  attendance: number;
  description: string;
  category: string;
  duration: string;
  lectures: number;
  assignments: number;
  quizzes: number;
}

interface Props {
  course: Course;
  onBack: () => void;
}

export default function CourseDetails({ course, onBack }: Props) {
  // State for content
  const [activeTab, setActiveTab] = useState('overview');
  const [lectures, setLectures] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [assignments, setAssignments] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [quizzes, setQuizzes] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        setLoading(true);
        // In a real app, filtering by course.id is best. 
        // For now, filtering by generic fetch to show uploaded content.
        const response = await fetch('http://localhost:5000/api/lectures');
        if (response.ok) {
          const data = await response.json();
          // Transform if necessary to match UI expected format
          const formattedLectures = data.map((l: any) => ({
            id: l._id,
            title: l.title,
            duration: l.duration || 'N/A',
            date: new Date(l.createdAt).toISOString().split('T')[0],
            completed: false, // You'd need a separate tracking for completion
            videoUrl: `/api/lectures/${l._id}/video`
          }));
          setLectures(formattedLectures);
        }
      } catch (error) {
        console.error("Failed to fetch lectures", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [course.id]);

  // Mock teacher profile (kept for now as we focus on lectures)
  const teacherProfile = {
    name: course.teacher,
    qualification: 'PhD in Computer Science',
    experience: '10+ years teaching experience',
    email: 'teacher@university.edu',
    rating: 4.8,
    students: 245,
    bio: 'Specialized in Artificial Intelligence and Machine Learning. Published 20+ research papers in top conferences.',
  };

  const completedLectures = lectures.filter(l => l.completed);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={onBack}
            className="flex items-center text-white hover:text-teal-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Courses
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-3 inline-block">
                {course.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{course.name}</h1>
              <p className="text-teal-100 text-lg">{course.description}</p>
            </div>

            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <button className="px-6 py-2 bg-white text-teal-600 rounded-lg font-semibold hover:bg-teal-50 flex items-center">
                <PlayCircle className="w-5 h-5 mr-2" />
                Continue Learning
              </button>
              <button className="px-4 py-2 border-2 border-white text-white rounded-lg hover:bg-white/10">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b">
                <nav className="flex flex-wrap">
                  {['overview', 'lectures', 'assignments', 'quizzes', 'resources'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 font-medium capitalize ${activeTab === tab
                        ? 'border-b-2 border-teal-600 text-teal-600'
                        : 'text-gray-600 hover:text-teal-600'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center">
                        <BookOpen className="w-6 h-6 mr-2 text-teal-600" />
                        Course Overview
                      </h3>
                      <p className="text-gray-700">
                        This course provides comprehensive coverage of {course.name}. You'll learn fundamental concepts,
                        practical applications, and advanced techniques. The course includes hands-on projects,
                        real-world case studies, and interactive learning experiences.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-teal-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Clock className="w-5 h-5 text-teal-600 mr-2" />
                          <span className="font-semibold">Duration</span>
                        </div>
                        <p className="text-2xl font-bold text-teal-700">{course.duration}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Video className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="font-semibold">Lectures</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{course.lectures}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <FileText className="w-5 h-5 text-purple-600 mr-2" />
                          <span className="font-semibold">Assignments</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-700">{course.assignments}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'lectures' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold mb-4">Course Lectures</h3>
                    {lectures.length === 0 ? (
                      <p className="text-gray-500 italic">No lectures uploaded yet.</p>
                    ) : (
                      lectures.map((lecture) => (
                        <div
                          key={lecture.id}
                          className={`p-4 rounded-lg border ${lecture.completed
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-white'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${lecture.completed ? 'bg-green-100' : 'bg-gray-100'
                                }`}>
                                {lecture.completed ? (
                                  <Award className="w-5 h-5 text-green-600" />
                                ) : (
                                  <PlayCircle className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold">{lecture.title}</h4>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span className="mr-4">{lecture.duration}</span>
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span>{lecture.date}</span>
                                </div>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center">
                              <PlayCircle className="w-4 h-4 mr-2" />
                              {lecture.completed ? 'Review' : 'Watch Now'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'assignments' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold mb-4">Assignments</h3>
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-4 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-lg">{assignment.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm ${assignment.status === 'Submitted'
                            ? 'bg-green-100 text-green-800'
                            : assignment.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {assignment.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Due: {assignment.dueDate}</span>
                          </div>
                          {assignment.score !== null && (
                            <div className="flex items-center">
                              <Award className="w-5 h-5 text-green-600 mr-2" />
                              <span className="font-bold text-green-700">Score: {assignment.score}/100</span>
                            </div>
                          )}
                          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                            {assignment.status === 'Submitted' ? 'View Feedback' : 'Start Assignment'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'quizzes' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold mb-4">Quizzes</h3>
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="p-4 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-lg">{quiz.title}</h4>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{quiz.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            {quiz.score !== null ? (
                              <div className="flex items-center">
                                <BarChart className="w-5 h-5 text-blue-600 mr-2" />
                                <span className="font-bold text-blue-700">
                                  Score: {quiz.score}/{quiz.total}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-600">Not attempted yet</span>
                            )}
                          </div>
                          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                            {quiz.score !== null ? 'Review Quiz' : 'Take Quiz'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold mb-4">Course Resources</h3>
                    {[
                      { name: 'Course Syllabus.pdf', type: 'PDF', size: '2.4 MB' },
                      { name: 'Lecture Slides.zip', type: 'ZIP', size: '45 MB' },
                      { name: 'Reference Books.pdf', type: 'PDF', size: '15 MB' },
                      { name: 'Sample Code', type: 'Folder', size: '120 MB' },
                      { name: 'Research Papers', type: 'Collection', size: '85 MB' },
                    ].map((resource, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <FileText className="w-6 h-6 text-teal-600 mr-3" />
                          <div>
                            <h4 className="font-semibold">{resource.name}</h4>
                            <p className="text-sm text-gray-600">
                              {resource.type} • {resource.size}
                            </p>
                          </div>
                        </div>
                        <button className="flex items-center text-teal-600 hover:text-teal-700">
                          <Download className="w-5 h-5 mr-2" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Teacher Profile Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <User className="w-6 h-6 mr-2 text-teal-600" />
                Instructor
              </h3>
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                  <User className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{teacherProfile.name}</h4>
                  <p className="text-gray-600">{teacherProfile.qualification}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{teacherProfile.rating}</span>
                    <Users className="w-4 h-4 ml-4 mr-1 text-gray-500" />
                    <span>{teacherProfile.students} students</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{teacherProfile.bio}</p>
              <button className="w-full py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Contact Instructor
              </button>
            </div>

            {/* Progress Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Your Progress</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Course Completion</span>
                    <span className="font-bold text-teal-600">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-teal-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Attendance</span>
                    <span className="font-bold text-blue-600">{course.attendance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${course.attendance}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600">{completedLectures.length}</div>
                      <div className="text-sm text-gray-600">Completed Lectures</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">2</div>
                      <div className="text-sm text-gray-600">Assignments Done</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">2</div>
                      <div className="text-sm text-gray-600">Quizzes Taken</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">85%</div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Upcoming Deadlines</h3>
              <div className="space-y-3">
                {[
                  { task: 'Assignment 2: Neural Network', due: 'Tomorrow', type: 'assignment' },
                  { task: 'Quiz 3: Deep Learning', due: '2 days', type: 'quiz' },
                  { task: 'Lecture 5: NLP', due: 'This week', type: 'lecture' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.task}</p>
                      <p className="text-sm text-gray-600">Due: {item.due}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${item.type === 'assignment'
                      ? 'bg-red-100 text-red-800'
                      : item.type === 'quiz'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                      }`}>
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
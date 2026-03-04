import { useState } from 'react';

import { Search, Clock, BookOpen, Users, Play, Star, Award, User, LogIn, UserPlus, Home, Menu, X } from 'lucide-react';
import type { Page } from '../types';
import Header from '../components/Header';

interface LandingProps {
  onNavigate: (page: Page) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching for: "${searchQuery}"`);
      onNavigate('courses');
    }
  };

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('user') !== null;
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  const popularCourses = [
    {
      id: 1,
      title: 'Complete Web Development Course',
      category: 'Development',
      duration: '10 hours',
      instructor: 'John Doe',
      price: '$49',
      rating: 4.8,
      students: 1245
    },
    {
      id: 2,
      title: 'Mobile App Development',
      category: 'Mobile',
      duration: '12 hours',
      instructor: 'Jane Smith',
      price: '$59',
      rating: 4.9,
      students: 987
    },
    {
      id: 3,
      title: 'Full Stack Development',
      category: 'Full Stack',
      duration: '15 hours',
      instructor: 'Mike Johnson',
      price: '$69',
      rating: 4.7,
      students: 1567
    },
  ];

  const testimonials = [
    {
      name: 'Ali Ahmed',
      role: 'Web Developer',
      text: 'This platform completely transformed my learning experience. The courses are well-structured and the instructors are amazing!',
      rating: 5
    },
    {
      name: 'Fatima Khan',
      role: 'Student',
      text: 'I was able to land my first job as a developer after completing the web development course. Highly recommended!',
      rating: 5
    },
    {
      name: 'Omar Farooq',
      role: 'Data Scientist',
      text: 'The quality of content is outstanding. The interactive videos and practical assignments made learning so much easier.',
      rating: 4
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header currentPage="landing" onNavigate={onNavigate} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Develop your skills in a new and <span className="text-teal-600">unique way</span>
              </h1>
              <p className="text-gray-600 mb-8 text-lg">
                Join thousands of students who are transforming their careers through our interactive learning platform. Learn from industry experts at your own pace.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {!isLoggedIn ? (
                  <>
                    <button
                      onClick={() => onNavigate('signup')}
                      className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium flex items-center justify-center space-x-2"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Get Started Free</span>
                    </button>
                    <button
                      onClick={() => onNavigate('login')}
                      className="px-8 py-3 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 font-medium flex items-center justify-center space-x-2"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Login</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (user?.role === 'student') onNavigate('student-dashboard');
                      else if (user?.role === 'tutor') onNavigate('tutorDashboard');
                      else if (user?.role === 'admin') onNavigate('admin-dashboard');
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:opacity-90 font-medium flex items-center justify-center space-x-2"
                  >
                    <User className="w-5 h-5" />
                    <span>Go to Dashboard</span>
                  </button>
                )}
              </div>
              
              <div className="mt-8 flex items-center space-x-6 text-gray-600">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-teal-600" />
                  <span>60K+ Students</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  <span>200+ Courses</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-600" />
                  <span>Certified</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/src/assets/Group2.png"
                alt="Students learning online"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-[#032E3F] to-[#0878A5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div className="p-6 hover:bg-white/10 rounded-xl transition">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-teal-100">Online Courses</div>
            </div>
            <div className="p-6 hover:bg-white/10 rounded-xl transition">
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-teal-100">Expert Tutors</div>
            </div>
            <div className="p-6 hover:bg-white/10 rounded-xl transition">
              <div className="text-4xl font-bold mb-2">60K+</div>
              <div className="text-teal-100">Online Students</div>
            </div>
            <div className="p-6 hover:bg-white/10 rounded-xl transition">
              <div className="text-4xl font-bold mb-2">6K+</div>
              <div className="text-teal-100">Certified Courses</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Search courses</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find the perfect course for your career growth. Search from thousands of courses taught by industry experts.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for courses..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button 
                type="submit"
                className="px-8 py-3 bg-[#032E3F] text-white rounded-lg hover:bg-[#021f2a] transition-colors font-medium"
              >
                Search
              </button>
            </form>
            
            {/* Popular Search Tags */}
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              {['Web Development', 'Data Science', 'AI', 'Business', 'Design', 'Marketing'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    onNavigate('courses');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="/src/assets/Group 118.png"
                alt="Online learning benefits"
                className="rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Benefits from our <span className="text-teal-600">online learning</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Expert Instructors</h3>
                    <p className="text-gray-600">
                      Learn from industry professionals with years of experience. Our instructors are vetted experts in their fields.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Flexible Schedule</h3>
                    <p className="text-gray-600">
                      Learn at your own pace, anytime, anywhere. Access course materials 24/7 from any device.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Certification</h3>
                    <p className="text-gray-600">
                      Get industry-recognized certificates upon completion. Boost your resume with verifiable credentials.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section id="courses-section" className="py-20 bg-gradient-to-b from-[#032E3F] to-[#0878A5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Our Popular Courses</h2>
            <p className="text-gray-200">
              Join thousands of students learning with our most popular courses
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {popularCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-gradient-to-br from-teal-600 to-cyan-500 h-48 flex items-center justify-center">
                  <div className="text-white text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <h3 className="text-xl font-semibold">{course.category}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-teal-600 font-medium">{course.category}</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Master the skills needed for modern {course.category.toLowerCase()} with hands-on projects and real-world examples.
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{course.rating}</span>
                    </div>
                    <div className="text-sm text-gray-600">{course.students.toLocaleString()} students</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-teal-600">{course.instructor.split(' ')[0][0]}{course.instructor.split(' ')[1][0]}</span>
                      </div>
                      <span className="text-sm text-gray-700">{course.instructor}</span>
                    </div>
                    <div className="text-xl font-bold text-teal-600">{course.price}</div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        onNavigate('signup');
                      } else {
                        alert(`Enrolling in ${course.title}`);
                      }
                    }}
                    className="w-full mt-6 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
                  >
                    {isLoggedIn ? 'Enroll Now' : 'Sign Up to Enroll'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('courses')}
              className="px-8 py-3 bg-white text-[#032E3F] rounded-lg hover:bg-gray-100 font-medium"
            >
              View All Courses
            </button>
          </div>
        </div>
      </section>

      {/* Study From Home */}
      <section className="py-20 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="/src/assets/Group 119.png"
                alt="Study from home"
                className="rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Study From Home With <span className="text-teal-600">Expert Instructors</span>
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Learning with experts allows a range of topics and learning from different perspectives and instructors. Our platform connects you with industry professionals who bring real-world experience to your learning journey.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span>Live interactive sessions with instructors</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span>Personalized feedback on assignments</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span>24/7 access to course materials</span>
                </li>
              </ul>
              <button 
                onClick={() => {
                  alert('Playing introductory video');
                }}
                className="flex items-center gap-3 text-teal-600 font-medium hover:text-teal-700"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition">
                  <Play className="w-6 h-6 ml-1" />
                </div>
                <div className="text-left">
                  <span className="font-semibold">Watch Video</span>
                  <p className="text-sm text-gray-600">See how our platform works</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials-section" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Student Testimonials</h2>
            <p className="text-gray-600">
              Hear from our successful students who transformed their careers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                    <span className="font-bold text-teal-600">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
          
          {/* Instructor CTA */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Become an Instructor</h3>
            <p className="mb-6 max-w-2xl mx-auto">
              Share your knowledge and earn money by teaching on our platform. Join our community of expert instructors.
            </p>
            <button
              onClick={() => onNavigate('signup')}
              className="px-8 py-3 bg-white text-teal-600 rounded-lg hover:bg-gray-100 font-medium"
            >
              Start Teaching Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
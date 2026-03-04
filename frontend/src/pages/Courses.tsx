import { Search, BookOpen, Clock, Users, Star, Filter, ArrowRight } from 'lucide-react';
import type { Page } from '../types';
import Header from '../components/Header';

interface CoursesProps {
  onNavigate: (page: Page) => void;
}

export default function Courses({ onNavigate }: CoursesProps) {
  // Example course data - tum baad mein real data se replace kar sakti ho
  const courses = [
    {
      id: 1,
      title: 'Complete Web Development Bootcamp',
      category: 'Development',
      instructor: 'John Doe',
      rating: 4.8,
      students: 12450,
      duration: '32 hours',
      price: '$89',
      level: 'Beginner to Advanced',
      thumbnail: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
      id: 2,
      title: 'React & Next.js Masterclass',
      category: 'Frontend',
      instructor: 'Sarah Johnson',
      rating: 4.9,
      students: 8920,
      duration: '28 hours',
      price: '$99',
      level: 'Intermediate',
      thumbnail: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
      id: 3,
      title: 'Python for Data Science & Machine Learning',
      category: 'Data Science',
      instructor: 'Dr. Ahmed Khan',
      rating: 4.7,
      students: 15670,
      duration: '45 hours',
      price: '$129',
      level: 'All Levels',
      thumbnail: 'bg-gradient-to-br from-green-500 to-teal-500'
    },
    {
      id: 4,
      title: 'UI/UX Design with Figma',
      category: 'Design',
      instructor: 'Fatima Ali',
      rating: 4.9,
      students: 11340,
      duration: '24 hours',
      price: '$79',
      level: 'Beginner',
      thumbnail: 'bg-gradient-to-br from-orange-500 to-red-500'
    },
    {
      id: 5,
      title: 'Mobile App Development with Flutter',
      category: 'Mobile',
      instructor: 'Omar Farooq',
      rating: 4.8,
      students: 9870,
      duration: '38 hours',
      price: '$109',
      level: 'Intermediate',
      thumbnail: 'bg-gradient-to-br from-indigo-500 to-purple-500'
    },
    {
      id: 6,
      title: 'Full Stack MERN Developer',
      category: 'Full Stack',
      instructor: 'Ayesha Siddiqa',
      rating: 4.9,
      students: 21000,
      duration: '50 hours',
      price: '$149',
      level: 'Advanced',
      thumbnail: 'bg-gradient-to-br from-pink-500 to-rose-500'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <Header currentPage="courses" onNavigate={onNavigate} />
      
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-r from-teal-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Explore Our Courses</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto mb-10">
            Learn from industry experts with hands-on projects. Choose from 200+ high-quality courses.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
              <input
                type="text"
                placeholder="Search courses... (e.g., Web Development, Python, Design)"
                className="w-full pl-16 pr-6 py-5 rounded-full text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white text-teal-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
                Search
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-lg">
            <div>📚 200+ Courses</div>
            <div>👨‍🏫 50+ Expert Instructors</div>
            <div>🌟 4.8 Average Rating</div>
            <div>👥 60K+ Happy Students</div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-6 py-3 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 transition flex items-center gap-2">
              <Filter className="w-5 h-5" />
              All Categories
            </button>
            {['Development', 'Design', 'Data Science', 'Mobile', 'Business', 'Marketing'].map((cat) => (
              <button key={cat} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-teal-100 hover:text-teal-700 transition">
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-4 transition-all duration-300">
                {/* Thumbnail */}
                <div className={`h-48 ${course.thumbnail} flex items-center justify-center`}>
                  <BookOpen className="w-20 h-20 text-white opacity-80" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-teal-600 bg-teal-100 px-3 py-1 rounded-full">
                      {course.category}
                    </span>
                    <span className="text-sm text-gray-500">{course.level}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">by {course.instructor}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{course.rating}</span>
                      <span className="text-sm text-gray-500">({course.students.toLocaleString()} students)</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{course.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-teal-600">{course.price}</span>
                    <button className="px-6 py-3 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 transition flex items-center gap-2">
                      Enroll Now
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-10 py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition">
              Load More Courses →
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Start Your Learning Journey Today
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join 60,000+ students who are already transforming their careers with LearnHub.
          </p>
          <button
            onClick={() => onNavigate('signup')}
            className="px-12 py-6 bg-white text-teal-600 rounded-full font-bold text-2xl shadow-2xl hover:shadow-xl hover:scale-110 transition transform"
          >
            Browse All Courses
          </button>
        </div>
      </section>
    </div>
  );
}
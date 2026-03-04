import { BookOpen, Users, DollarSign, Globe, Award, Clock, Star, ArrowRight } from 'lucide-react';
import type { Page } from '../types';

interface TutorProps {
  onNavigate: (page: Page) => void;
}

export default function Tutor({ onNavigate }: TutorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Warm & Inviting */}
      <section className="py-24 bg-gradient-to-r from-teal-500 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Become a LearnHub Tutor
          </h1>
          <p className="text-xl md:text-2xl opacity-95 max-w-4xl mx-auto mb-10">
            Inspire thousands of students worldwide. Share your expertise, build your brand, and earn money doing what you love.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => onNavigate('signup')}
              className="px-10 py-5 bg-white text-teal-600 rounded-full font-bold text-xl shadow-2xl hover:shadow-xl hover:scale-105 transition transform"
            >
              Start Teaching Today → 
            </button>
            <button className="px-8 py-5 border-4 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-teal-600 transition">
              Watch How It Works
            </button>
          </div>
          <div className="mt-12 flex justify-center gap-12 text-lg opacity-90">
            <div>🌍 60K+ Students</div>
            <div>📚 200+ Courses</div>
            <div>💰 Top Tutors Earn $10K+/month</div>
          </div>
        </div>
      </section>

      {/* Why Teach Section - Cards with Icons */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Thousands of Experts Teach on LearnHub
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join a supportive community that helps you create impactful courses and grow your audience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center hover:shadow-2xl hover:-translate-y-3 transition transform">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Earn Money</h3>
              <p className="text-gray-600 leading-relaxed">
                Set your own prices and earn up to 97% revenue share. Top instructors make $5,000–$20,000+ per month.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center hover:shadow-2xl hover:-translate-y-3 transition transform">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Global Reach</h3>
              <p className="text-gray-600 leading-relaxed">
                Teach students from 190+ countries. Your course can impact lives worldwide.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center hover:shadow-2xl hover:-translate-y-3 transition transform">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Supportive Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Get help from our teaching center, instructor community, and dedicated support team.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center hover:shadow-2xl hover:-translate-y-3 transition transform">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy to Create</h3>
              <p className="text-gray-600 leading-relaxed">
                Simple tools to record videos, add quizzes, assignments, and resources — no technical skills needed.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center hover:shadow-2xl hover:-translate-y-3 transition transform">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Build Your Brand</h3>
              <p className="text-gray-600 leading-relaxed">
                Grow your personal brand, get verified badge, and become a recognized expert in your field.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center hover:shadow-2xl hover:-translate-y-3 transition transform">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Teach on Your Schedule</h3>
              <p className="text-gray-600 leading-relaxed">
                Create courses once and earn passive income forever. No fixed teaching hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Success Stories from Our Tutors</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6">"I made $15,000 in my first year while working full-time!"</p>
              <p className="font-semibold">— Ahmed Khan, Web Development Tutor</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6">"LearnHub helped me quit my job and teach full-time. Best decision ever!"</p>
              <p className="font-semibold">— Fatima Ali, Graphic Design Expert</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6">"My course has 10,000+ students. I never imagined this reach!"</p>
              <p className="font-semibold">— Omar Farooq, Data Science Tutor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Inspire the Next Generation?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join thousands of successful instructors and start creating your course today.
          </p>
          <button
            onClick={() => onNavigate('signup')}
            className="px-12 py-6 bg-white text-teal-600 rounded-full font-bold text-2xl shadow-2xl hover:shadow-xl hover:scale-110 transition transform inline-flex items-center gap-4"
          >
            Apply to Teach Now
            <ArrowRight className="w-8 h-8" />
          </button>
        </div>
      </section>
    </div>
  );
}
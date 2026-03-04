import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import type { Page } from '../types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#032E3F] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Company Info & Logo */}
          <div>
            <div className="flex items-center space-x-4 mb-6">
              {/* New Gradient Logo - Green to Blue */}
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-3xl font-bold text-white">L</span>
              </div>
              <div>
                <span className="text-3xl font-bold tracking-tight">
                  LearnHub
                </span>
                <p className="text-sm text-gray-300 -mt-1">Smart Learning Platform</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              We are passionate about revolutionizing education through AI-powered adaptive and interactive video learning experiences.
            </p>
            <div className="flex space-x-4">
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Linkedin className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="font-bold text-lg mb-5">Useful Links</h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-white transition">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('courses')} className="hover:text-white transition">
                  Courses
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tutor')} className="hover:text-white transition">
                  Become Tutor
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Latest Posts */}
          <div>
            <h3 className="font-bold text-lg mb-5">Latest Posts</h3>
            <ul className="space-y-3 text-gray-300">
              <li><button className="hover:text-white transition">The Future of AI in Education</button></li>
              <li><button className="hover:text-white transition">Adaptive Learning Explained</button></li>
              <li><button className="hover:text-white transition">Interactive Video Best Practices</button></li>
              <li><button className="hover:text-white transition">Student Success Stories</button></li>
            </ul>
          </div>

          {/* Contact Info - Icons add kiye */}
          <div>
            <h3 className="font-bold text-lg mb-5">Contact Us</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                <span>123 Learning Street, EduCity, Pakistan</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <span>info@learnhub.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
          <p>&copy; 2025 LearnHub. All rights reserved. Powered by AI.</p>
        </div>
      </div>
    </footer>
  );
}
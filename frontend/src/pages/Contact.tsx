import { Mail, Phone, MapPin, Send, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import type { Page } from '../types';
import Header from '../components/Header';

interface ContactProps {
  onNavigate: (page: Page) => void;
}

export default function Contact({ onNavigate }: ContactProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Your message has been sent successfully! We will get back to you soon. 😊');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <Header currentPage="contact" onNavigate={onNavigate} />
      
      {/* Hero Section - Beautiful Gradient */}
      <section className="py-24 bg-gradient-to-r from-teal-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Have questions about our courses? Need help? We're here 24/7 to assist you on your learning journey.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      placeholder="Saeeeda"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      placeholder="Khan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    placeholder="saeeeda@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition">
                    <option>General Inquiry</option>
                    <option>Course Information</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                    <option>Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Message</label>
                  <textarea
                    rows={6}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
                    placeholder="Write your message here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold text-lg rounded-xl hover:opacity-90 transition flex items-center justify-center gap-3 shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info & Map */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-5 bg-white p-6 rounded-xl shadow-lg">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">Email</h3>
                      <p className="text-gray-600">support@learnhub.com</p>
                      <p className="text-gray-600">info@learnhub.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 bg-white p-6 rounded-xl shadow-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">Phone</h3>
                      <p className="text-gray-600">+92 300 1234567</p>
                      <p className="text-gray-600">+92 333 9876543</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 bg-white p-6 rounded-xl shadow-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">Office Address</h3>
                      <p className="text-gray-600">123 Learning Street</p>
                      <p className="text-gray-600">Lahore, Punjab, Pakistan</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a href="#" className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 transition">
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                    <Twitter className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition">
                    <Linkedin className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center hover:opacity-90 transition">
                    <Instagram className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
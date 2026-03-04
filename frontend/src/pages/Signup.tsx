import { FormEvent, useState } from 'react';
import type { Page } from '../types';
import { useUser } from '../context/UserContext';
import { apiClient } from '../utils/apiClient';
import { validateSignupForm, formatValidationErrors } from '../utils/validation';
import Header from '../components/Header';

interface SignupProps {
  onNavigate: (page: Page) => void;
}

export default function Signup({ onNavigate }: SignupProps) {
  const { login } = useUser();
  const [role, setRole] = useState<"student" | "tutor">("student");
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate input
    const validation = validateSignupForm(name, email, password, role);
    if (!validation.isValid) {
      setError(formatValidationErrors(validation.errors));
      setLoading(false);
      return;
    }

    try {
      const data = await apiClient.post<{
        user: any;
        token: string;
        message: string;
      }>('/api/auth/signup', { name: name.trim(), email, password, role }, { skipAuth: true });

      // Use UserContext login method
      login(data.user, data.token);

      let redirectPage: Page = 'landing' as Page;
      if (data.user.role === 'student') redirectPage = 'studentDashboard' as Page;
      if (data.user.role === 'tutor') redirectPage = 'tutorDashboard' as Page;

      onNavigate(redirectPage);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Network error. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header currentPage="signup" onNavigate={onNavigate} />
      
      <div className="flex-1 flex items-center justify-center p-4 relative">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl grid md:grid-cols-2 overflow-hidden">

        {/* Left Side - Role Selection */}
        <div className="bg-[#032E3F] p-10 flex flex-col justify-center space-y-6">
          <h2 className="text-3xl font-bold text-white text-center">Sign up as</h2>
          <div className="space-y-4">
            <button
              onClick={() => setRole("student")}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                role === "student" ? "bg-white text-[#032E3F]" : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setRole("tutor")}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                role === "tutor" ? "bg-white text-[#032E3F]" : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Tutor
            </button>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-10">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Create Account as <span className="text-teal-600 capitalize">{role}</span>
          </h1>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate("login")}
              className="text-teal-600 font-semibold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
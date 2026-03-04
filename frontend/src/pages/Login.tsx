import { FormEvent, useState } from 'react';
import type { Page } from '../types';
import { useUser } from '../context/UserContext';
import { apiClient } from '../utils/apiClient';
import { validateLoginForm, formatValidationErrors } from '../utils/validation';
import Header from '../components/Header';

interface LoginProps {
  onNavigate: (page: Page) => void;
  setUser?: (user: any) => void;
}

export default function Login({ onNavigate, setUser }: LoginProps) {
  const { login } = useUser();
  const [role, setRole] = useState<"student" | "tutor">("student");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Login attempt:', { email, role });

    // Validate input
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setError(formatValidationErrors(validation.errors));
      setLoading(false);
      return;
    }

    try {
      console.log('Sending login request to /api/auth/login');
      const data = await apiClient.post<{
        user: any;
        token: string;
        message: string;
      }>('/api/auth/login', { email, password, role }, { skipAuth: true });

      console.log('Login response received:', data);
      console.log('User data:', data.user);
      console.log('Token received:', data.token ? 'Yes' : 'No');

      if (!data || !data.user || !data.token) {
        console.error('Invalid response structure:', data);
        setError('Invalid response from server. Please try again.');
        setLoading(false);
        return;
      }

      if (data.user.role !== role) {
        console.warn('Role mismatch:', { expected: role, received: data.user.role });
        setError(`Invalid credentials for ${role}. Please select the correct role or check your credentials.`);
        setLoading(false);
        return;
      }

      console.log('Calling UserContext login method');
      // Use UserContext login method - this updates the user state
      login(data.user, data.token);
      console.log('UserContext login completed');
      
      // Optional: Keep for backward compatibility if setUser prop is provided
      if (setUser) {
        setUser(data.user);
      }

      // Navigate immediately - App.tsx useEffect will also handle redirect as backup
      console.log('Navigating to dashboard for role:', data.user.role);
      if (data.user.role === 'student') {
        onNavigate('studentDashboard');
        localStorage.setItem('currentPage', 'studentDashboard');
      } else if (data.user.role === 'tutor') {
        onNavigate('tutorDashboard');
        localStorage.setItem('currentPage', 'tutorDashboard');
      }
      console.log('Navigation completed');
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        code: err.code,
        details: err.details
      });
      
      // Provide more specific error messages
      if (err.status === 401) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (err.status === 400) {
        setError(err.message || 'Invalid request. Please check your input.');
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Network error. Please make sure the server is running on http://localhost:5000');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header currentPage="login" onNavigate={onNavigate} />
      
      <div className="flex-1 flex items-center justify-center p-4 relative">

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl grid md:grid-cols-2 overflow-hidden">

        {/* Left Side - Role Selection */}
        <div className="bg-[#032E3F] p-10 flex flex-col justify-center space-y-6">
          <h2 className="text-3xl font-bold text-white text-center">Login as</h2>
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
            Login as <span className="text-teal-600 capitalize">{role}</span>
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
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
                placeholder="Enter your password"
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
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => onNavigate("signup")}
              className="text-teal-600 font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}

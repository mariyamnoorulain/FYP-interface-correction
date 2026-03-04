import { ReactNode, useState, useEffect } from 'react';
import { User, LogOut, Menu, X } from 'lucide-react';
import type { Page } from '../types';
import { getUserName } from '../utils/userHelper';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
}

interface DashboardLayoutProps {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigate: (page: Page) => void;
  menuItems: MenuItem[];
  children: ReactNode;
}

export default function DashboardLayout({
  user,
  activeTab,
  setActiveTab,
  onNavigate,
  menuItems,
  children
}: DashboardLayoutProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load profile photo from API based on role
  useEffect(() => {
    const loadProfilePhoto = async () => {
      if (!user) return;

      if (user.role === 'student') {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await fetch('http://localhost:5000/api/students/profile/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const data = await response.json();
            setProfilePhoto(data.photo || null);
          }
        } catch (error) {
          console.error('Error loading profile photo:', error);
          setProfilePhoto(null);
        }
      } else if (user.role === 'tutor') {
        // Existing logic for tutor uses passed prop or we can fetch if needed, 
        // but let's stick to the pattern:
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await fetch('http://localhost:5000/api/tutors/profile/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const data = await response.json();
            setProfilePhoto(data.photo || null);
          }
        } catch (error) {
          console.error('Error loading tutor photo:', error);
        }
      }
    };

    // Load initially
    loadProfilePhoto();

    // Listen for custom event (when profile is updated in same tab)
    const handleProfileUpdate = (e: any) => {
      // Optimistically update if payload has photo, otherwise re-fetch
      if (e.detail && e.detail.photo !== undefined) {
        setProfilePhoto(e.detail.photo);
      } else {
        loadProfilePhoto();
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  // Refresh when activeTab changes to profile handled by the mount effect mostly, 
  // but if we want to ensure freshness:
  useEffect(() => {
    if (activeTab === 'profile') {
      // Trigger a reload
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: {} }));
    }
  }, [activeTab]);

  const logout = () => {
    localStorage.removeItem('user');
    setShowProfileDropdown(false);
    onNavigate('landing');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. TOP NAVBAR (Simplified) */}
      <header className="h-16 bg-[#032E3F] text-white fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="flex items-center justify-between h-full px-6">

          {/* Left: Logo & Mobile Toggle */}
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => onNavigate('landing')}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded flex items-center justify-center">
                <span className="text-xl font-bold text-white">L</span>
              </div>
              <span className="text-xl font-bold tracking-tight hidden sm:block">
                LearnHub
              </span>
            </div>
          </div>

          {/* Right: Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-3 hover:bg-white/10 px-3 py-2 rounded-lg transition"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{getUserName(user)}</p>
                <p className="text-xs text-gray-300 capitalize">{user?.role || 'Member'}</p>
              </div>
              {profilePhoto ? (
                <img
                  key={refreshKey}
                  src={profilePhoto}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-teal-400"
                  onError={() => {
                    // If image fails to load, fall back to icon
                    setProfilePhoto(null);
                  }}
                />
              ) : (
                <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center border-2 border-teal-400">
                  <User className="w-5 h-5" />
                </div>
              )}
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 text-gray-700 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'Member'}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT (Sidebar + Content) */}
      <div className="flex flex-1 pt-16">

        {/* LEFT SIDEBAR (Fixed) */}
        <aside className={`
          fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-200 ease-in-out z-40 overflow-y-auto
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4 mt-2">
              Menu
            </p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false); // Close mobile menu on click
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${activeTab === item.id
                    ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <item.icon size={20} className={activeTab === item.id ? 'text-teal-600' : 'text-gray-600'} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 bg-gray-50 p-6 md:p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
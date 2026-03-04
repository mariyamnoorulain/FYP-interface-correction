import { useEffect, useState } from 'react';
import { 
  User, Users, BookOpen, DollarSign, Settings, 
  FileText, BarChart, Bell, LogOut, Home,
  Shield, UserCheck, Calendar, TrendingUp,
  MessageSquare, Mail, Eye, Edit, Trash2
} from 'lucide-react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { Page } from '../types';

interface Props {
  onNavigate: (page: Page) => void;
}

interface UserType {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  lastLogin: string;
}

interface Course {
  id: number;
  title: string;
  instructor: string;
  category: string;
  students: number;
  status: 'published' | 'pending' | 'draft';
  revenue: number;
  createdDate: string;
}

export default function AdminDashboard({ onNavigate }: Props) {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Mock data
  const [users, setUsers] = useState<UserType[]>([
    { id: 1, name: 'Ali Ahmed', email: 'ali@example.com', role: 'student', status: 'active', joinedDate: '2024-01-15', lastLogin: '2024-02-10' },
    { id: 2, name: 'Fatima Khan', email: 'fatima@example.com', role: 'teacher', status: 'active', joinedDate: '2024-01-10', lastLogin: '2024-02-09' },
    { id: 3, name: 'Zainab Malik', email: 'zainab@example.com', role: 'student', status: 'pending', joinedDate: '2024-02-01', lastLogin: '2024-02-01' },
    { id: 4, name: 'Omar Farooq', email: 'omar@example.com', role: 'teacher', status: 'inactive', joinedDate: '2023-12-20', lastLogin: '2024-01-15' },
    { id: 5, name: 'Sara Shah', email: 'sara@example.com', role: 'student', status: 'active', joinedDate: '2024-01-05', lastLogin: '2024-02-11' },
    { id: 6, name: 'Bilal Raza', email: 'bilal@example.com', role: 'admin', status: 'active', joinedDate: '2023-11-15', lastLogin: '2024-02-12' },
  ]);

  const [courses, setCourses] = useState<Course[]>([
    { id: 1, title: 'AI Powered Learning', instructor: 'Dr. Fariha', category: 'Computer Science', students: 245, status: 'published', revenue: 2450, createdDate: '2024-01-10' },
    { id: 2, title: 'Web Development', instructor: 'Ms. Sara', category: 'Web Dev', students: 189, status: 'published', revenue: 1890, createdDate: '2024-01-12' },
    { id: 3, title: 'Data Science', instructor: 'Mr. Ali', category: 'Data Science', students: 156, status: 'pending', revenue: 0, createdDate: '2024-02-01' },
    { id: 4, title: 'Digital Marketing', instructor: 'Ms. Zainab', category: 'Marketing', students: 132, status: 'published', revenue: 1320, createdDate: '2024-01-20' },
    { id: 5, title: 'Graphic Design', instructor: 'Mr. Ahmed', category: 'Design', students: 98, status: 'draft', revenue: 0, createdDate: '2024-02-05' },
    { id: 6, title: 'Mobile Development', instructor: 'Ms. Fatima', category: 'Mobile Dev', students: 176, status: 'published', revenue: 1760, createdDate: '2024-01-25' },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    onNavigate('landing');
  };

  // Stats calculations
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalTeachers = users.filter(u => u.role === 'teacher').length;
  const totalCourses = courses.length;
  const totalRevenue = courses.reduce((sum, course) => sum + course.revenue, 0);
  const pendingCourses = courses.filter(c => c.status === 'pending').length;
  const activeUsers = users.filter(u => u.status === 'active').length;

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold text-teal-600 mt-2">{totalStudents}</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">+12% from last month</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Instructors</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{totalTeachers}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">+5% from last month</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Courses</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{totalCourses}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">{pendingCourses} pending approval</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Revenue</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">${totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">+24% from last month</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <BarChart className="w-6 h-6 mr-2 text-teal-600" />
                  Platform Statistics
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Active Users', value: activeUsers, total: users.length, color: 'bg-teal-500' },
                    { label: 'Published Courses', value: courses.filter(c => c.status === 'published').length, total: courses.length, color: 'bg-blue-500' },
                    { label: 'Pending Actions', value: pendingCourses + users.filter(u => u.status === 'pending').length, total: 20, color: 'bg-yellow-500' },
                    { label: 'Monthly Growth', value: 24, total: 100, color: 'bg-green-500' },
                  ].map((stat, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{stat.label}</span>
                        <span className="font-bold">{stat.value}/{stat.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${stat.color}`} 
                          style={{ width: `${(stat.value / stat.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Bell className="w-6 h-6 mr-2 text-blue-600" />
                  Recent Activities
                </h3>
                <div className="space-y-4">
                  {[
                    { activity: 'New student registered', time: '10 minutes ago', type: 'user' },
                    { activity: 'Course "Web Development" approved', time: '2 hours ago', type: 'course' },
                    { activity: 'Revenue milestone reached', time: '1 day ago', type: 'revenue' },
                    { activity: 'System maintenance scheduled', time: '2 days ago', type: 'system' },
                    { activity: 'New instructor joined', time: '3 days ago', type: 'user' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'user' ? 'bg-teal-100' :
                        activity.type === 'course' ? 'bg-blue-100' :
                        activity.type === 'revenue' ? 'bg-green-100' :
                        'bg-yellow-100'
                      }`}>
                        {activity.type === 'user' && <User className="w-4 h-4 text-teal-600" />}
                        {activity.type === 'course' && <BookOpen className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'revenue' && <DollarSign className="w-4 h-4 text-green-600" />}
                        {activity.type === 'system' && <Settings className="w-4 h-4 text-yellow-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.activity}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Manage Users', icon: Users, color: 'bg-teal-600', action: () => setActiveTab('users') },
                  { title: 'Course Approval', icon: BookOpen, color: 'bg-blue-600', action: () => setActiveTab('courses') },
                  { title: 'View Reports', icon: BarChart, color: 'bg-purple-600', action: () => alert('Opening Reports') },
                  { title: 'System Settings', icon: Settings, color: 'bg-gray-600', action: () => alert('Opening Settings') },
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`${action.color} p-6 rounded-lg text-white hover:opacity-90 transition flex flex-col items-center justify-center space-y-3`}
                  >
                    <action.icon className="w-8 h-8" />
                    <span className="font-medium">{action.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Add New User
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' :
                            user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.joinedDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button className="text-teal-600 hover:text-teal-900">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'courses':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Course Management</h2>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Add New Course
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      course.status === 'published' ? 'bg-green-100 text-green-800' :
                      course.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status}
                    </span>
                    <span className="text-sm text-gray-500">{course.createdDate}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.instructor} • {course.category}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Students</p>
                      <p className="text-lg font-bold">{course.students}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Revenue</p>
                      <p className="text-lg font-bold text-green-600">${course.revenue}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {course.status === 'pending' && (
                      <>
                        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          Approve
                        </button>
                        <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                          Reject
                        </button>
                      </>
                    )}
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Revenue Trends</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Revenue Chart Placeholder</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">User Growth</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Growth Chart Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Welcome to Admin Panel</h2>
            <p className="text-gray-600">Select a section from the sidebar to get started</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Custom Admin Header */}
      <header className="sticky top-0 z-50 bg-[#032E3F] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-teal-200">Welcome back, {user?.name || 'Administrator'}!</p>
              </div>
            </div>

            {/* Admin Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-teal-500 text-white' : 'text-white hover:bg-teal-500/20'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'users' ? 'bg-teal-500 text-white' : 'text-white hover:bg-teal-500/20'}`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'courses' ? 'bg-teal-500 text-white' : 'text-white hover:bg-teal-500/20'}`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'reports' ? 'bg-teal-500 text-white' : 'text-white hover:bg-teal-500/20'}`}
              >
                Reports
              </button>
            </div>

            {/* Admin Profile Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 p-2 hover:bg-teal-500/20 rounded-lg transition"
                >
                  <div className="w-10 h-10 bg-teal-100/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="hidden md:inline font-medium">{user?.name?.split(' ')[0] || 'Admin'}</span>
                </button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border z-50">
                    <div className="p-4 border-b">
                      <p className="font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        Administrator
                      </span>
                    </div>
                    <div className="py-2">
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Settings
                      </button>
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </button>
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 flex items-center">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                      </button>
                      <div className="border-t my-2"></div>
                      <button 
                        onClick={logout}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation for Admin */}
          <div className="md:hidden mt-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === 'overview' ? 'bg-teal-500 text-white' : 'bg-teal-500/20 text-white'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === 'users' ? 'bg-teal-500 text-white' : 'bg-teal-500/20 text-white'}`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === 'courses' ? 'bg-teal-500 text-white' : 'bg-teal-500/20 text-white'}`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === 'reports' ? 'bg-teal-500 text-white' : 'bg-teal-500/20 text-white'}`}
              >
                Reports
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {renderContent()}
        </div>
      </main>

      {/* Logout Button */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <button
          onClick={logout}
          className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center space-x-2 shadow-lg transition hover:shadow-xl"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout from Admin Account</span>
        </button>
      </div>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
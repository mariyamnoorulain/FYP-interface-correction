import { useState, useEffect, useRef } from 'react';
import {
  Upload, Video, FileText, Play, Download,
  Trash2, Clock, BookOpen, LayoutDashboard, ArrowLeft,
  X, CheckCircle, AlertCircle, Loader2, Calendar, Star,
  TrendingUp, MessageSquare, Settings, BarChart3
} from 'lucide-react';
import type { Page } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import { getUserId, getUserRole, normalizeUser } from '../utils/userHelper';

interface Lecture {
  id: string;
  title: string;
  duration: string;
  uploadDate: string;
  videoUrl?: string;
  tutorId?: string;
  courseId?: string; // Storing course name here since backend stores string
}

interface Material {
  id: string;
  title: string;
  type: string;
  size: string;
  uploadDate: string;
  downloadUrl?: string;
  tutorId?: string;
  courseId?: string;
}

interface Props {
  onNavigate: (page: Page) => void;
  userRole: 'student' | 'tutor';
}

export default function CourseManagement({ onNavigate, userRole }: Props) {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showLectureUpload, setShowLectureUpload] = useState(false);
  const [showMaterialUpload, setShowMaterialUpload] = useState(false);

  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureDuration, setLectureDuration] = useState('');
  const [courseName, setCourseName] = useState(''); // New state for Course Name
  const [lectureFile, setLectureFile] = useState<File | null>(null);
  const [isUploadingLecture, setIsUploadingLecture] = useState(false);
  const [lectureUploadProgress, setLectureUploadProgress] = useState(0);
  const [lectureUploadError, setLectureUploadError] = useState('');
  const [showLectureSuccessToast, setShowLectureSuccessToast] = useState(false);
  const [lectureSuccessMessage, setLectureSuccessMessage] = useState('');
  const lectureFileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingLecture, setIsDraggingLecture] = useState(false);

  const [materialTitle, setMaterialTitle] = useState('');
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const parsedUser = JSON.parse(saved);
      const normalizedUser = normalizeUser(parsedUser);
      setUser(normalizedUser);

      // Load lectures and materials from backend
      const userId = getUserId(normalizedUser);
      if (getUserRole(normalizedUser) === 'tutor') {
        // Tutors must only see their own content; if no userId, show nothing
        if (!userId) {
          setLectures([]);
          setMaterials([]);
          return;
        }
        loadLectures(userId);
        loadMaterials(userId);
      } else {
        // For students, only load materials/lectures from enrolled courses
        loadLecturesForStudent();
        loadMaterialsForStudent();
      }
    }

    // Store the previous page when entering course management (only for tutors or standalone access)
    // Students accessing from StudentDashboard don't need this
    if (userRole === 'tutor' && !localStorage.getItem('courseManagementPreviousPage')) {
      const previousPage = localStorage.getItem('currentPage');
      if (previousPage && (previousPage === 'studentDashboard' || previousPage === 'tutorDashboard')) {
        localStorage.setItem('courseManagementPreviousPage', previousPage);
      } else {
        localStorage.setItem('courseManagementPreviousPage', 'tutorDashboard');
      }
    }
  }, [userRole]);

  const loadLectures = async (tutorId?: string) => {
    try {
      const params = new URLSearchParams();
      if (tutorId) {
        params.append('tutorId', tutorId);
      } else {
        params.append('isPublished', 'true'); // For students, only show published
      }

      const response = await fetch(`http://localhost:5000/api/lectures?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded lectures:', data);
        const formattedLectures = data.map((l: any) => ({
          id: l._id,
          title: l.title,
          duration: l.duration || 'N/A',
          uploadDate: new Date(l.createdAt).toLocaleDateString(),
          videoUrl: `/api/lectures/${l._id}/video`,
          tutorId: l.tutorId?._id || l.tutorId,
          courseId: l.courseId // Map courseId (name)
        }));
        console.log('Formatted lectures:', formattedLectures);
        setLectures(formattedLectures);
      } else {
        console.error('Failed to load lectures:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading lectures:', error);
    }
  };

  const loadMaterials = async (tutorId?: string) => {
    try {
      const params = new URLSearchParams();
      if (tutorId) {
        params.append('tutorId', tutorId);
      } else {
        params.append('isPublished', 'true'); // For students, only show published
      }

      const response = await fetch(`http://localhost:5000/api/materials?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded materials:', data);
        const formattedMaterials = data.map((m: any) => ({
          id: m._id,
          title: m.title,
          type: m.fileType.toUpperCase(),
          size: `${(m.fileSize / (1024 * 1024)).toFixed(2)} MB`,
          uploadDate: new Date(m.createdAt).toLocaleDateString(),
          downloadUrl: `/api/materials/${m._id}/download`,
          tutorId: m.tutorId?._id || m.tutorId
        }));
        console.log('Formatted materials:', formattedMaterials);
        setMaterials(formattedMaterials);
      } else {
        console.error('Failed to load materials:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  // Load lectures for students - only from enrolled courses
  const loadLecturesForStudent = async () => {
    try {
      // Check if a specific course was selected
      const selectedTutorId = localStorage.getItem('selectedCourseTutorId');

      if (selectedTutorId) {
        // Load lectures only from the selected course's tutor
        try {
          const response = await fetch(`http://localhost:5000/api/lectures?tutorId=${selectedTutorId}`);
          if (response.ok) {
            const data = await response.json();
            const formattedLectures = data.map((lecture: any) => ({
              id: lecture._id,
              title: lecture.title,
              duration: lecture.duration || '0:00',
              uploadDate: new Date(lecture.createdAt).toLocaleDateString(),
              videoUrl: `/api/lectures/${lecture._id}/video`,
              courseId: lecture.courseId || ''
            }));
            setLectures(formattedLectures);
          }
        } catch (error) {
          console.error('Error fetching lectures for selected course:', error);
          setLectures([]);
        }
        return;
      }

      // Fallback: Get enrolled courses from localStorage (for overview)
      const savedEnrolled = localStorage.getItem('enrolledCourses');
      if (!savedEnrolled) {
        setLectures([]);
        return;
      }

      const enrolledCourses = JSON.parse(savedEnrolled);
      if (!enrolledCourses || enrolledCourses.length === 0) {
        setLectures([]);
        return;
      }

      // Extract tutorIds from enrolled courses
      const enrolledTutorIds = enrolledCourses
        .map((course: any) => course.tutorId)
        .filter((id: string) => id); // Remove null/undefined

      if (enrolledTutorIds.length === 0) {
        setLectures([]);
        return;
      }

      // Fetch lectures from all enrolled tutors
      // Note: For enrolled students, show all content (published or not) from their enrolled tutors
      const allLectures: any[] = [];
      for (const tutorId of enrolledTutorIds) {
        try {
          // First try to get published lectures
          let response = await fetch(`http://localhost:5000/api/lectures?tutorId=${tutorId}&isPublished=true`);
          if (response.ok) {
            const data = await response.json();
            allLectures.push(...data);
          }
          // Also get unpublished lectures for enrolled students (they should see all content)
          response = await fetch(`http://localhost:5000/api/lectures?tutorId=${tutorId}&isPublished=false`);
          if (response.ok) {
            const data = await response.json();
            // Filter out duplicates
            const existingIds = new Set(allLectures.map(l => l._id));
            allLectures.push(...data.filter((l: any) => !existingIds.has(l._id)));
          }
        } catch (error) {
          console.error(`Error loading lectures for tutor ${tutorId}:`, error);
        }
      }

      // Set lectures with tutorId for filtering
      // Handle both populated and non-populated tutorId
      setLectures(allLectures.map((l: any) => {
        let tutorIdValue = l.tutorId;
        if (typeof tutorIdValue === 'object' && tutorIdValue !== null) {
          tutorIdValue = tutorIdValue._id || tutorIdValue.toString();
        }
        return {
          id: l._id,
          title: l.title,
          duration: l.duration || '0:00',
          uploadDate: new Date(l.createdAt || Date.now()).toLocaleDateString(),
          videoUrl: `/api/lectures/${l._id}/video`,
          tutorId: tutorIdValue ? tutorIdValue.toString() : undefined
        };
      }));
    } catch (error) {
      console.error('Error loading lectures for student:', error);
      setLectures([]);
    }
  };

  // Load materials for students - only from enrolled courses
  const loadMaterialsForStudent = async () => {
    try {
      // Get enrolled courses from localStorage
      const savedEnrolled = localStorage.getItem('enrolledCourses');
      if (!savedEnrolled) {
        setMaterials([]);
        return;
      }

      const enrolledCourses = JSON.parse(savedEnrolled);
      if (!enrolledCourses || enrolledCourses.length === 0) {
        setMaterials([]);
        return;
      }

      // Extract tutorIds from enrolled courses
      const enrolledTutorIds = enrolledCourses
        .map((course: any) => course.tutorId)
        .filter((id: string) => id); // Remove null/undefined

      if (enrolledTutorIds.length === 0) {
        setMaterials([]);
        return;
      }

      // Fetch materials from all enrolled tutors
      // Note: For enrolled students, show all content (published or not) from their enrolled tutors
      const allMaterials: any[] = [];
      for (const tutorId of enrolledTutorIds) {
        try {
          // First try to get published materials
          let response = await fetch(`http://localhost:5000/api/materials?tutorId=${tutorId}&isPublished=true`);
          if (response.ok) {
            const data = await response.json();
            allMaterials.push(...data);
          }
          // Also get unpublished materials for enrolled students (they should see all content)
          response = await fetch(`http://localhost:5000/api/materials?tutorId=${tutorId}&isPublished=false`);
          if (response.ok) {
            const data = await response.json();
            // Filter out duplicates
            const existingIds = new Set(allMaterials.map(m => m._id));
            allMaterials.push(...data.filter((m: any) => !existingIds.has(m._id)));
          }
        } catch (error) {
          console.error(`Error loading materials for tutor ${tutorId}:`, error);
        }
      }

      // Set materials with tutorId for filtering
      // Handle both populated and non-populated tutorId
      setMaterials(allMaterials.map((m: any) => {
        let tutorIdValue = m.tutorId;
        if (typeof tutorIdValue === 'object' && tutorIdValue !== null) {
          tutorIdValue = tutorIdValue._id || tutorIdValue.toString();
        }
        return {
          id: m._id,
          title: m.title,
          type: (m.fileType || 'other').toUpperCase(),
          size: m.fileSize ? `${(m.fileSize / (1024 * 1024)).toFixed(2)} MB` : '0 MB',
          uploadDate: new Date(m.createdAt || Date.now()).toLocaleDateString(),
          downloadUrl: `/api/materials/${m._id}/download`,
          tutorId: tutorIdValue ? tutorIdValue.toString() : undefined
        };
      }));
    } catch (error) {
      console.error('Error loading materials for student:', error);
      setMaterials([]);
    }
  };

  // Determine if we should use StudentDashboard layout
  // If userRole is 'student', we're embedded in StudentDashboard and should not show DashboardLayout
  const isFromStudentDashboard = userRole === 'student';

  // For tutors, use the full TutorDashboard menu items
  // For students (embedded), menuItems won't be used
  const menuItems = userRole === 'tutor' ? [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'lectures', label: 'Lectures', icon: Video },
    { id: 'analytics', label: 'Learning & Emotion Analytics', icon: BarChart3 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'availability', label: 'Availability', icon: Calendar },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: Settings },
  ] : [
    { id: 'content', label: 'Course Content', icon: BookOpen },
  ];

  const handleLectureUpload = async () => {
    setLectureUploadError('');

    if (!lectureTitle.trim()) {
      setLectureUploadError('Please enter a lecture title');
      return;
    }

    if (!lectureDuration.trim()) {
      setLectureUploadError('Please enter the lecture duration');
      return;
    }

    if (!lectureFile) {
      setLectureUploadError('Please select a video file first');
      return;
    }

    setIsUploadingLecture(true);
    setLectureUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('video', lectureFile);
      formData.append('title', lectureTitle);
      formData.append('duration', lectureDuration);
      formData.append('courseId', 'default-course');

      // Simulate progress (in real app, use XMLHttpRequest for actual progress)
      const progressInterval = setInterval(() => {
        setLectureUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('http://localhost:5000/api/lectures/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setLectureUploadProgress(100);

      if (response.ok) {
        const data = await response.json();
        setLectureSuccessMessage(`${lectureTitle} uploaded successfully!`);
        setShowLectureSuccessToast(true);

        // Reset form
        setLectureTitle('');
        setLectureDuration('');
        setLectureFile(null);
        setLectureUploadProgress(0);

        // Close modal after showing success
        setTimeout(() => {
          setShowLectureUpload(false);
          setIsUploadingLecture(false);

          // Reload lectures
          const userId = getUserId(user);
          if (getUserRole(user) === 'tutor' && userId) {
            loadLectures(userId);
          } else {
            loadLecturesForStudent();
          }

          // Hide toast after 3 seconds
          setTimeout(() => setShowLectureSuccessToast(false), 3000);
        }, 1500);
      } else {
        const error = await response.json();
        setLectureUploadError(error.message || 'Upload failed. Please try again.');
        setIsUploadingLecture(false);
        setLectureUploadProgress(0);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setLectureUploadError('Failed to upload lecture. Please check your connection and try again.');
      setIsUploadingLecture(false);
      setLectureUploadProgress(0);
    }
  };

  const handleLectureDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLecture(true);
  };

  const handleLectureDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLecture(false);
  };

  const handleLectureDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLecture(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo'];

      if (allowedTypes.includes(file.type) || file.name.match(/\.(mp4|avi|mov)$/i)) {
        setLectureFile(file);
        setLectureUploadError('');
      } else {
        setLectureUploadError('Invalid file type. Please select MP4, AVI, or MOV video file.');
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['ppt', 'pptx'].includes(ext || '')) return '📊';
    return '📎';
  };

  const handleMaterialUpload = async () => {
    setUploadError('');

    if (!materialTitle.trim()) {
      setUploadError('Please enter a material title');
      return;
    }

    if (!materialFile) {
      setUploadError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', materialFile);
      formData.append('title', materialTitle);
      formData.append('courseId', 'default-course');

      // Simulate progress (in real app, use XMLHttpRequest for actual progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('http://localhost:5000/api/materials/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(`${materialTitle} uploaded successfully!`);
        setShowSuccessToast(true);

        // Reset form
        setMaterialTitle('');
        setMaterialFile(null);
        setUploadProgress(0);

        // Immediately reload materials (don't wait for modal close)
        const userId = getUserId(user);
        if (getUserRole(user) === 'tutor' && userId) {
          loadMaterials(userId);
        } else {
          loadMaterialsForStudent();
        }

        // Close modal after showing success
        setTimeout(() => {
          setShowMaterialUpload(false);
          setIsUploading(false);

          // Reload materials again to ensure fresh data
          if (getUserRole(user) === 'tutor' && userId) {
            loadMaterials(userId);
          } else {
            loadMaterialsForStudent();
          }

          // Hide toast after 3 seconds
          setTimeout(() => setShowSuccessToast(false), 3000);
        }, 1500);
      } else {
        const error = await response.json();
        setUploadError(error.message || 'Upload failed. Please try again.');
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload material. Please check your connection and try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();

      if (allowedTypes.includes(fileExt)) {
        setMaterialFile(file);
        setUploadError('');
      } else {
        setUploadError('Invalid file type. Please select PDF, DOC, DOCX, PPT, or PPTX.');
      }
    }
  };

  const deleteLecture = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/lectures/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Lecture deleted successfully!');
        const userId = getUserId(user);
        if (getUserRole(user) === 'tutor' && userId) {
          loadLectures(userId);
        } else {
          loadLecturesForStudent();
        }
      } else {
        const error = await response.json();
        alert(`Delete failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete lecture. Please try again.');
    }
  };

  const deleteMaterial = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/materials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Material deleted successfully!');
        const userId = getUserId(user);
        if (getUserRole(user) === 'tutor' && userId) {
          loadMaterials(userId);
        } else {
          loadMaterialsForStudent();
        }
      } else {
        const error = await response.json();
        alert(`Delete failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete material. Please try again.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'content':
        return (
          <div className="space-y-6 fade-in">
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">Introduction to Computer Technology</h1>
                  <p className="text-teal-100 text-lg mt-2">
                    {userRole === 'tutor' ? 'Manage your course content' : 'Access your learning materials'}
                  </p>
                </div>
              </div>
            </div>

            {/* Lectures Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {userRole === 'tutor' ? 'Video Lectures' : 'Course Lectures'}
                </h2>
                {userRole === 'tutor' && (
                  <button
                    onClick={() => setShowLectureUpload(true)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Video Lecture
                  </button>
                )}
              </div>

              {lectures.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">
                    {userRole === 'student'
                      ? 'No lectures available. Enroll in a course to view lectures.'
                      : 'No lectures uploaded yet'}
                  </p>
                  {userRole === 'student' && (
                    <p className="text-sm text-gray-600">
                      Go to "Find Tutors" to enroll in courses and access learning materials.
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lectures.map((lecture) => (
                    <div key={lecture.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                      <div className="bg-gradient-to-br from-teal-500 to-blue-500 h-40 flex items-center justify-center">
                        <Video className="w-16 h-16 text-white opacity-80" />
                      </div>
                      <div className="p-4 bg-white">
                        {lecture.courseId && (
                          <span className="inline-block px-2 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded-full mb-2">
                            {lecture.courseId}
                          </span>
                        )}
                        <h3 className="font-bold text-lg mb-2 text-gray-900">{lecture.title}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{lecture.duration}</span>
                          <span className="mx-2">•</span>
                          <span>{lecture.uploadDate}</span>
                        </div>
                        <div className="flex space-x-2">
                          {userRole === 'student' ? (
                            <a
                              href={`http://localhost:5000${lecture.videoUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Watch
                            </a>
                          ) : (
                            <>
                              <a
                                href={`http://localhost:5000${lecture.videoUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Preview
                              </a>
                              <button
                                onClick={() => deleteLecture(lecture.id)}
                                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Materials Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Additional Materials</h2>
                {userRole === 'tutor' && (
                  <button
                    onClick={() => setShowMaterialUpload(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Material
                  </button>
                )}
              </div>

              {materials.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">
                    {userRole === 'student'
                      ? 'No materials available. Enroll in a course to view materials.'
                      : 'No materials uploaded yet'}
                  </p>
                  {userRole === 'student' && (
                    <p className="text-sm text-gray-600">
                      Go to "Find Tutors" to enroll in courses and access learning materials.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{material.title}</h4>
                          <p className="text-sm text-gray-600">
                            {material.type} • {material.size} • {material.uploadDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <a
                          href={`http://localhost:5000${material.downloadUrl}`}
                          download
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </a>
                        {userRole === 'tutor' && (
                          <button
                            onClick={() => deleteMaterial(material.id)}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleBack = () => {
    // Get the previous page from localStorage
    let previousPage = localStorage.getItem('courseManagementPreviousPage');

    // If not set, determine based on actual user role from localStorage
    if (!previousPage) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        previousPage = parsedUser.role === 'tutor' ? 'tutorDashboard' : 'studentDashboard';
      } else {
        // Fallback to userRole prop if localStorage user not found
        previousPage = userRole === 'tutor' ? 'tutorDashboard' : 'studentDashboard';
      }
    }

    onNavigate(previousPage as Page);
  };

  // If accessed from StudentDashboard, render without DashboardLayout (will be embedded in StudentDashboard)
  // This prevents the sidebar from showing when embedded
  if (isFromStudentDashboard) {
    return (
      <div className="space-y-6 w-full">
        {/* Horizontal Tabs - Only show tabs, no sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'content'
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Course Content
            </button>
          </div>
        </div>
        {renderContent()}

        {/* Upload Modals - Only show for tutors when triggered */}
        {showLectureUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Upload Video Lecture</h3>
                <button
                  onClick={() => {
                    if (!isUploadingLecture) {
                      setShowLectureUpload(false);
                      setLectureTitle('');
                      setLectureDuration('');
                      setLectureFile(null);
                      setLectureUploadError('');
                      setLectureUploadProgress(0);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isUploadingLecture}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Lecture Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lecture Title</label>
                  <input
                    type="text"
                    value={lectureTitle}
                    onChange={(e) => {
                      setLectureTitle(e.target.value);
                      setLectureUploadError('');
                    }}
                    placeholder="e.g., Introduction to Programming"
                    disabled={isUploadingLecture}
                    className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
                  />
                </div>

                {/* Duration Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={lectureDuration}
                    onChange={(e) => {
                      setLectureDuration(e.target.value);
                      setLectureUploadError('');
                    }}
                    placeholder="e.g., 45:30"
                    disabled={isUploadingLecture}
                    className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
                  />
                </div>

                {/* Video File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video File</label>

                  {!lectureFile ? (
                    <div
                      onDragOver={handleLectureDragOver}
                      onDragLeave={handleLectureDragLeave}
                      onDrop={handleLectureDrop}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDraggingLecture
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50/50'
                        }`}
                    >
                      <input
                        ref={lectureFileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setLectureFile(file);
                          setLectureUploadError('');
                        }}
                        className="hidden"
                        disabled={isUploadingLecture}
                      />
                      <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        <button
                          type="button"
                          onClick={() => lectureFileInputRef.current?.click()}
                          className="text-teal-600 hover:text-teal-700 font-medium underline"
                          disabled={isUploadingLecture}
                        >
                          Click to upload
                        </button>
                        {' '}or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">Supports: MP4, AVI, MOV</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-2xl">🎥</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{lectureFile.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(lectureFile.size)}</p>
                          </div>
                        </div>
                        {!isUploadingLecture && (
                          <button
                            type="button"
                            onClick={() => {
                              setLectureFile(null);
                              if (lectureFileInputRef.current) {
                                lectureFileInputRef.current.value = '';
                              }
                            }}
                            className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {lectureUploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{lectureUploadError}</p>
                  </div>
                )}

                {/* Upload Progress */}
                {isUploadingLecture && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="text-gray-600 font-medium">{lectureUploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${lectureUploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Success Message (shown before closing) */}
                {lectureUploadProgress === 100 && !lectureUploadError && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-700 font-medium">Upload successful!</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      if (!isUploadingLecture) {
                        setShowLectureUpload(false);
                        setLectureTitle('');
                        setLectureDuration('');
                        setLectureFile(null);
                        setLectureUploadError('');
                        setLectureUploadProgress(0);
                      }
                    }}
                    disabled={isUploadingLecture}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLectureUpload}
                    disabled={isUploadingLecture || !lectureFile || !lectureTitle.trim() || !lectureDuration.trim()}
                    className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploadingLecture ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      'Upload'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showMaterialUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Upload Material</h3>
                <button
                  onClick={() => {
                    if (!isUploading) {
                      setShowMaterialUpload(false);
                      setMaterialTitle('');
                      setMaterialFile(null);
                      setUploadError('');
                      setUploadProgress(0);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isUploading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Material Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material Title</label>
                  <input
                    type="text"
                    value={materialTitle}
                    onChange={(e) => {
                      setMaterialTitle(e.target.value);
                      setUploadError('');
                    }}
                    placeholder="e.g., Course Syllabus"
                    disabled={isUploading}
                    className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
                  />
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>

                  {!materialFile ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setMaterialFile(file);
                          setUploadError('');
                        }}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-700 font-medium underline"
                          disabled={isUploading}
                        >
                          Click to upload
                        </button>
                        {' '}or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">Supports: PDF, DOC, DOCX, PPT, PPTX</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-2xl">{getFileIcon(materialFile.name)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{materialFile.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(materialFile.size)}</p>
                          </div>
                        </div>
                        {!isUploading && (
                          <button
                            type="button"
                            onClick={() => {
                              setMaterialFile(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{uploadError}</p>
                  </div>
                )}


                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="text-gray-600 font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}


                {/* Success Message (shown before closing) */}
                {uploadProgress === 100 && !uploadError && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-700 font-medium">Upload successful!</p>
                  </div>
                )}


                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      if (!isUploading) {
                        setShowMaterialUpload(false);
                        setMaterialTitle('');
                        setMaterialFile(null);
                        setUploadError('');
                        setUploadProgress(0);
                      }
                    }}
                    disabled={isUploading}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMaterialUpload}
                    disabled={isUploading || !materialFile || !materialTitle.trim()}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      'Upload'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast Notifications */}
        {showSuccessToast && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-slide-in">
            <CheckCircle className="w-5 h-5" />
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        {showLectureSuccessToast && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-slide-in">
            <CheckCircle className="w-5 h-5" />
            <p className="font-medium">{lectureSuccessMessage}</p>
          </div>
        )}
      </div>
    );
  }

  // For tutors or standalone access, use DashboardLayout
  // Handle menu item clicks - navigate to tutorDashboard for non-content tabs
  const handleTabChange = (tab: string) => {
    if (tab === 'lectures') {
      // Stay in CourseManagement for lectures - show content
      setActiveTab('content');
    } else {
      // Navigate to tutorDashboard for other tabs
      localStorage.setItem('tutorDashboardActiveTab', tab);
      onNavigate('tutorDashboard');
    }
  };

  return (
    <DashboardLayout
      user={user}
      activeTab={userRole === 'tutor' ? 'lectures' : activeTab}
      setActiveTab={handleTabChange}
      onNavigate={onNavigate}
      menuItems={menuItems}
    >
      {/* Horizontal Tabs for Course Content */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'content'
              ? 'bg-teal-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            Course Content
          </button>
        </div>
      </div>
      {renderContent()}

      {/* Upload Modals - Only show for tutors */}
      {userRole === 'tutor' && showLectureUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Upload Video Lecture</h3>
              <button
                onClick={() => {
                  if (!isUploadingLecture) {
                    setShowLectureUpload(false);
                    setLectureTitle('');
                    setLectureDuration('');
                    setLectureFile(null);
                    setLectureUploadError('');
                    setLectureUploadProgress(0);
                  }
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isUploadingLecture}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Lecture Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lecture Title</label>
                <input
                  type="text"
                  value={lectureTitle}
                  onChange={(e) => {
                    setLectureTitle(e.target.value);
                    setLectureUploadError('');
                  }}
                  placeholder="e.g., Introduction to Programming"
                  disabled={isUploadingLecture}
                  className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
                />
              </div>

              {/* Course Name Input - Added for user clarity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => {
                    setCourseName(e.target.value);
                    setLectureUploadError('');
                  }}
                  placeholder="e.g., Intro to CS 101"
                  disabled={isUploadingLecture}
                  className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
                />
              </div>

              {/* Duration Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input
                  type="text"
                  value={lectureDuration}
                  onChange={(e) => {
                    setLectureDuration(e.target.value);
                    setLectureUploadError('');
                  }}
                  placeholder="e.g., 45:30"
                  disabled={isUploadingLecture}
                  className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
                />
              </div>

              {/* Video File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video File</label>

                {!lectureFile ? (
                  <div
                    onDragOver={handleLectureDragOver}
                    onDragLeave={handleLectureDragLeave}
                    onDrop={handleLectureDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDraggingLecture
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50/50'
                      }`}
                  >
                    <input
                      ref={lectureFileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setLectureFile(file);
                        setLectureUploadError('');
                      }}
                      className="hidden"
                      disabled={isUploadingLecture}
                    />
                    <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      <button
                        type="button"
                        onClick={() => lectureFileInputRef.current?.click()}
                        className="text-teal-600 hover:text-teal-700 font-medium underline"
                        disabled={isUploadingLecture}
                      >
                        Click to upload
                      </button>
                      {' '}or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Supports: MP4, AVI, MOV</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">🎥</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{lectureFile.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(lectureFile.size)}</p>
                        </div>
                      </div>
                      {!isUploadingLecture && (
                        <button
                          type="button"
                          onClick={() => {
                            setLectureFile(null);
                            if (lectureFileInputRef.current) {
                              lectureFileInputRef.current.value = '';
                            }
                          }}
                          className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {lectureUploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{lectureUploadError}</p>
                </div>
              )}

              {/* Upload Progress */}
              {isUploadingLecture && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="text-gray-600 font-medium">{lectureUploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${lectureUploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Success Message (shown before closing) */}
              {lectureUploadProgress === 100 && !lectureUploadError && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">Upload successful!</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (!isUploadingLecture) {
                      setShowLectureUpload(false);
                      setLectureTitle('');
                      setLectureDuration('');
                      setLectureFile(null);
                      setLectureUploadError('');
                      setLectureUploadProgress(0);
                    }
                  }}
                  disabled={isUploadingLecture}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLectureUpload}
                  disabled={isUploadingLecture || !lectureFile || !lectureTitle.trim() || !lectureDuration.trim()}
                  className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploadingLecture ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {userRole === 'tutor' && showMaterialUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Upload Material</h3>
              <button
                onClick={() => {
                  if (!isUploading) {
                    setShowMaterialUpload(false);
                    setMaterialTitle('');
                    setMaterialFile(null);
                    setUploadError('');
                    setUploadProgress(0);
                  }
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isUploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Material Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material Title</label>
                <input
                  type="text"
                  value={materialTitle}
                  onChange={(e) => {
                    setMaterialTitle(e.target.value);
                    setUploadError('');
                  }}
                  placeholder="e.g., Course Syllabus"
                  disabled={isUploading}
                  className="w-full bg-gray-50 border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
                />
              </div>

              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>

                {!materialFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
                      }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setMaterialFile(file);
                        setUploadError('');
                      }}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-medium underline"
                        disabled={isUploading}
                      >
                        Click to upload
                      </button>
                      {' '}or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Supports: PDF, DOC, DOCX, PPT, PPTX</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{getFileIcon(materialFile.name)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{materialFile.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(materialFile.size)}</p>
                        </div>
                      </div>
                      {!isUploading && (
                        <button
                          type="button"
                          onClick={() => {
                            setMaterialFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{uploadError}</p>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="text-gray-600 font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Success Message (shown before closing) */}
              {uploadProgress === 100 && !uploadError && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">Upload successful!</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (!isUploading) {
                      setShowMaterialUpload(false);
                      setMaterialTitle('');
                      setMaterialFile(null);
                      setUploadError('');
                      setUploadProgress(0);
                    }
                  }}
                  disabled={isUploading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMaterialUpload}
                  disabled={isUploading || !materialFile || !materialTitle.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notifications */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-slide-in">
          <CheckCircle className="w-5 h-5" />
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      {showLectureSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-slide-in">
          <CheckCircle className="w-5 h-5" />
          <p className="font-medium">{lectureSuccessMessage}</p>
        </div>
      )}
    </DashboardLayout>
  );
}

// Export a component that can be embedded in StudentDashboard
export function CourseContentEmbedded({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return <CourseManagement onNavigate={onNavigate} userRole="student" />;
}

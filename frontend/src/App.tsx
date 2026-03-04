import { useState, useEffect, useRef } from 'react';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Courses from './pages/Courses';
import TutorDashboard from './pages/TutorDashboard';
import Contact from './pages/Contact';
import StudentDashboard from './pages/StudentDashboard';
import CourseManagement from './pages/CourseManagement';
import TutorSearch from './pages/TutorSearch';
import TutorProfile from './pages/TutorProfile';
import VirtualClassroom from './pages/VirtualClassroom';
import EmotionAnalyticsPage from './pages/EmotionAnalyticsPage';

// Components
import Footer from './components/Footer';

// Types
import type { Page } from './types';

// Context
import { useUser } from './context/UserContext';

function App() {
  const { user, isLoading: userLoading } = useUser();

  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isLoading, setIsLoading] = useState(true);
  const isInitializedRef = useRef(false);

  /* ----------------------------------------
     INITIAL LOAD (RUNS ONLY ONCE)
  -----------------------------------------*/
  useEffect(() => {
    if (isInitializedRef.current) return;
    if (userLoading) return;

    try {
      const savedPage = localStorage.getItem('currentPage') as Page | null;

      if (user) {
        // Logged in → always go to correct dashboard
        if (user.role === 'student') {
          setCurrentPage('studentDashboard');
        } else if (user.role === 'tutor') {
          setCurrentPage('tutorDashboard');
        } else {
          setCurrentPage('landing');
        }
      } else {
        // Logged out → allow only public pages
        const publicPages: Page[] = [
          'landing',
          'login',
          'signup',
          'courses',
          'tutor',
          'tutorSearch',
          'contact'
        ];

        if (savedPage && publicPages.includes(savedPage)) {
          setCurrentPage(savedPage);
        } else {
          setCurrentPage('landing');
        }
      }
    } catch (err) {
      console.error('App init error:', err);
      setCurrentPage('landing');
    } finally {
      setIsLoading(false);
      isInitializedRef.current = true;
    }
  }, [userLoading, user]);

  /* ----------------------------------------
     LOGIN REDIRECT
  -----------------------------------------*/
  useEffect(() => {
    if (!isInitializedRef.current || userLoading) return;

    if (user) {
      if (user.role === 'student') {
        setCurrentPage('studentDashboard');
        localStorage.setItem('currentPage', 'studentDashboard');
      } else if (user.role === 'tutor') {
        setCurrentPage('tutorDashboard');
        localStorage.setItem('currentPage', 'tutorDashboard');
      }
    }
  }, [user, userLoading]);

  /* ----------------------------------------
     LOGOUT REDIRECT (FIXED)
  -----------------------------------------*/
  useEffect(() => {
    if (!isInitializedRef.current || userLoading) return;

    const protectedPages: Page[] = [
      'studentDashboard',
      'tutorDashboard',
      'courseManagement',
      'virtualClassroom',
      'emotionAnalytics'
    ];

    if (!user && protectedPages.includes(currentPage)) {
      console.log('User logged out → redirecting to landing');
      setCurrentPage('landing');
      localStorage.setItem('currentPage', 'landing');
    }
  }, [user, userLoading, currentPage]);

  /* ----------------------------------------
     NAVIGATION HANDLER
  -----------------------------------------*/
  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    localStorage.setItem('currentPage', page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ----------------------------------------
     LOADING SCREEN
  -----------------------------------------*/
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  /* ----------------------------------------
     FOOTER VISIBILITY
  -----------------------------------------*/
  const showFooter =
    currentPage === 'landing' ||
    currentPage === 'courses' ||
    currentPage === 'tutor' ||
    currentPage === 'contact';

  /* ----------------------------------------
     RENDER
  -----------------------------------------*/
  return (
    <div className="min-h-screen bg-white">

      {currentPage === 'landing' && <Landing onNavigate={handleNavigate} />}
      {currentPage === 'login' && <Login onNavigate={handleNavigate} />}
      {currentPage === 'signup' && <Signup onNavigate={handleNavigate} />}
      {currentPage === 'courses' && <Courses onNavigate={handleNavigate} />}

      {currentPage === 'tutor' && (
        <TutorSearch
          onNavigate={handleNavigate}
          onBack={() => handleNavigate('landing')}
        />
      )}

      {currentPage === 'tutorSearch' && (
        <TutorSearch
          onNavigate={handleNavigate}
          onBack={() => handleNavigate('landing')}
        />
      )}

      {currentPage === 'contact' && <Contact onNavigate={handleNavigate} />}

      {currentPage === 'studentDashboard' && (
        <StudentDashboard onNavigate={handleNavigate} />
      )}

      {currentPage === 'tutorDashboard' && (
        <TutorDashboard onNavigate={handleNavigate} />
      )}

      {currentPage === 'courseManagement' && (
        <CourseManagement
          onNavigate={handleNavigate}
          userRole={user?.role || 'student'}
        />
      )}

      {currentPage === 'tutorProfile' && (
        <TutorProfile
          tutorId={localStorage.getItem('selectedTutorId') || ''}
          onNavigate={handleNavigate}
          onBack={() => {
            const prev = localStorage.getItem('previousPage') || 'tutor';
            handleNavigate(prev as Page);
          }}
        />
      )}

      {currentPage === 'virtualClassroom' && (
        <VirtualClassroom
          bookingId={localStorage.getItem('currentBookingId') || ''}
          onNavigate={handleNavigate}
          onEndLesson={() => {
            if (user?.role === 'student') {
              handleNavigate('studentDashboard');
            } else {
              handleNavigate('tutorDashboard');
            }
          }}
        />
      )}

      {currentPage === 'emotionAnalytics' && (
        <EmotionAnalyticsPage onNavigate={handleNavigate} />
      )}

      {showFooter && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}

export default App;

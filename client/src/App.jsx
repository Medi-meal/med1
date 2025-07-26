import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GeminiRecommend from './pages/GeminiRecommend';
import Navbar from './components/Navbar';
import UserHomeDashboard from './components/UserHomeDashboard';
import { NotificationProvider } from './hooks/useNotifications';
import { Toaster } from 'react-hot-toast';
import './styles/responsive.css'; // Add responsive styles

import ProfileWizard from './pages/ProfileWizard';
import UserProfile from './pages/UserProfile';
import ErrorBoundary from './pages/ErrorBoundary';
import React, { useState, useEffect, Suspense } from 'react';

function App() {
  const [showAbout, setShowAbout] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for user on component mount and when localStorage changes
  useEffect(() => {
    const checkUser = () => {
      const storedUser = JSON.parse(localStorage.getItem('medimeal_user'));
      // Only update if the user data has actually changed
      setUser(prevUser => {
        if (JSON.stringify(prevUser) !== JSON.stringify(storedUser)) {
          return storedUser;
        }
        return prevUser;
      });
    };

    checkUser();
    
    // Listen for storage changes
    window.addEventListener('storage', checkUser);
    
    // Check less frequently to avoid unnecessary re-renders
    const interval = setInterval(checkUser, 5000); // Changed from 1000ms to 5000ms
    
    return () => {
      window.removeEventListener('storage', checkUser);
      clearInterval(interval);
    };
  }, []);

  const handleAboutClick = () => {
    if (location.pathname !== '/') {
      navigate('/', { state: { showAbout: true } });
    } else {
      setShowAbout(v => !v);
    }
  };

  const handleNavigationClick = (section) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: section } });
    } else {
      // If already on landing page, scroll to section
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleFAQClick = () => handleNavigationClick('faq');
  const handleContactClick = () => handleNavigationClick('contact');
  const handleSupportClick = () => handleNavigationClick('support');
  const handleSubscriptionClick = () => handleNavigationClick('subscription');

  // Conditional home page component
  const HomePage = () => {
    if (user && user.email) {
      return <UserHomeDashboard user={user} />;
    } else {
      return <Landing showAbout={showAbout} setShowAbout={setShowAbout} />;
    }
  };

  return (
    <NotificationProvider>
      <Navbar 
        onAboutClick={handleAboutClick}
        onFAQClick={handleFAQClick}
        onContactClick={handleContactClick}
        onSupportClick={handleSupportClick}
        onSubscriptionClick={handleSubscriptionClick}
      />
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/gemini-recommend" element={<ErrorBoundary>
            <GeminiRecommend />
          </ErrorBoundary>} />
          <Route path="/profile-wizard" element={<ProfileWizard />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </Suspense>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
        }}
      />
    </NotificationProvider>
  );
}

export default App;
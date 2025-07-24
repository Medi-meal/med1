import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GeminiRecommend from './pages/GeminiRecommend';
import Navbar from './components/Navbar';
import { NotificationProvider } from './hooks/useNotifications';
import { Toaster } from 'react-hot-toast';

import ProfileWizard from './pages/ProfileWizard';
import UserProfile from './pages/UserProfile';
import ErrorBoundary from './pages/ErrorBoundary';
import React, { useState } from 'react';

function App() {
  const [showAbout, setShowAbout] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <NotificationProvider>
      <Navbar 
        onAboutClick={handleAboutClick}
        onFAQClick={handleFAQClick}
        onContactClick={handleContactClick}
        onSupportClick={handleSupportClick}
        onSubscriptionClick={handleSubscriptionClick}
      />
      <Routes>
        <Route path="/" element={<Landing showAbout={showAbout} setShowAbout={setShowAbout} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/gemini-recommend" element={<ErrorBoundary>
          <GeminiRecommend />
        </ErrorBoundary>} />
        <Route path="/profile-wizard" element={<ProfileWizard />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
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
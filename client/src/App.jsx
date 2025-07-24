import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GeminiRecommend from './pages/GeminiRecommend';
import Navbar from './components/Navbar';

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

  return (
    <>
      <Navbar onAboutClick={handleAboutClick} />
      <Routes>
        <Route path="/" element={<Landing showAbout={showAbout} setShowAbout={setShowAbout} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/recommend" element={<ErrorBoundary>
          <GeminiRecommend />
        </ErrorBoundary>} />
        <Route path="/profile-wizard" element={<ProfileWizard />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </>
  );
}

export default App;
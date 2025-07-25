import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar(props) {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('medimeal_user')));
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Update user state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem('medimeal_user')));
    };
    
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000); // Check every second for changes
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('medimeal_user');
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  const handleQuickAction = (action) => {
    setShowDropdown(false);
    
    if (!user && action !== 'guide') {
      navigate('/login');
      return;
    }

    switch (action) {
      case 'recommendations':
        navigate('/recommend'); // Navigate to AI Recommendations tab
        // Add URL fragment to directly show recommendations
        window.location.hash = '#recommendations';
        break;
      case 'analytics':
        navigate('/recommend'); // Navigate to Analytics Dashboard tab
        // Add URL fragment to directly show analytics dashboard
        window.location.hash = '#dashboard';
        break;
      case 'progress':
        navigate('/recommend'); // Navigate to ProgressTracker tab
        // Add URL fragment to directly show progress tracker
        window.location.hash = '#progress';
        break;
      case 'dashboard':
        navigate('/recommend'); // Navigate to UserDashboard tab
        // Add URL fragment to directly show dashboard
        window.location.hash = '#dashboard';
        break;
      case 'food-logger':
        navigate('/recommend');
        // Add URL fragment for food logging functionality
        window.location.hash = '#food-logger';
        break;
      case 'health-tracker':
        navigate('/recommend');
        window.location.hash = '#health-tracker';
        break;
      case 'meal-plan':
        navigate('/recommend');
        window.location.hash = '#meal-plan';
        break;
      case 'nutrition-analysis':
        navigate('/recommend');
        window.location.hash = '#nutrition';
        break;
      case 'weight-tracker':
        navigate('/recommend');
        window.location.hash = '#weight-tracker';
        break;
      case 'workout-log':
        navigate('/recommend');
        window.location.hash = '#workout';
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'wizard':
        navigate('/profile-wizard');
        break;
      case 'settings':
        navigate('/profile');
        window.location.hash = '#settings';
        break;
      case 'guide':
        // Open user guide or help documentation
        window.open('https://github.com/Mounikakamasani/Medimeal/blob/main/README.md', '_blank');
        break;
      default:
        break;
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">Medimeal</Link>
          <Link to="/" className="navbar-link">Home</Link>
          {props.onAboutClick && (
            <button className="navbar-link" onClick={props.onAboutClick}>About</button>
          )}
          
          {/* Quick Actions Dropdown */}
          <div className="navbar-dropdown" ref={dropdownRef}>
            <button 
              className="navbar-link dropdown-toggle"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              Quick Actions ▼
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                {/* Progress & Analytics Section */}
                <div className="dropdown-section">
                  <div className="dropdown-section-title">📊 Progress & Analytics</div>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleQuickAction('recommendations')}
                  >
                    🤖 AI Recommendations
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleQuickAction('analytics')}
                  >
                    📈 View Analytics
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleQuickAction('progress')}
                  >
                    📊 Progress Tracker
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleQuickAction('dashboard')}
                  >
                    📋 Analytics Dashboard
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleQuickAction('nutrition-analysis')}
                  >
                    🔬 Nutrition Analysis
                  </button>
                </div>

                {/* Food & Meal Tracking Section */}
                <div className="dropdown-section">
                  <div className="dropdown-section-title">🍽️ Food & Meals</div>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleQuickAction('food-logger')}
                  >
                    📝 Food Logger
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleQuickAction('meal-plan')}
                  >
                    🗓️ Meal Planner
                  </button>
                </div>

                {/* Health Monitoring Section */}
                <div className="dropdown-section">
                  <div className="dropdown-section-title">🏥 Health Tracking</div>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleQuickAction('health-tracker')}
                  >
                    🏥 Health Monitor
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleQuickAction('weight-tracker')}
                  >
                    ⚖️ Weight Tracker
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleQuickAction('workout-log')}
                  >
                    🏋️ Workout Log
                  </button>
                </div>

                {/* Profile & Settings Section */}
                <div className="dropdown-section">
                  <div className="dropdown-section-title">👤 Profile & Settings</div>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleQuickAction('profile')}
                  >
                    🔧 My Profile
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleQuickAction('wizard')}
                  >
                    🧙‍♂️ Profile Setup
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleQuickAction('settings')}
                  >
                    ⚙️ Settings
                  </button>
                </div>

                {/* Help & Support Section */}
                <div className="dropdown-section">
                  <div className="dropdown-section-title">❓ Help & Support</div>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleQuickAction('guide')}
                  >
                    📖 User Guide
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recommendations Link - Always visible */}
          <Link to="/recommend" className="navbar-link">🤖 AI Recommendations</Link>
        </div>
        
        <div className="navbar-right">
          {user ? (
            <div className="navbar-profile">
              <span className="navbar-user-icon" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" fill="#a2b9d7"/>
                  <path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" fill="#a2b9d7"/>
                </svg>
              </span>
              <Link to="/profile" className="navbar-username" style={{ color: '#fff', textDecoration: 'none', cursor: 'pointer' }}>
                {user.name ? user.name : 'User'}
              </Link>
              <button className="navbar-logout" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/signup" className="navbar-link">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

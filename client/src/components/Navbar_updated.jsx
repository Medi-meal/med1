import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar(props) {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('medimeal_user')));
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const floatingRef = useRef(null);

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

  // Close floating dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (floatingRef.current && !floatingRef.current.contains(event.target)) {
        setShowFloatingActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickAction = (action) => {
    setShowFloatingActions(false);
    
    if (!user && action !== 'guide') {
      navigate('/login');
      return;
    }

    switch (action) {
      case 'recommendations':
        navigate('/recommend');
        window.location.hash = '#recommendations';
        break;
      case 'analytics':
        navigate('/recommend');
        window.location.hash = '#dashboard';
        break;
      case 'progress':
        navigate('/recommend');
        window.location.hash = '#progress';
        break;
      case 'food-logger':
        navigate('/recommend');
        window.location.hash = '#food-logger';
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medimeal_user');
    setUser(null);
    navigate('/');
  };

  const handleNavigation = (action) => {
    switch (action) {
      case 'faq':
        // Handle FAQ navigation
        if (props.onFAQClick) {
          props.onFAQClick();
        } else {
          // Default FAQ behavior - could navigate to FAQ page or show modal
          navigate('/faq');
        }
        break;
      case 'contact':
        // Handle Contact & Support navigation
        if (props.onContactClick) {
          props.onContactClick();
        } else {
          // Default contact behavior
          navigate('/contact');
        }
        break;
      case 'subscription':
        // Handle Subscription navigation
        if (props.onSubscriptionClick) {
          props.onSubscriptionClick();
        } else {
          // Default subscription behavior
          navigate('/subscription');
        }
        break;
      default:
        break;
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <Link to="/" className="navbar-logo">Medimeal</Link>
            <Link to="/" className="navbar-link">Home</Link>
            {props.onAboutClick && (
              <button className="navbar-link" onClick={props.onAboutClick}>About</button>
            )}
            <button className="navbar-link" onClick={() => handleNavigation('faq')}>
              FAQs
            </button>
            <button className="navbar-link" onClick={() => handleNavigation('contact')}>
              Contact & Support
            </button>
            <button className="navbar-link" onClick={() => handleNavigation('subscription')}>
              Subscription
            </button>
            
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

      {/* Floating Quick Actions Button */}
      <div className="floating-quick-actions" ref={floatingRef}>
        <button 
          className="floating-button"
          onClick={() => setShowFloatingActions(!showFloatingActions)}
          title="Quick Actions"
        >
          ⚡
        </button>
        {showFloatingActions && (
          <div className="floating-dropdown">
            <div className="floating-dropdown-section">
              <button 
                className="floating-dropdown-item"
                onClick={() => handleQuickAction('recommendations')}
              >
                🤖 AI Recommendations
              </button>
              <button 
                className="floating-dropdown-item"
                onClick={() => handleQuickAction('analytics')}
              >
                📈 View Analytics
              </button>
              <button 
                className="floating-dropdown-item"
                onClick={() => handleQuickAction('progress')}
              >
                📊 Progress Tracker
              </button>
              <button 
                className="floating-dropdown-item"
                onClick={() => handleQuickAction('food-logger')}
              >
                📝 Food Logger
              </button>
              <button 
                className="floating-dropdown-item"
                onClick={() => handleQuickAction('profile')}
              >
                👤 My Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

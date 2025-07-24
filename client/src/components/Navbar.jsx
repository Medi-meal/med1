import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar(props) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('medimeal_user'));

  const handleLogout = () => {
    localStorage.removeItem('medimeal_user');
    navigate('/login');
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
              <Link to="/profile" className="navbar-username" style={{ color: '#fff', textDecoration: 'underline', cursor: 'pointer' }}>
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
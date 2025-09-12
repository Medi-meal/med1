import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SQLAgent from '../components/SQLAgent';

const SQLAgentPage = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for authenticated user
    const user = JSON.parse(localStorage.getItem('medimeal_user'));
    const email = localStorage.getItem('userEmail');
    
    if (user && user.email) {
      setUserEmail(user.email);
      setIsAuthenticated(true);
    } else if (email) {
      setUserEmail(email);
      setIsAuthenticated(true);
    } else {
      // For demo purposes, you can set a demo email
      // In production, redirect to login
      setUserEmail('demo@medimeal.com');
      setIsAuthenticated(true);
      // navigate('/login');
    }
  }, [navigate]);

  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2>🔐 Authentication Required</h2>
        <p>Please log in to access the SQL Query Agent</p>
        <button 
          onClick={() => navigate('/login')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f7fafc',
      paddingTop: '80px' // Account for navbar height
    }}>
      <SQLAgent userEmail={userEmail} />
    </div>
  );
};

export default SQLAgentPage;

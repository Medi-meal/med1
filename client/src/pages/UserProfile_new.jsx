import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardStats from '../components/DashboardStats';
import MealTracker from '../components/MealTracker';
import FoodAnalyzer from '../components/FoodAnalyzer';
import PersonalizedDashboard from '../components/PersonalizedDashboard';
import ProgressTracker from '../components/ProgressTracker';
import InteractiveVisualizations from '../components/InteractiveVisualizations';
import FoodLogger from '../components/FoodLogger';
import EnhancedUserProfile from '../components/EnhancedUserProfile';
import UserDashboard from '../components/UserDashboard';

export default function UserProfile() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthProfile, setHealthProfile] = useState(null);
  const user = JSON.parse(localStorage.getItem('medimeal_user'));

  // Function to update health profile
  const updateHealthProfile = (newProfile) => {
    setHealthProfile(newProfile);
    console.log('Profile updated:', newProfile);
  };

  useEffect(() => {
    if (user && user.email) {
      // Fetch history
      axios.get(`http://localhost:5000/api/user-input/history?email=${encodeURIComponent(user.email)}`)
        .then(res => {
          const historyData = res.data.history || [];
          setHistory(historyData);
          
          // Calculate stats from history
          const calculatedStats = {
            totalRecommendations: historyData.length,
            mealsTracked: historyData.reduce((acc, entry) => {
              if (entry.recommendations) {
                return acc + Object.keys(entry.recommendations).length;
              }
              return acc;
            }, 0),
            healthStreak: Math.min(historyData.length * 2, 30),
            foodsAvoided: historyData.reduce((acc, entry) => {
              if (entry.recommendations) {
                return acc + Object.values(entry.recommendations).reduce((mealAcc, meal) => {
                  return mealAcc + (meal.not_recommended?.length || 0);
                }, 0);
              }
              return acc;
            }, 0)
          };
          setStats(calculatedStats);

          // Set mock health profile for demonstration
          const mockHealthProfile = {
            age: '28',
            weight: '70',
            height: '175',
            gender: 'Male',
            foodType: 'Flexible',
            activityLevel: 'moderate',
            medications: ['Vitamin D', 'Omega-3'],
            healthGoals: ['Weight Loss', 'Heart Health'],
            disease: 'None',
            allergies: []
          };
          setHealthProfile(mockHealthProfile);
        })
        .catch(err => console.error('Error fetching profile data:', err));
    }
  }, [user]);

  function renderInput(input) {
    if (Array.isArray(input)) {
      return input.join('');
    } else if (typeof input === 'object' && input !== null) {
      return Object.entries(input).map(([key, value]) => (
        <div key={key}><b>{key}:</b> {value}</div>
      ));
    } else {
      return input;
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: '🎯' },
    { id: 'analytics', label: 'Analytics Dashboard', icon: '📊' },
    { id: 'progress', label: 'Progress Tracker', icon: '📈' },
    { id: 'visualizations', label: 'Data Charts', icon: '📊' },
    { id: 'foodlogger', label: 'Food Logger', icon: '🍽️' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'tracker', label: 'Meal Tracker', icon: '🍽️' },
    { id: 'analyzer', label: 'Food Analyzer', icon: '🔍' },
    { id: 'history', label: 'History', icon: '📚' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <DashboardStats user={user} stats={stats} />
            <PersonalizedDashboard 
              user={user} 
              healthProfile={healthProfile} 
              stats={stats} 
            />
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>📋 Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <button
                  onClick={() => window.location.href = '/gemini-recommend'}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  🎯 Get New Recommendations
                </button>
                <button
                  onClick={() => setActiveTab('foodlogger')}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  📝 Log Food
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  📊 View Analytics
                </button>
                <button
                  onClick={() => setActiveTab('analyzer')}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  🔍 Analyze Food Safety
                </button>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return <UserDashboard user={user} />;
      case 'progress':
        return <ProgressTracker user={user} healthProfile={healthProfile} stats={stats} />;
      case 'visualizations':
        return <InteractiveVisualizations user={user} healthProfile={healthProfile} stats={stats} />;
      case 'foodlogger':
        return <FoodLogger user={user} />;
      case 'profile':
        return (
          <EnhancedUserProfile 
            user={user} 
            healthProfile={healthProfile} 
            onUpdateProfile={updateHealthProfile}
          />
        );
      case 'tracker':
        return <MealTracker user={user} />;
      case 'analyzer':
        return <FoodAnalyzer user={user} />;
      case 'history':
        return (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#1f2937', marginBottom: '1.5rem' }}>📈 Recommendation History</h3>
            {history.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                color: '#6b7280',
                padding: '2rem',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                <p>No recommendation history found.</p>
                <button
                  onClick={() => window.location.href = '/gemini-recommend'}
                  style={{
                    background: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}
                >
                  Get Your First Recommendation
                </button>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.map((entry, idx) => (
                <div key={entry._id || idx} style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  padding: '1.25rem',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ color: '#22c55e', fontWeight: '600', fontSize: '1rem' }}>
                      📅 {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <span style={{
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      Recommendation #{idx + 1}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: '#374151', marginBottom: '0.5rem' }}>Health Profile:</h4>
                    <div style={{ 
                      background: 'white',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      {renderInput(entry.input)}
                    </div>
                  </div>

                  {entry.recommendations && (
                    <div>
                      <h4 style={{ color: '#374151', marginBottom: '0.5rem' }}>Meal Plan:</h4>
                      <div style={{
                        background: 'white',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}>
                        <pre style={{
                          background: 'transparent',
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'inherit',
                          fontSize: 'inherit'
                        }}>
                          {JSON.stringify(entry.recommendations, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              👤
            </div>
            <div>
              <h1 style={{ margin: 0, color: '#1f2937', fontSize: '1.875rem' }}>
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '0.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '12px',
                background: activeTab === tab.id ? '#22c55e' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}

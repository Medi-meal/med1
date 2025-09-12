import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ProgressAnalyticsTab from '../components/ProgressAnalyticsTab';
import FoodMealsTab from '../components/FoodMealsTab';
import EnhancedProfileTab from '../components/EnhancedProfileTab';
import '../styles/responsive.css';

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [healthProfile, setHealthProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
          
          // Calculate comprehensive stats from history
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
            }, 0),
            weeklyProgress: generateWeeklyProgress(),
            nutritionBreakdown: calculateNutritionBreakdown(),
            caloriesTrend: generateCaloriesTrend()
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
            allergies: [],
            targetWeight: '65',
            targetCalories: 2000,
            weightHistory: generateWeightHistory()
          };
          setHealthProfile(mockHealthProfile);
        })
        .catch(err => console.error('Error fetching profile data:', err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Helper functions for generating mock data
  const generateWeeklyProgress = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      calories: Math.floor(Math.random() * 500) + 1500,
      protein: Math.floor(Math.random() * 50) + 80,
      carbs: Math.floor(Math.random() * 100) + 150,
      fat: Math.floor(Math.random() * 30) + 50
    }));
  };

  const calculateNutritionBreakdown = () => {
    return {
      protein: Math.floor(Math.random() * 30) + 25,
      carbs: Math.floor(Math.random() * 30) + 45,
      fat: Math.floor(Math.random() * 20) + 20,
      fiber: Math.floor(Math.random() * 10) + 5
    };
  };

  const generateCaloriesTrend = () => {
    const data = [];
    for (let i = 0; i < 30; i++) {
      data.push({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        calories: Math.floor(Math.random() * 600) + 1400,
        target: 2000
      });
    }
    return data;
  };

  const generateWeightHistory = () => {
    const data = [];
    let weight = 75;
    for (let i = 0; i < 12; i++) {
      weight += (Math.random() - 0.5) * 2;
      data.push({
        month: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
        weight: Math.round(weight * 10) / 10
      });
    }
    return data;
  };

  const tabs = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: '👤',
      description: 'Personal information and health goals'
    },
    { 
      id: 'progress', 
      label: 'Progress & Analytics', 
      icon: '📊',
      description: 'Track your health journey with interactive charts'
    },
    { 
      id: 'food', 
      label: 'Food & Meals', 
      icon: '🍽️',
      description: 'Log meals, track nutrition, and sync data'
    }
  ];

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <EnhancedProfileTab 
            user={user} 
            healthProfile={healthProfile} 
            onUpdateProfile={updateHealthProfile}
          />
        );
      case 'progress':
        return (
          <ProgressAnalyticsTab 
            user={user} 
            healthProfile={healthProfile} 
            stats={stats}
            history={history}
          />
        );
      case 'food':
        return (
          <FoodMealsTab 
            user={user}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <motion.div 
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          ⚡
        </motion.div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <motion.div 
        className="profile-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Welcome back, {user?.name || 'User'}! 👋</h1>
        <p>Manage your health journey and track your progress</p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div 
        className="tab-navigation"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <div className="tab-content">
              <span className="tab-label">{tab.label}</span>
              <span className="tab-description">{tab.description}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="tab-content-wrapper"
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

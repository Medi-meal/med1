import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationContainer from '../components/NotificationSystem';

// Create context
const NotificationContext = createContext();

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random(); // Simple unique ID
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    setTimeout(() => {
      removeNotification(id);
    }, duration);
    
    return id;
  }, [removeNotification]);

  // Core notification methods
  const showSuccess = useCallback((message, title = 'Success') => {
    return addNotification({ type: 'success', title, message });
  }, [addNotification]);

  const showError = useCallback((message, title = 'Error') => {
    return addNotification({ type: 'error', title, message });
  }, [addNotification]);

  const showWarning = useCallback((message, title = 'Warning') => {
    return addNotification({ type: 'warning', title, message });
  }, [addNotification]);

  const showInfo = useCallback((message, title = 'Info') => {
    return addNotification({ type: 'info', title, message });
  }, [addNotification]);

  // Health-specific notification methods
  const showMealSuccess = useCallback((mealName) => {
    return showSuccess(`${mealName} logged successfully! Keep up the great work.`, 'Meal Logged');
  }, [showSuccess]);

  const showFoodWarning = useCallback((food, reason) => {
    return showWarning(`${food}: ${reason}`, 'Nutrition Alert');
  }, [showWarning]);

  const showRecommendationReady = useCallback(() => {
    return showInfo('Your personalized meal recommendations are ready!', 'Recommendations Available');
  }, [showInfo]);

  const showProgressUpdate = useCallback((achievement) => {
    return showSuccess(achievement, 'Progress Update');
  }, [showSuccess]);

  const showGoalAchieved = useCallback((goalName) => {
    return showSuccess(`Congratulations! You've achieved your ${goalName} goal! 🎉`, 'Goal Achieved');
  }, [showSuccess]);

  const showWeightUpdate = useCallback((change) => {
    const message = change > 0 
      ? `Weight increased by ${change}kg` 
      : change < 0 
        ? `Weight decreased by ${Math.abs(change)}kg` 
        : 'Weight remains stable';
    return showInfo(message, 'Weight Update');
  }, [showInfo]);

  const showProfileUpdate = useCallback(() => {
    return showSuccess('Your profile has been updated successfully!', 'Profile Updated');
  }, [showSuccess]);

  const value = {
    notifications,
    removeNotification,
    addNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showMealSuccess,
    showFoodWarning,
    showRecommendationReady,
    showProgressUpdate,
    showGoalAchieved,
    showWeightUpdate,
    showProfileUpdate
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

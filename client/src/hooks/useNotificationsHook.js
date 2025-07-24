import { useState, useCallback } from 'react';

// Custom hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification = {
      ...notification,
      id,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    setTimeout(() => {
      removeNotification(id);
    }, duration);
    
    return id;
  }, [removeNotification]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, title = 'Success', options = {}) => {
    return addNotification({ 
      type: 'success', 
      title, 
      message, 
      ...options 
    });
  }, [addNotification]);

  const showError = useCallback((message, title = 'Error', options = {}) => {
    return addNotification({ 
      type: 'error', 
      title, 
      message, 
      duration: 7000, // Errors stay longer
      ...options 
    });
  }, [addNotification]);

  const showWarning = useCallback((message, title = 'Warning', options = {}) => {
    return addNotification({ 
      type: 'warning', 
      title, 
      message, 
      ...options 
    });
  }, [addNotification]);

  const showInfo = useCallback((message, title = 'Info', options = {}) => {
    return addNotification({ 
      type: 'info', 
      title, 
      message, 
      ...options 
    });
  }, [addNotification]);

  // Health-specific notification methods
  const showMealSuccess = useCallback((mealType) => {
    return showSuccess(
      `Your ${mealType} has been logged successfully!`,
      'Meal Logged',
      { icon: '🍽️' }
    );
  }, [showSuccess]);

  const showFoodWarning = useCallback((food, warning) => {
    return showWarning(
      `${food}: ${warning}`,
      'Food Safety Alert',
      { icon: '⚠️', duration: 8000 }
    );
  }, [showWarning]);

  const showRecommendationReady = useCallback(() => {
    return showSuccess(
      'Your personalized meal recommendations are ready!',
      'Recommendations Complete',
      { icon: '🎯' }
    );
  }, [showSuccess]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    // Health-specific methods
    showMealSuccess,
    showFoodWarning,
    showRecommendationReady
  };
};

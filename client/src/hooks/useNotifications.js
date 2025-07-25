import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

// Create notification context
const NotificationContext = createContext();

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
    
    return id;
  }, [removeNotification]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((message, options = {}) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
      },
      ...options
    });
    
    return addNotification({
      type: 'success',
      message,
      timestamp: new Date().toISOString()
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    toast.error(message, {
      duration: 6000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
      ...options
    });
    
    return addNotification({
      type: 'error',
      message,
      timestamp: new Date().toISOString()
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    toast(message, {
      duration: 5000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
        fontWeight: '500',
      },
      ...options
    });
    
    return addNotification({
      type: 'warning',
      message,
      timestamp: new Date().toISOString()
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
        fontWeight: '500',
      },
      ...options
    });
    
    return addNotification({
      type: 'info',
      message,
      timestamp: new Date().toISOString()
    });
  }, [addNotification]);

  const showLoading = useCallback((message, options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6B7280',
        color: '#fff',
        fontWeight: '500',
      },
      ...options
    });
  }, []);

  const contextValue = {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    removeNotification,
    clearAllNotifications,
    addNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  // If not in a provider context, return standalone toast functions
  if (!context) {
    return {
      showSuccess: (message, options = {}) => toast.success(message, options),
      showError: (message, options = {}) => toast.error(message, options),
      showWarning: (message, options = {}) => toast(message, { icon: '⚠️', ...options }),
      showInfo: (message, options = {}) => toast(message, { icon: 'ℹ️', ...options }),
      showLoading: (message, options = {}) => toast.loading(message, options),
      notifications: [],
      removeNotification: () => {},
      clearAllNotifications: () => {},
      addNotification: () => {}
    };
  }
  
  return context;
};

// Default export for convenience
export default useNotifications;

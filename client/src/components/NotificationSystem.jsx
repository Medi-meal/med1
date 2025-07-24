import React, { useEffect } from 'react';

const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      maxWidth: '400px'
    }}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, onRemove }) => {
  const { id, type, title, message, duration = 5000 } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#f0fdf4',
          border: '#bbf7d0',
          icon: '✅',
          iconColor: '#22c55e'
        };
      case 'error':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          icon: '❌',
          iconColor: '#ef4444'
        };
      case 'warning':
        return {
          bg: '#fffbeb',
          border: '#fed7aa',
          icon: '⚠️',
          iconColor: '#f59e0b'
        };
      case 'info':
      default:
        return {
          bg: '#eff6ff',
          border: '#bfdbfe',
          icon: 'ℹ️',
          iconColor: '#3b82f6'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      style={{
        background: styles.bg,
        border: `2px solid ${styles.border}`,
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        animation: 'slideIn 0.3s ease-out',
        position: 'relative',
        minWidth: '300px'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <div style={{
          fontSize: '1.25rem',
          color: styles.iconColor,
          flexShrink: 0
        }}>
          {styles.icon}
        </div>
        <div style={{ flex: 1 }}>
          {title && (
            <h4 style={{
              margin: '0 0 0.25rem 0',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              {title}
            </h4>
          )}
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: '#6b7280',
            lineHeight: '1.4'
          }}>
            {message}
          </p>
        </div>
        <button
          onClick={() => onRemove(id)}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: 0,
            flexShrink: 0
          }}
        >
          ✕
        </button>
      </div>
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
};

// Remove the hook from this file. 
// Import it from './useNotifications' in your components where needed.

export default NotificationContainer;

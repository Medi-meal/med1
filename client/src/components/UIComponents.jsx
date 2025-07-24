import React from 'react';

export const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizes = {
    small: { spinner: '20px', text: '0.875rem' },
    medium: { spinner: '40px', text: '1rem' },
    large: { spinner: '60px', text: '1.125rem' }
  };

  const currentSize = sizes[size];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '1rem'
    }}>
      <div
        style={{
          width: currentSize.spinner,
          height: currentSize.spinner,
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #22c55e',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <p style={{
        color: '#6b7280',
        fontSize: currentSize.text,
        margin: 0,
        textAlign: 'center'
      }}>
        {message}
      </p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export const ErrorMessage = ({ 
  title = 'Something went wrong', 
  message = 'Please try again later.',
  onRetry = null,
  type = 'error' 
}) => {
  const colors = {
    error: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: '❌' },
    warning: { bg: '#fffbeb', border: '#fed7aa', text: '#d97706', icon: '⚠️' },
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', icon: 'ℹ️' }
  };

  const color = colors[type];

  return (
    <div style={{
      background: color.bg,
      border: `2px solid ${color.border}`,
      borderRadius: '12px',
      padding: '1.5rem',
      margin: '1rem 0',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '2rem',
        marginBottom: '0.5rem'
      }}>
        {color.icon}
      </div>
      <h3 style={{
        color: color.text,
        margin: '0 0 0.5rem 0',
        fontSize: '1.125rem',
        fontWeight: '600'
      }}>
        {title}
      </h3>
      <p style={{
        color: '#6b7280',
        margin: '0 0 1rem 0',
        fontSize: '0.875rem'
      }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: color.text,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          🔄 Try Again
        </button>
      )}
    </div>
  );
};

export const SkeletonCard = ({ height = '200px' }) => {
  return (
    <div style={{
      background: '#f3f4f6',
      borderRadius: '12px',
      padding: '1rem',
      height,
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      animation: 'pulse 2s ease-in-out infinite'
    }}>
      <div style={{
        background: '#e5e7eb',
        borderRadius: '8px',
        height: '20px',
        width: '60%'
      }} />
      <div style={{
        background: '#e5e7eb',
        borderRadius: '8px',
        height: '16px',
        width: '100%'
      }} />
      <div style={{
        background: '#e5e7eb',
        borderRadius: '8px',
        height: '16px',
        width: '80%'
      }} />
      <div style={{
        background: '#e5e7eb',
        borderRadius: '8px',
        height: '40px',
        width: '100%',
        marginTop: 'auto'
      }} />
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export const EmptyState = ({ 
  icon = '📝', 
  title = 'No data found', 
  message = 'There\'s nothing here yet.',
  actionText = null,
  onAction = null 
}) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '3rem 2rem',
      background: '#f9fafb',
      borderRadius: '12px',
      border: '2px dashed #e5e7eb'
    }}>
      <div style={{
        fontSize: '4rem',
        marginBottom: '1rem'
      }}>
        {icon}
      </div>
      <h3 style={{
        color: '#1f2937',
        margin: '0 0 0.5rem 0',
        fontSize: '1.25rem',
        fontWeight: '600'
      }}>
        {title}
      </h3>
      <p style={{
        color: '#6b7280',
        margin: '0 0 1.5rem 0',
        fontSize: '0.875rem'
      }}>
        {message}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = '#16a34a'}
          onMouseLeave={(e) => e.target.style.background = '#22c55e'}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default { LoadingSpinner, ErrorMessage, SkeletonCard, EmptyState };

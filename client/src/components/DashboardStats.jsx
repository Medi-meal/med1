import React from 'react';

const DashboardStats = ({ stats }) => {
  const defaultStats = {
    totalRecommendations: 0,
    mealsTracked: 0,
    healthStreak: 0,
    foodsAvoided: 0,
    ...stats
  };

  const statCards = [
    {
      title: 'Total Recommendations',
      value: defaultStats.totalRecommendations,
      icon: '🎯',
      color: '#22c55e',
      bgColor: '#dcfce7'
    },
    {
      title: 'Meals Tracked',
      value: defaultStats.mealsTracked,
      icon: '🍽️',
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    {
      title: 'Health Streak',
      value: `${defaultStats.healthStreak} days`,
      icon: '🔥',
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
      title: 'Foods Avoided',
      value: defaultStats.foodsAvoided,
      icon: '⚠️',
      color: '#ef4444',
      bgColor: '#fee2e2'
    }
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      {statCards.map((stat, index) => (
        <div
          key={index}
          style={{
            background: stat.bgColor,
            borderRadius: '12px',
            padding: '1.5rem',
            border: `2px solid ${stat.color}20`,
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                margin: '0 0 0.5rem 0',
                fontWeight: '500'
              }}>
                {stat.title}
              </p>
              <p style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: stat.color, 
                margin: 0 
              }}>
                {stat.value}
              </p>
            </div>
            <div style={{ fontSize: '2rem' }}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;

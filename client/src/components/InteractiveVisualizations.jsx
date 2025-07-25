import React, { useState } from 'react';

const InteractiveVisualizations = () => {
  const [activeChart, setActiveChart] = useState('nutrition');

  // Sample data for visualizations
  const nutritionData = {
    calories: { consumed: 1850, target: 2000, percentage: 92.5 },
    protein: { consumed: 120, target: 150, percentage: 80 },
    carbs: { consumed: 200, target: 250, percentage: 80 },
    fats: { consumed: 65, target: 70, percentage: 92.8 },
    fiber: { consumed: 25, target: 30, percentage: 83.3 },
    water: { consumed: 7, target: 8, percentage: 87.5 }
  };

  const weeklyData = [
    { day: 'Mon', calories: 1950, steps: 8500, sleep: 7.5, mood: 8 },
    { day: 'Tue', calories: 1800, steps: 9200, sleep: 8, mood: 7 },
    { day: 'Wed', calories: 2100, steps: 7800, sleep: 6.5, mood: 6 },
    { day: 'Thu', calories: 1850, steps: 10200, sleep: 7, mood: 8 },
    { day: 'Fri', calories: 2000, steps: 8900, sleep: 8.5, mood: 9 },
    { day: 'Sat', calories: 2200, steps: 6500, sleep: 9, mood: 8 },
    { day: 'Sun', calories: 1900, steps: 7200, sleep: 8, mood: 7 }
  ];

  const foodCategoriesData = [
    { category: 'Vegetables', percentage: 30, color: '#22c55e' },
    { category: 'Proteins', percentage: 25, color: '#3b82f6' },
    { category: 'Grains', percentage: 20, color: '#f59e0b' },
    { category: 'Fruits', percentage: 15, color: '#ef4444' },
    { category: 'Dairy', percentage: 10, color: '#8b5cf6' }
  ];

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#22c55e', label, value, unit = '' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        margin: '1rem'
      }}>
        <div style={{ position: 'relative' }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: '#1f2937' 
            }}>
              {value}{unit}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280' 
            }}>
              {percentage.toFixed(1)}%
            </div>
          </div>
        </div>
        <div style={{ 
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          textAlign: 'center'
        }}>
          {label}
        </div>
      </div>
    );
  };

  const BarChart = ({ data, metric, color }) => {
    const maxValue = Math.max(...data.map(d => d[metric]));
    
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'end', 
        height: '200px',
        gap: '8px',
        padding: '1rem'
      }}>
        {data.map((item, index) => {
          const height = (item[metric] / maxValue) * 160;
          return (
            <div key={index} style={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                width: '100%',
                height: `${height}px`,
                backgroundColor: color,
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={e => e.target.style.opacity = '0.8'}
              onMouseOut={e => e.target.style.opacity = '1'}
              />
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280',
                fontWeight: '500'
              }}>
                {item.day}
              </span>
              <span style={{ 
                fontSize: '0.625rem', 
                color: '#9ca3af'
              }}>
                {item[metric]}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const PieChart = ({ data, size = 200 }) => {
    let currentAngle = 0;
    const center = size / 2;
    const radius = size / 2 - 20;

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '2rem'
      }}>
        <div style={{ position: 'relative' }}>
          <svg width={size} height={size}>
            {data.map((item, index) => {
              const sliceAngle = (item.percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + sliceAngle;
              
              const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = sliceAngle > 180 ? 1 : 0;
              
              const pathData = [
                `M ${center} ${center}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              currentAngle += sliceAngle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="2"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseOver={e => e.target.style.opacity = '0.8'}
                  onMouseOut={e => e.target.style.opacity = '1'}
                />
              );
            })}
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {data.map((item, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: item.color,
                borderRadius: '2px'
              }} />
              <span style={{ 
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                {item.category} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const chartTypes = [
    { id: 'nutrition', label: 'Nutrition Overview', icon: '🥗' },
    { id: 'trends', label: 'Weekly Trends', icon: '📈' },
    { id: 'categories', label: 'Food Categories', icon: '🍎' }
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'nutrition':
        return (
          <div>
            <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>Daily Nutrition Goals</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              justifyItems: 'center'
            }}>
              <CircularProgress
                percentage={nutritionData.calories.percentage}
                label="Calories"
                value={nutritionData.calories.consumed}
                unit=" kcal"
                color="#22c55e"
              />
              <CircularProgress
                percentage={nutritionData.protein.percentage}
                label="Protein"
                value={nutritionData.protein.consumed}
                unit="g"
                color="#3b82f6"
              />
              <CircularProgress
                percentage={nutritionData.carbs.percentage}
                label="Carbs"
                value={nutritionData.carbs.consumed}
                unit="g"
                color="#f59e0b"
              />
              <CircularProgress
                percentage={nutritionData.fats.percentage}
                label="Fats"
                value={nutritionData.fats.consumed}
                unit="g"
                color="#ef4444"
              />
              <CircularProgress
                percentage={nutritionData.fiber.percentage}
                label="Fiber"
                value={nutritionData.fiber.consumed}
                unit="g"
                color="#8b5cf6"
              />
              <CircularProgress
                percentage={nutritionData.water.percentage}
                label="Water"
                value={nutritionData.water.consumed}
                unit=" glasses"
                color="#06b6d4"
              />
            </div>
          </div>
        );
      
      case 'trends':
        return (
          <div>
            <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>Weekly Activity Trends</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Daily Calories</h4>
                <BarChart data={weeklyData} metric="calories" color="#22c55e" />
              </div>
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Daily Steps</h4>
                <BarChart data={weeklyData} metric="steps" color="#3b82f6" />
              </div>
            </div>
          </div>
        );
      
      case 'categories':
        return (
          <div>
            <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>Food Category Distribution</h3>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px'
            }}>
              <PieChart data={foodCategoriesData} />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        marginBottom: '2rem'
      }}>
        <span style={{ fontSize: '1.5rem' }}>📊</span>
        <h2 style={{ margin: 0, color: '#1f2937' }}>Interactive Visualizations</h2>
      </div>

      {/* Chart Type Selector */}
      <div style={{ 
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        background: '#f8fafc',
        padding: '0.5rem',
        borderRadius: '12px'
      }}>
        {chartTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setActiveChart(type.id)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '8px',
              background: activeChart === type.id ? '#22c55e' : 'transparent',
              color: activeChart === type.id ? 'white' : '#6b7280',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>

      {/* Chart Content */}
      <div style={{ minHeight: '400px' }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default InteractiveVisualizations;

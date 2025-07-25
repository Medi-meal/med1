import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import '../styles/calendar-heatmap.css';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const ProgressTracker = () => {
  useNotifications();
  const [loading, setLoading] = useState(true);
  const [progressData] = useState({
    weeklyGoals: {
      mealsLogged: { current: 12, target: 21, percentage: 57 },
      waterIntake: { current: 6, target: 8, percentage: 75 },
      exerciseMinutes: { current: 180, target: 300, percentage: 60 },
      healthyChoices: { current: 8, target: 10, percentage: 80 }
    },
    bmiHistory: [
      { month: 'Jan', bmi: 25.5 },
      { month: 'Feb', bmi: 25.2 },
      { month: 'Mar', bmi: 24.8 },
      { month: 'Apr', bmi: 24.5 },
      { month: 'May', bmi: 24.2 },
      { month: 'Jun', bmi: 23.9 }
    ],
    calorieData: [
      { day: 'Mon', actual: 1800, recommended: 2000 },
      { day: 'Tue', actual: 2100, recommended: 2000 },
      { day: 'Wed', actual: 1950, recommended: 2000 },
      { day: 'Thu', actual: 2200, recommended: 2000 },
      { day: 'Fri', actual: 1850, recommended: 2000 },
      { day: 'Sat', actual: 2050, recommended: 2000 },
      { day: 'Sun', actual: 1900, recommended: 2000 }
    ],
    macronutrients: [
      { name: 'Carbs', value: 45, color: '#8884d8' },
      { name: 'Proteins', value: 25, color: '#82ca9d' },
      { name: 'Fats', value: 30, color: '#ffc658' }
    ],
    streakData: generateStreakData(),
    monthlyTrends: {
      weightProgress: [-0.5, -1.2, -0.8, -1.5],
      bmiChanges: [0.2, -0.1, -0.3, -0.4],
      energyLevels: [7, 8, 7.5, 8.5],
      moodScores: [6.5, 7, 7.8, 8.2]
    },
    achievements: [
      { icon: '🎯', title: 'Goal Setter', description: 'Set your first health goal', unlocked: true },
      { icon: '🥗', title: 'Healthy Eater', description: 'Log 7 healthy meals', unlocked: true },
      { icon: '💧', title: 'Hydration Hero', description: 'Meet water goal for 5 days', unlocked: true },
      { icon: '🏆', title: 'Week Warrior', description: 'Complete all weekly goals', unlocked: false },
      { icon: '📈', title: 'Progress Master', description: 'Track progress for 30 days', unlocked: false },
      { icon: '🔥', title: 'Streak Champion', description: 'Maintain 14-day streak', unlocked: false }
    ]
  });

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      // Check if weekly goals are met
      const goalsCompleted = Object.values(progressData.weeklyGoals)
        .filter(goal => goal.percentage >= 100).length;
      
      if (goalsCompleted > 0) {
        toast.success(`🎉 Congratulations! You've completed ${goalsCompleted} weekly goal${goalsCompleted > 1 ? 's' : ''}!`);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [progressData.weeklyGoals]);

  // Generate mock streak data for calendar heatmap
  function generateStreakData() {
    const data = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 4)
      });
    }
    return data;
  }

  const LoadingSkeleton = () => (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px'
    }}>
      <ClipLoader color="#22c55e" size={50} />
      <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading your progress data...</p>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  const ProgressBar = ({ current, target, label, color, unit = '' }) => {
    const percentage = Math.min((current / target) * 100, 100);
    
    return (
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.8,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        style={{ marginBottom: '1.5rem' }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.5rem' 
        }}>
          <span style={{ fontWeight: '600', color: '#374151' }}>{label}</span>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {current}{unit} / {target}{unit}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '12px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <motion.div 
            initial={{ width: 0, scaleX: 0 }}
            animate={{ 
              width: `${percentage}%`,
              scaleX: 1
            }}
            transition={{ 
              duration: 2,
              ease: "easeOut",
              delay: 0.3
            }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${color}80 0%, ${color} 100%)`,
              borderRadius: '6px',
              position: 'relative',
              transformOrigin: 'left'
            }}
          >
            {/* Animated shine effect */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 1.5,
                delay: 1.5,
                repeat: Infinity,
                repeatDelay: 3
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '20px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                borderRadius: '6px'
              }}
            />
          </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          style={{ 
            textAlign: 'center', 
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: percentage >= 100 ? '#22c55e' : '#6b7280'
          }}
        >
          {percentage >= 100 ? '🎉 Goal Completed!' : `${percentage.toFixed(0)}% Complete`}
        </motion.div>
      </motion.div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        marginBottom: '2rem'
      }}>
        <span style={{ fontSize: '1.5rem' }}>📊</span>
        <h2 style={{ margin: 0, color: '#1f2937' }}>Progress Tracker</h2>
      </div>

      {/* BMI Over Time - Line Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ marginBottom: '2rem' }}
      >
        <h3 style={{ color: '#374151', marginBottom: '1rem' }}>📈 BMI Progression</h3>
        <div style={{ 
          background: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '12px',
          height: '300px'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData.bmiHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="bmi" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Calorie Intake vs Recommended - Bar Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ marginBottom: '2rem' }}
      >
        <h3 style={{ color: '#374151', marginBottom: '1rem' }}>📊 Weekly Calorie Intake</h3>
        <div style={{ 
          background: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '12px',
          height: '300px'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressData.calorieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="actual" fill="#3b82f6" name="Actual Intake" />
              <Bar dataKey="recommended" fill="#22c55e" name="Recommended" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Macronutrient Breakdown - Pie Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ marginBottom: '2rem' }}
      >
        <h3 style={{ color: '#374151', marginBottom: '1rem' }}>🥧 Macronutrient Distribution</h3>
        <div style={{ 
          background: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '12px',
          height: '350px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={progressData.macronutrients}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {progressData.macronutrients.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Streak Activity Calendar Heatmap */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{ marginBottom: '2rem' }}
      >
        <h3 style={{ color: '#374151', marginBottom: '1rem' }}>📅 Activity Streak Calendar</h3>
        <div style={{ 
          background: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '12px',
          overflow: 'auto'
        }}>
          <CalendarHeatmap
            startDate={new Date(new Date().setMonth(new Date().getMonth() - 3))}
            endDate={new Date()}
            values={progressData.streakData}
            classForValue={(value) => {
              if (!value) return 'color-empty';
              return `color-scale-${value.count}`;
            }}
            titleForValue={(value) => {
              if (!value) return 'No activity';
              return `${value.count} activities on ${value.date}`;
            }}
          />
          <style jsx>{`
            .react-calendar-heatmap .color-empty {
              fill: #ebedf0;
            }
            .react-calendar-heatmap .color-scale-1 {
              fill: #c6e48b;
            }
            .react-calendar-heatmap .color-scale-2 {
              fill: #7bc96f;
            }
            .react-calendar-heatmap .color-scale-3 {
              fill: #239a3b;
            }
            .react-calendar-heatmap .color-scale-4 {
              fill: #196127;
            }
          `}</style>
        </div>
      </motion.div>

      {/* Weekly Goals Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{ marginBottom: '2rem' }}
      >
        <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>🎯 Weekly Goals</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
            <ProgressBar
              current={progressData.weeklyGoals.mealsLogged.current}
              target={progressData.weeklyGoals.mealsLogged.target}
              label="🍽️ Meals Logged"
              color="#22c55e"
            />
            <ProgressBar
              current={progressData.weeklyGoals.waterIntake.current}
              target={progressData.weeklyGoals.waterIntake.target}
              label="💧 Daily Water Goals"
              color="#3b82f6"
              unit=" glasses"
            />
          </div>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
            <ProgressBar
              current={progressData.weeklyGoals.exerciseMinutes.current}
              target={progressData.weeklyGoals.exerciseMinutes.target}
              label="🏃‍♂️ Exercise Minutes"
              color="#f59e0b"
              unit=" min"
            />
            <ProgressBar
              current={progressData.weeklyGoals.healthyChoices.current}
              target={progressData.weeklyGoals.healthyChoices.target}
              label="🥗 Healthy Food Choices"
              color="#8b5cf6"
            />
          </div>
        </div>
      </motion.div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>🏆 Achievements</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {progressData.achievements.map((achievement, index) => (
            <motion.div 
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              style={{
                background: achievement.unlocked ? '#f0fdf4' : '#f9fafb',
                border: `2px solid ${achievement.unlocked ? '#22c55e' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
                opacity: achievement.unlocked ? 1 : 0.6,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {achievement.icon}
              </div>
              <h4 style={{ 
                margin: '0 0 0.5rem 0', 
                color: achievement.unlocked ? '#166534' : '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {achievement.title}
              </h4>
              <p style={{ 
                margin: 0, 
                fontSize: '0.75rem',
                color: achievement.unlocked ? '#15803d' : '#9ca3af'
              }}>
                {achievement.description}
              </p>
              {achievement.unlocked && (
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#22c55e',
                  fontWeight: '600'
                }}>
                  ✅ Unlocked!
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProgressTracker;

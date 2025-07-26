import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useNotifications } from '../hooks/useNotifications';
import { motion } from 'framer-motion';
import { FaPlus, FaUtensils, FaHeart, FaChartLine, FaCalendarAlt, FaTrophy } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const UserHomeDashboard = ({ user }) => {
  useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    recentRecommendations: [],
    todayNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    weeklyProgress: [],
    healthScore: 85,
    streakDays: 7,
    upcomingMeals: [],
    quickActions: []
  });
  const hasShownWelcome = React.useRef(false);
  const hasFetchedData = React.useRef(false);

  useEffect(() => {
    // Prevent multiple data fetches
    if (hasFetchedData.current || !user?.email) return;
    
    const fetchUserData = async () => {
      try {
        hasFetchedData.current = true;
        setLoading(true);
        
        // Fetch user's recent data
        const [foodLogsRes, userInputRes] = await Promise.all([
          axios.get(`${API_URL}/api/food-logger?email=${encodeURIComponent(user.email)}`).catch(() => ({ data: { foods: [] } })),
          axios.get(`${API_URL}/api/user-input?email=${encodeURIComponent(user.email)}`).catch(() => ({ data: { input: null } }))
        ]);

        const foodLogs = foodLogsRes.data.foods || [];
        const userInput = userInputRes.data.input;

        // Generate dashboard data
        const today = new Date();
        const todaysFoods = foodLogs.filter(food => {
          const foodDate = new Date(food.timestamp).toDateString();
          return foodDate === today.toDateString();
        });

        const todayNutrition = todaysFoods.reduce((acc, food) => ({
          calories: acc.calories + (food.calories || 0),
          protein: acc.protein + (food.protein || 0),
          carbs: acc.carbs + (food.carbs || 0),
          fat: acc.fat + (food.fat || 0),
          fiber: acc.fiber + (food.fiber || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

        // Generate weekly progress data
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weeklyProgress = weekDays.map((day, index) => {
          const dayDate = new Date();
          dayDate.setDate(today.getDate() - (today.getDay() - index));
          const dayFoods = foodLogs.filter(food => {
            const foodDate = new Date(food.timestamp).toDateString();
            return foodDate === dayDate.toDateString();
          });
          
          return {
            day,
            calories: dayFoods.reduce((sum, food) => sum + (food.calories || 0), 0),
            meals: dayFoods.length,
            score: Math.min(100, dayFoods.length * 20)
          };
        });

        // Generate recent recommendations
        const recentRecommendations = userInput ? [
          { meal: 'Breakfast', foods: ['Oatmeal with berries', 'Greek yogurt'], status: 'completed' },
          { meal: 'Lunch', foods: ['Grilled chicken salad', 'Quinoa'], status: 'pending' },
          { meal: 'Dinner', foods: ['Salmon with vegetables', 'Brown rice'], status: 'pending' }
        ] : [];

        // Generate upcoming meals
        const upcomingMeals = [
          { time: '12:00 PM', meal: 'Lunch', foods: ['Grilled chicken salad', 'Quinoa'], calories: 450 },
          { time: '6:30 PM', meal: 'Dinner', foods: ['Salmon with vegetables', 'Brown rice'], calories: 520 },
          { time: '9:00 PM', meal: 'Snack', foods: ['Almonds', 'Apple'], calories: 180 }
        ];

        // Quick actions
        const quickActions = [
          { icon: '🍽️', title: 'Log Food', action: () => navigate('/gemini-recommend#food-logger'), color: '#22c55e' },
          { icon: '🤖', title: 'Get Recommendations', action: () => navigate('/gemini-recommend'), color: '#3b82f6' },
          { icon: '📊', title: 'View Analytics', action: () => navigate('/gemini-recommend#dashboard'), color: '#8b5cf6' },
          { icon: '👤', title: 'Update Profile', action: () => navigate('/profile'), color: '#f59e0b' }
        ];

        setDashboardData({
          recentRecommendations,
          todayNutrition,
          weeklyProgress,
          healthScore: Math.floor(Math.random() * 20) + 80,
          streakDays: Math.floor(Math.random() * 10) + 3,
          upcomingMeals,
          quickActions
        });

        setLoading(false);
        
        // Only show welcome toast once per component mount
        if (!hasShownWelcome.current) {
          toast.success('Welcome back! Your dashboard is ready.');
          hasShownWelcome.current = true;
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchUserData();
  }, [user?.email, navigate]); // Only depend on user.email, not the entire user object

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#374151' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color, fontSize: '0.875rem' }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
      minHeight: '400px'
    }}>
      <ClipLoader color="#22c55e" size={60} />
      <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '1.1rem' }}>
        Loading your personalized dashboard...
      </p>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '2rem'
      }}
    >
      {/* Welcome Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '2rem' }}>🎯</span>
          <div>
            <h1 style={{ margin: 0, color: '#1f2937' }}>Welcome back, {user?.name || 'User'}!</h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
              Here's your personalized health overview for today.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #bbf7d0' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>{dashboardData.streakDays}</div>
            <div style={{ fontSize: '0.875rem', color: '#14532d' }}>Day Streak</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#eff6ff', borderRadius: '12px', border: '2px solid #bfdbfe' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{Math.round(dashboardData.todayNutrition.calories)}</div>
            <div style={{ fontSize: '0.875rem', color: '#1e3a8a' }}>Calories Today</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#fef3c7', borderRadius: '12px', border: '2px solid #fde68a' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>{dashboardData.healthScore}%</div>
            <div style={{ fontSize: '0.875rem', color: '#92400e' }}>Health Score</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {dashboardData.quickActions.map((action, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.action}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              border: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '2rem' }}>{action.icon}</span>
            <span style={{ fontWeight: '600', color: '#374151' }}>{action.title}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Health Score Ring */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{ color: '#374151', marginBottom: '2rem', textAlign: 'center' }}>
            🏆 Your Health Score
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '200px', height: '200px' }}>
              <CircularProgressbarWithChildren
                value={dashboardData.healthScore}
                styles={{
                  path: {
                    stroke: dashboardData.healthScore >= 80 ? '#22c55e' : 
                           dashboardData.healthScore >= 60 ? '#f59e0b' : '#ef4444',
                    strokeWidth: 8,
                    transition: 'stroke-dashoffset 0.5s ease 0s'
                  },
                  trail: {
                    stroke: '#f3f4f6',
                    strokeWidth: 8
                  }
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <strong style={{ fontSize: '2rem', color: '#1f2937' }}>
                    {dashboardData.healthScore}%
                  </strong>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    {dashboardData.healthScore >= 80 ? 'Excellent!' : 
                     dashboardData.healthScore >= 60 ? 'Good Progress' : 'Keep Going!'}
                  </div>
                </div>
              </CircularProgressbarWithChildren>
            </div>
          </div>
        </motion.div>

        {/* Today's Nutrition */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>🍽️ Today's Nutrition</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#fef2f2', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#dc2626' }}>
                {Math.round(dashboardData.todayNutrition.calories)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#7f1d1d' }}>Calories</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f0fdf4', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a' }}>
                {Math.round(dashboardData.todayNutrition.protein)}g
              </div>
              <div style={{ fontSize: '0.875rem', color: '#14532d' }}>Protein</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#eff6ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                {Math.round(dashboardData.todayNutrition.carbs)}g
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1e3a8a' }}>Carbs</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#fffbeb', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#d97706' }}>
                {Math.round(dashboardData.todayNutrition.fat)}g
              </div>
              <div style={{ fontSize: '0.875rem', color: '#92400e' }}>Fat</div>
            </div>
          </div>
        </motion.div>

        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>📈 Weekly Progress</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  name="Calories"
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  name="Health Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Upcoming Meals */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>⏰ Upcoming Meals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dashboardData.upcomingMeals.map((meal, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#374151' }}>
                    {meal.time} - {meal.meal}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {meal.foods.join(', ')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600', color: '#dc2626' }}>
                    {meal.calories} cal
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Recommendations */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginTop: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>🤖 Recent Recommendations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {dashboardData.recentRecommendations.map((rec, index) => (
            <div key={index} style={{
              padding: '1.5rem',
              background: '#f9fafb',
              borderRadius: '12px',
              border: '2px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: '#374151' }}>{rec.meal}</h4>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  background: rec.status === 'completed' ? '#dcfce7' : '#fef3c7',
                  color: rec.status === 'completed' ? '#166534' : '#92400e'
                }}>
                  {rec.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                </span>
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {rec.foods.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserHomeDashboard; 
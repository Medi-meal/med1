import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useNotifications } from '../hooks/useNotifications';
import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';

const UserDashboard = ({ user, loggedFoods, onFoodAdded }) => {
  useNotifications();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const lastToastTime = useRef(0);
  const isUpdating = useRef(false);
  const [dashboardData, setDashboardData] = useState({
    mealFeedbackTrend: [],
    frequentFoods: [],
    nutritionScore: 0,
    weeklySummary: {},
    dailyNutrition: [],
    weeklyTrends: {
      weight: [],
      bmi: [],
      calories: [],
      steps: []
    }
  });

  // Handle hash changes to navigate to correct tab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash === 'food-logger' || hash === 'nutrition' || hash === 'meal-plan') {
        setActiveTab('nutrition');
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    // Generate real-time data function
    const generateRealTimeData = (foods) => {
      // Mock nutritional data for foods
      const MOCK_NUTRITION_DB = {
        'Quinoa Salad': { calories: 350, protein: 15, carbs: 45, fats: 15 },
        'Grilled Chicken': { calories: 220, protein: 40, carbs: 0, fats: 5 },
        'Avocado Toast': { calories: 250, protein: 8, carbs: 25, fats: 15 },
        'Greek Yogurt': { calories: 150, protein: 20, carbs: 10, fats: 4 },
        'Salmon': { calories: 300, protein: 30, carbs: 0, fats: 20 },
        'Sweet Potato': { calories: 180, protein: 4, carbs: 41, fats: 1 },
        'Brown Rice': { calories: 215, protein: 5, carbs: 45, fats: 2 },
        'Spinach Smoothie': { calories: 120, protein: 5, carbs: 20, fats: 2 },
        'Oatmeal': { calories: 150, protein: 5, carbs: 27, fats: 3 },
        'Almonds': { calories: 160, protein: 6, carbs: 6, fats: 14 },
        'Blueberries': { calories: 85, protein: 1, carbs: 21, fats: 0.5 },
        'Broccoli': { calories: 55, protein: 4, carbs: 11, fats: 1 },
        // Add more mock data as needed
      };

      const currentDate = new Date();
      const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      // Generate last 4 weeks of meal feedback trends
      const mealFeedbackTrend = [];
      for (let i = 3; i >= 0; i--) {
        const weekDate = new Date(currentDate);
        weekDate.setDate(weekDate.getDate() - (i * 7));
        mealFeedbackTrend.push({
          week: `Week ${4 - i}`,
          date: weekDate.toLocaleDateString(),
          positive: Math.floor(Math.random() * 10) + 15,
          negative: Math.floor(Math.random() * 3) + 1,
          neutral: Math.floor(Math.random() * 5) + 2
        });
      }

      // Generate current week's daily nutrition from logged foods
      const dailyNutrition = weekDays.map(day => ({
        day,
        calories: 0, protein: 0, carbs: 0, fats: 0
      }));

      foods.forEach(food => {
        const foodDate = new Date(food.timestamp);
        const dayIndex = foodDate.getDay(); // Sunday - 0, Monday - 1, etc.
        const nutrition = MOCK_NUTRITION_DB[food.food] || { calories: 100, protein: 10, carbs: 20, fats: 5 }; // Default if not in DB

        dailyNutrition[dayIndex].calories += nutrition.calories;
        dailyNutrition[dayIndex].protein += nutrition.protein;
        dailyNutrition[dayIndex].carbs += nutrition.carbs;
        dailyNutrition[dayIndex].fats += nutrition.fats;
      });

      // Generate frequent foods with realistic data
      const foodList = [
        'Quinoa Salad', 'Grilled Chicken', 'Avocado Toast', 'Greek Yogurt',
        'Salmon', 'Sweet Potato', 'Brown Rice', 'Spinach Smoothie',
        'Oatmeal', 'Almonds', 'Blueberries', 'Broccoli'
      ];
      const frequentFoods = foodList.slice(0, 6).map((name, index) => ({
        name,
        count: Math.floor(Math.random() * 8) + 5,
        color: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'][index]
      }));

      // Generate weekly trends
      const weeklyTrends = {
        weight: [],
        bmi: [],
        calories: [],
        steps: []
      };

      for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        
        weeklyTrends.weight.push({
          day: weekDays[6 - i],
          value: 70 + Math.random() * 2 - 1, // Weight around 70kg with small variations
          target: 68
        });
        
        weeklyTrends.bmi.push({
          day: weekDays[6 - i],
          value: 23.5 + Math.random() * 0.5 - 0.25, // BMI around 23.5
          target: 23
        });
        
        weeklyTrends.calories.push({
          day: weekDays[6 - i],
          consumed: Math.floor(Math.random() * 300) + 1800,
          burned: Math.floor(Math.random() * 200) + 2000,
          target: 2000
        });
        
        weeklyTrends.steps.push({
          day: weekDays[6 - i],
          count: Math.floor(Math.random() * 3000) + 7000,
          target: 10000
        });
      }

      return {
        mealFeedbackTrend,
        frequentFoods,
        nutritionScore: Math.floor(Math.random() * 20) + 80, // Score between 80-100
        weeklySummary: {
          sleepHours: (Math.random() * 2 + 7).toFixed(1),
          waterIntake: (Math.random() * 2 + 7).toFixed(1),
          steps: Math.floor(Math.random() * 2000) + 8000,
          caloriesBurned: Math.floor(Math.random() * 300) + 2000,
          mealsLogged: Math.floor(Math.random() * 5) + 16,
          workouts: Math.floor(Math.random() * 3) + 3
        },
        dailyNutrition,
        weeklyTrends
      };
    };

    // Simulate API calls and generate real-time data
    const fetchData = async () => {
      if (isUpdating.current) return;
      
      try {
        isUpdating.current = true;
        setLoading(true);
        
        // Generate fresh data based on loggedFoods
        const newData = generateRealTimeData(loggedFoods);
        setDashboardData(newData);
        
        setLoading(false);
        
        // Only show toast once per hour
        const now = Date.now();
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        
        if (now - lastToastTime.current > oneHour) {
          toast.success('📊 Dashboard data updated with latest trends!');
          lastToastTime.current = now;
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('❌ Failed to load dashboard data');
        setLoading(false);
      } finally {
        isUpdating.current = false;
      }
    };

    // Debounce the fetchData call
    const timeoutId = setTimeout(fetchData, 500);
    
    return () => clearTimeout(timeoutId);
    
    // Update data when loggedFoods changes
  }, [loggedFoods]);

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

  const SummaryCard = ({ icon, title, value, unit, color, trend }) => (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: `2px solid ${color}20`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: color
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          fontSize: '2rem',
          background: `${color}15`,
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
        <div>
          <h3 style={{ margin: 0, color: '#374151', fontSize: '0.875rem' }}>{title}</h3>
          <p style={{ margin: '0.25rem 0', fontSize: '1.5rem', fontWeight: 'bold', color }}>
            {value} <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{unit}</span>
          </p>
          {trend && (
            <p style={{ 
              margin: 0, 
              fontSize: '0.75rem', 
              color: trend > 0 ? '#22c55e' : '#ef4444' 
            }}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% vs last week
            </p>
          )}
        </div>
      </div>
    </div>
  );

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
      {/* Header */}
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
            <h1 style={{ margin: 0, color: '#1f2937' }}>Personal Health Dashboard</h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
              Welcome back, {user?.name || 'User'}! Here's your health overview for this week.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {['overview', 'nutrition', 'trends', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab ? '#22c55e' : '#f3f4f6',
                color: activeTab === tab ? 'white' : '#6b7280',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize',
                minWidth: '100px'
              }}
            >
              {tab === 'analytics' ? '📊 Analytics' : tab}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <SummaryCard
            icon="😴"
            title="Average Sleep"
            value={dashboardData.weeklySummary.sleepHours}
            unit="hours"
            color="#8b5cf6"
            trend={5}
          />
          <SummaryCard
            icon="💧"
            title="Water Intake"
            value={dashboardData.weeklySummary.waterIntake}
            unit="glasses/day"
            color="#3b82f6"
            trend={12}
          />
          <SummaryCard
            icon="👟"
            title="Daily Steps"
            value={dashboardData.weeklySummary.steps.toLocaleString()}
            unit="steps"
            color="#22c55e"
            trend={-3}
          />
          <SummaryCard
            icon="🔥"
            title="Calories Burned"
            value={dashboardData.weeklySummary.caloriesBurned.toLocaleString()}
            unit="kcal"
            color="#f59e0b"
            trend={8}
          />
          <SummaryCard
            icon="🍽️"
            title="Meals Logged"
            value={dashboardData.weeklySummary.mealsLogged}
            unit="this week"
            color="#ef4444"
            trend={15}
          />
          <SummaryCard
            icon="💪"
            title="Workouts"
            value={dashboardData.weeklySummary.workouts}
            unit="sessions"
            color="#06b6d4"
            trend={20}
          />
        </motion.div>
      )}

      {/* Nutrition Score Ring */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 style={{ color: '#374151', marginBottom: '2rem', textAlign: 'center' }}>
          🧾 Overall Nutrition Score
        </h3>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{ width: '200px', height: '200px' }}>
            <CircularProgressbarWithChildren
              value={dashboardData.nutritionScore}
              styles={{
                path: {
                  stroke: dashboardData.nutritionScore >= 80 ? '#22c55e' : 
                         dashboardData.nutritionScore >= 60 ? '#f59e0b' : '#ef4444',
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
                  {dashboardData.nutritionScore}%
                </strong>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  {dashboardData.nutritionScore >= 80 ? 'Excellent!' : 
                   dashboardData.nutritionScore >= 60 ? 'Good Progress' : 'Keep Going!'}
                </div>
              </div>
            </CircularProgressbarWithChildren>
          </div>
        </div>
      </motion.div>

      {/* Weekly Meal Feedback Trend */}
      {(activeTab === 'overview' || activeTab === 'trends') && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>📊 Weekly Meal Feedback Trend</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.mealFeedbackTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="positive"
                  stackId="1"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="neutral"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="negative"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Most Frequently Eaten Foods */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>🔁 Most Frequently Eaten Foods</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dashboardData.frequentFoods}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Unified Food Logger Tab */}
      {activeTab === 'nutrition' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Food Logger Section */}
          <motion.div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>🍽️ Daily Food Logger</h3>
            <FoodLoggerForm 
              onFoodAdded={onFoodAdded || ((newFood) => {
                console.log('New food added:', newFood);
                toast.success(`Added ${newFood.name} to your ${newFood.mealType}!`);
              })}
            />
          </motion.div>

          {/* Today's Nutrition Summary */}
          <motion.div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>� Today's Nutrition Facts</h3>
            <TodaysNutritionSummary loggedFoods={loggedFoods} />
          </motion.div>

          {/* Daily Nutrition Breakdown Chart */}
          <motion.div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>�📈 Daily Nutrition Breakdown</h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.dailyNutrition}>
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
                  />
                  <Line 
                    type="monotone" 
                    dataKey="protein" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="carbs" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fats" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Weekly Trends Tab */}
      {activeTab === 'trends' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Weight & BMI Trends */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
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
              <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>⚖️ Weight Trends (This Week)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.weeklyTrends.weight}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    name="Current Weight (kg)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#6b7280" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Target Weight (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

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
              <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>📏 BMI Progress (This Week)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.weeklyTrends.bmi}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#22c55e" 
                    fill="#22c55e30"
                    strokeWidth={3}
                    name="Current BMI"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#6b7280" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Target BMI"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Activity Trends */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
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
              <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>🔥 Calorie Balance (This Week)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.weeklyTrends.calories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="consumed" fill="#ef4444" name="Calories Consumed" />
                  <Bar dataKey="burned" fill="#22c55e" name="Calories Burned" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

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
              <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>👟 Step Count Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.weeklyTrends.steps}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="count"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Steps"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Analytics Tab - placeholder for future analytics features */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Advanced Analytics</h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Detailed analytics and insights coming soon! This section will include advanced health metrics, 
            predictive analysis, and personalized recommendations based on your food logging patterns.
          </p>
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Coming Features:</h4>
            <ul style={{ textAlign: 'left', color: '#6b7280', lineHeight: '1.8' }}>
              <li>🎯 Personalized goal recommendations</li>
              <li>📈 Predictive health trends</li>
              <li>🔄 Habit formation tracking</li>
              <li>🏆 Achievement system</li>
              <li>📊 Comparative analysis</li>
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Unified Food Logger Components
const FoodLoggerForm = ({ onFoodAdded }) => {
  const [selectedFood, setSelectedFood] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState('breakfast');

  // Food database with nutritional information
  const foodDatabase = {
    'apple': { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
    'banana': { name: 'Banana', calories: 96, protein: 1.2, carbs: 24, fat: 0.2, fiber: 2.6 },
    'chicken_breast': { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
    'rice': { name: 'White Rice (1 cup)', calories: 205, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6 },
    'broccoli': { name: 'Broccoli (1 cup)', calories: 25, protein: 3, carbs: 5, fat: 0.3, fiber: 2.3 },
    'salmon': { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
    'quinoa': { name: 'Quinoa (1 cup)', calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5.2 },
    'spinach': { name: 'Spinach (1 cup)', calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, fiber: 0.7 },
    'greek_yogurt': { name: 'Greek Yogurt (1 cup)', calories: 130, protein: 23, carbs: 9, fat: 0, fiber: 0 },
    'almonds': { name: 'Almonds (1 oz)', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5 },
    'oatmeal': { name: 'Oatmeal (1 cup)', calories: 154, protein: 6, carbs: 28, fat: 3, fiber: 4 },
    'sweet_potato': { name: 'Sweet Potato (1 medium)', calories: 112, protein: 2, carbs: 26, fat: 0.1, fiber: 3.9 }
  };

  const handleAddFood = () => {
    if (!selectedFood || quantity <= 0) {
      toast.error('Please select a food and valid quantity');
      return;
    }

    const foodData = foodDatabase[selectedFood];
    if (!foodData) {
      toast.error('Food not found in database');
      return;
    }

    const nutritionData = {
      name: foodData.name,
      quantity: quantity,
      mealType: mealType,
      calories: Math.round(foodData.calories * quantity),
      protein: Math.round(foodData.protein * quantity * 10) / 10,
      carbs: Math.round(foodData.carbs * quantity * 10) / 10,
      fat: Math.round(foodData.fat * quantity * 10) / 10,
      fiber: Math.round(foodData.fiber * quantity * 10) / 10,
      timestamp: new Date().toISOString()
    };

    onFoodAdded(nutritionData);
    
    // Reset form
    setSelectedFood('');
    setQuantity(1);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
          Select Food
        </label>
        <select
          value={selectedFood}
          onChange={(e) => setSelectedFood(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
            background: 'white'
          }}
        >
          <option value="">Choose a food...</option>
          {Object.entries(foodDatabase).map(([key, food]) => (
            <option key={key} value={key}>{food.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
          Quantity
        </label>
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
          Meal Type
        </label>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
            background: 'white'
          }}
        >
          <option value="breakfast">🌅 Breakfast</option>
          <option value="lunch">☀️ Lunch</option>
          <option value="dinner">🌙 Dinner</option>
          <option value="snack">🍪 Snack</option>
        </select>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAddFood}
        style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'center'
        }}
      >
        <FaPlus /> Add Food
      </motion.button>
    </div>
  );
};

const TodaysNutritionSummary = ({ loggedFoods }) => {
  const todaysFoods = loggedFoods.filter(food => {
    const foodDate = new Date(food.timestamp).toDateString();
    const today = new Date().toDateString();
    return foodDate === today;
  });

  const totals = todaysFoods.reduce((acc, food) => ({
    calories: acc.calories + food.calories,
    protein: acc.protein + food.protein,
    carbs: acc.carbs + food.carbs,
    fat: acc.fat + food.fat,
    fiber: acc.fiber + food.fiber
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const mealBreakdown = todaysFoods.reduce((acc, food) => {
    if (!acc[food.mealType]) {
      acc[food.mealType] = { count: 0, calories: 0 };
    }
    acc[food.mealType].count++;
    acc[food.mealType].calories += food.calories;
    return acc;
  }, {});

  return (
    <div>
      {/* Total Nutrition Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '2px solid #fecaca' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>{Math.round(totals.calories)}</div>
          <div style={{ fontSize: '0.875rem', color: '#7f1d1d', fontWeight: '600' }}>Calories</div>
        </div>
        <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '2px solid #bbf7d0' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>{Math.round(totals.protein)}g</div>
          <div style={{ fontSize: '0.875rem', color: '#14532d', fontWeight: '600' }}>Protein</div>
        </div>
        <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '2px solid #bfdbfe' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{Math.round(totals.carbs)}g</div>
          <div style={{ fontSize: '0.875rem', color: '#1e3a8a', fontWeight: '600' }}>Carbs</div>
        </div>
        <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '2px solid #fed7aa' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>{Math.round(totals.fat)}g</div>
          <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '600' }}>Fat</div>
        </div>
        <div style={{ background: '#f5f3ff', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '2px solid #c4b5fd' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed' }}>{Math.round(totals.fiber)}g</div>
          <div style={{ fontSize: '0.875rem', color: '#4c1d95', fontWeight: '600' }}>Fiber</div>
        </div>
      </div>

      {/* Meal Breakdown */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ color: '#374151', marginBottom: '1rem' }}>🍽️ Today's Meals</h4>
        {Object.keys(mealBreakdown).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {Object.entries(mealBreakdown).map(([mealType, data]) => (
              <div key={mealType} style={{ 
                background: '#f9fafb', 
                padding: '1rem', 
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#374151', textTransform: 'capitalize' }}>
                  {mealType}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {data.count} items • {Math.round(data.calories)} cal
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: '#6b7280',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '2px dashed #e5e7eb'
          }}>
            No meals logged today. Start by adding your first food item above! 🍎
          </div>
        )}
      </div>

      {/* Recent Foods */}
      {todaysFoods.length > 0 && (
        <div>
          <h4 style={{ color: '#374151', marginBottom: '1rem' }}>📋 Recent Foods</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {todaysFoods.slice(-5).reverse().map((food, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem',
                marginBottom: '0.5rem',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#374151' }}>{food.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {food.mealType} • Qty: {food.quantity}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600', color: '#dc2626' }}>{food.calories} cal</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    P: {food.protein}g C: {food.carbs}g F: {food.fat}g
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
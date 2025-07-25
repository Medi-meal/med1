import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useNotifications } from '../hooks/useNotifications';

const UserDashboard = ({ user }) => {
  useNotifications();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
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

  // Generate real-time data
  const generateRealTimeData = () => {
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

    // Generate current week's daily nutrition
    const dailyNutrition = weekDays.map(day => ({
      day,
      calories: Math.floor(Math.random() * 300) + 1800,
      protein: Math.floor(Math.random() * 30) + 110,
      carbs: Math.floor(Math.random() * 40) + 170,
      fats: Math.floor(Math.random() * 15) + 60
    }));

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

  useEffect(() => {
    // Simulate API calls and generate real-time data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate fresh data
        const newData = generateRealTimeData();
        setDashboardData(newData);
        
        setLoading(false);
        toast.success('📊 Dashboard data updated with latest trends!');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('❌ Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
    
    // Update data every 30 seconds for real-time effect
    const interval = setInterval(() => {
      const newData = generateRealTimeData();
      setDashboardData(newData);
      toast.success('🔄 Data refreshed automatically');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
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
    </motion.div>
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

      {/* Daily Nutrition Breakdown */}
      {(activeTab === 'nutrition' || activeTab === 'trends') && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>📈 Daily Nutrition Breakdown</h3>
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
                    fill="#3b82f630"
                    strokeWidth={3}
                    name="Daily Steps"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#6b7280" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Daily Target"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Meal Feedback Trend */}
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
            <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>📈 Meal Feedback Trends (Last 4 Weeks)</h3>
            <ResponsiveContainer width="100%" height={350}>
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
                  name="Positive Feedback"
                />
                <Area 
                  type="monotone" 
                  dataKey="neutral" 
                  stackId="1" 
                  stroke="#f59e0b" 
                  fill="#f59e0b"
                  name="Neutral Feedback"
                />
                <Area 
                  type="monotone" 
                  dataKey="negative" 
                  stackId="1" 
                  stroke="#ef4444" 
                  fill="#ef4444"
                  name="Negative Feedback"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Food Frequency Chart */}
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
            <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>🥗 Most Frequently Consumed Foods</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dashboardData.frequentFoods} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="count" 
                  fill="#8884d8"
                  name="Times Consumed"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>
      )}

      {/* Quick Actions (Always visible) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>⚡ Quick Actions</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          {[
            { icon: '🍽️', title: 'Log Meal', color: '#22c55e' },
            { icon: '💧', title: 'Add Water', color: '#3b82f6' },
            { icon: '🏃‍♂️', title: 'Log Exercise', color: '#f59e0b' },
            { icon: '😴', title: 'Track Sleep', color: '#8b5cf6' },
            { icon: '📊', title: 'View Reports', color: '#ef4444' },
            { icon: '🎯', title: 'Set Goals', color: '#06b6d4' }
          ].map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.success(`${action.title} feature coming soon!`)}
              style={{
                background: `${action.color}15`,
                border: `2px solid ${action.color}30`,
                borderRadius: '12px',
                padding: '1rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                minHeight: '80px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{action.icon}</div>
              <div style={{ color: action.color, fontWeight: '600', fontSize: '0.875rem' }}>{action.title}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .navbar-content {
            padding: 0.5rem 1rem;
          }
          
          .grid-responsive {
            grid-template-columns: 1fr;
          }
          
          .tab-responsive {
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          
          .tab-responsive button {
            min-width: auto;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
        }
        
        @media (max-width: 640px) {
          .dashboard-container {
            padding: 1rem;
          }
          
          .chart-container {
            height: 250px;
          }
          
          .summary-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default UserDashboard;

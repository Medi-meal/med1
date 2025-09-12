import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import DashboardStats from './DashboardStats';
import ProgressTracker from './ProgressTracker';
import InteractiveVisualizations from './InteractiveVisualizations';

const ProgressAnalyticsTab = ({ user, healthProfile, stats }) => {
  const [activeView, setActiveView] = useState('overview');

  // Mock data for enhanced visualizations
  const weightProgressData = healthProfile?.weightHistory || [
    { month: 'Jan', weight: 75.2 },
    { month: 'Feb', weight: 74.8 },
    { month: 'Mar', weight: 74.1 },
    { month: 'Apr', weight: 73.5 },
    { month: 'May', weight: 72.9 },
    { month: 'Jun', weight: 72.3 },
  ];

  const caloriesData = stats?.caloriesTrend || [];
  
  const nutritionData = [
    { name: 'Protein', value: stats?.nutritionBreakdown?.protein || 25, fill: '#8884d8' },
    { name: 'Carbs', value: stats?.nutritionBreakdown?.carbs || 45, fill: '#82ca9d' },
    { name: 'Fat', value: stats?.nutritionBreakdown?.fat || 20, fill: '#ffc658' },
    { name: 'Fiber', value: stats?.nutritionBreakdown?.fiber || 10, fill: '#ff7300' }
  ];

  const weeklyProgress = stats?.weeklyProgress || [];

  const progressMetrics = [
    {
      title: 'Weight Progress',
      current: healthProfile?.weight || 70,
      target: healthProfile?.targetWeight || 65,
      unit: 'kg',
      trend: -2.3,
      color: '#10b981'
    },
    {
      title: 'Calories/Day',
      current: 1850,
      target: healthProfile?.targetCalories || 2000,
      unit: 'kcal',
      trend: -150,
      color: '#3b82f6'
    },
    {
      title: 'Exercise Days',
      current: 4,
      target: 5,
      unit: 'days/week',
      trend: +1,
      color: '#f59e0b'
    },
    {
      title: 'Sleep Quality',
      current: 7.2,
      target: 8,
      unit: 'hours',
      trend: +0.5,
      color: '#8b5cf6'
    }
  ];

  const views = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'weight', label: 'Weight Tracking', icon: '⚖️' },
    { id: 'nutrition', label: 'Nutrition Analysis', icon: '🥗' },
    { id: 'activity', label: 'Activity Metrics', icon: '🏃‍♂️' }
  ];

  const renderOverview = () => (
    <div className="overview-grid">
      {/* Progress Metrics Cards */}
      <div className="metrics-grid">
        {progressMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            className="metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="metric-header">
              <h3>{metric.title}</h3>
              <span 
                className={`trend ${metric.trend > 0 ? 'positive' : 'negative'}`}
                style={{ color: metric.color }}
              >
                {metric.trend > 0 ? '↗️' : '↘️'} {Math.abs(metric.trend)}{metric.unit}
              </span>
            </div>
            <div className="metric-values">
              <span className="current-value" style={{ color: metric.color }}>
                {metric.current} {metric.unit}
              </span>
              <span className="target-value">
                Target: {metric.target} {metric.unit}
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${Math.min((metric.current / metric.target) * 100, 100)}%`,
                  backgroundColor: metric.color
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <motion.div
        className="quick-stats-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <DashboardStats user={user} stats={stats} />
      </motion.div>
    </div>
  );

  const renderWeightTracking = () => (
    <div className="weight-tracking-section">
      <motion.div
        className="chart-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3>Weight Progress Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={weightProgressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        className="weight-insights"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4>Weight Loss Insights</h4>
        <div className="insights-grid">
          <div className="insight-card">
            <span className="insight-icon">📉</span>
            <div>
              <h5>Total Loss</h5>
              <p>2.9 kg in 6 months</p>
            </div>
          </div>
          <div className="insight-card">
            <span className="insight-icon">⚡</span>
            <div>
              <h5>Rate</h5>
              <p>0.48 kg per month</p>
            </div>
          </div>
          <div className="insight-card">
            <span className="insight-icon">🎯</span>
            <div>
              <h5>To Goal</h5>
              <p>{Math.max(0, (parseFloat(healthProfile?.weight || 70) - parseFloat(healthProfile?.targetWeight || 65))).toFixed(1)} kg remaining</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderNutritionAnalysis = () => (
    <div className="nutrition-analysis-section">
      <div className="nutrition-charts-grid">
        <motion.div
          className="chart-container"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3>Macro Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={nutritionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {nutritionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="chart-container"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3>Weekly Nutrition Intake</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calories" fill="#3b82f6" name="Calories" />
              <Bar dataKey="protein" fill="#10b981" name="Protein (g)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        className="nutrition-insights"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4>Nutrition Insights</h4>
        <div className="insights-grid">
          <div className="insight-card">
            <span className="insight-icon">💪</span>
            <div>
              <h5>Protein Intake</h5>
              <p>Meeting daily goals 85% of the time</p>
            </div>
          </div>
          <div className="insight-card">
            <span className="insight-icon">🌾</span>
            <div>
              <h5>Fiber Intake</h5>
              <p>Below recommended (increase fruits & vegetables)</p>
            </div>
          </div>
          <div className="insight-card">
            <span className="insight-icon">💧</span>
            <div>
              <h5>Hydration</h5>
              <p>Good! Average 8 glasses per day</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderActivityMetrics = () => (
    <motion.div
      className="activity-metrics-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ProgressTracker user={user} healthProfile={healthProfile} stats={stats} />
      <div className="activity-visualizations">
        <InteractiveVisualizations user={user} healthProfile={healthProfile} stats={stats} />
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'weight':
        return renderWeightTracking();
      case 'nutrition':
        return renderNutritionAnalysis();
      case 'activity':
        return renderActivityMetrics();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="progress-analytics-tab">
      {/* View Navigation */}
      <motion.div 
        className="view-navigation"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {views.map((view) => (
          <motion.button
            key={view.id}
            className={`view-button ${activeView === view.id ? 'active' : ''}`}
            onClick={() => setActiveView(view.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="view-icon">{view.icon}</span>
            <span className="view-label">{view.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          className="view-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProgressAnalyticsTab;

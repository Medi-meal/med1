import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodLogger from './FoodLogger';
import MealTracker from './MealTracker';
import MealSync from './MealSync';

const FoodMealsTab = ({ user }) => {
  const [activeSection, setActiveSection] = useState('logger');
  const [geminiEnabled, setGeminiEnabled] = useState(false);

  const sections = [
    { 
      id: 'logger', 
      label: 'Food Logger', 
      icon: '📝',
      description: 'Log your meals and track nutrition'
    },
    { 
      id: 'tracker', 
      label: 'Meal Tracker', 
      icon: '🍽️',
      description: 'Track meal timing and patterns'
    },
    { 
      id: 'sync', 
      label: 'Meal Sync', 
      icon: '🔄',
      description: 'Sync with external apps and devices'
    }
  ];

  const renderGeminiFeatures = () => (
    <motion.div
      className="gemini-features"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: geminiEnabled ? 1 : 0, height: geminiEnabled ? 'auto' : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="gemini-options">
        <motion.button
          className="gemini-option photo"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Implement photo upload with Gemini API
            console.log('Photo analysis with Gemini API');
          }}
        >
          <span className="option-icon">📷</span>
          <div className="option-content">
            <h4>Photo Analysis</h4>
            <p>Take a photo of your meal for instant nutrition analysis</p>
          </div>
        </motion.button>

        <motion.button
          className="gemini-option voice"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Implement voice input with Gemini API
            console.log('Voice input with Gemini API');
          }}
        >
          <span className="option-icon">🎤</span>
          <div className="option-content">
            <h4>Voice Input</h4>
            <p>Describe your meal verbally for quick logging</p>
          </div>
        </motion.button>

        <motion.button
          className="gemini-option smart"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Implement smart suggestions with Gemini API
            console.log('Smart suggestions with Gemini API');
          }}
        >
          <span className="option-icon">🤖</span>
          <div className="option-content">
            <h4>Smart Suggestions</h4>
            <p>Get AI-powered meal recommendations based on your goals</p>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );

  const renderQuickActions = () => (
    <motion.div
      className="quick-actions-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3>🚀 Quick Actions</h3>
      <div className="quick-actions-grid">
        <motion.button
          className="quick-action breakfast"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Quick log breakfast
            console.log('Quick log breakfast');
          }}
        >
          <span>🌅</span>
          <span>Log Breakfast</span>
        </motion.button>

        <motion.button
          className="quick-action lunch"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Quick log lunch
            console.log('Quick log lunch');
          }}
        >
          <span>☀️</span>
          <span>Log Lunch</span>
        </motion.button>

        <motion.button
          className="quick-action dinner"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Quick log dinner
            console.log('Quick log dinner');
          }}
        >
          <span>🌙</span>
          <span>Log Dinner</span>
        </motion.button>

        <motion.button
          className="quick-action snack"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Quick log snack
            console.log('Quick log snack');
          }}
        >
          <span>🍎</span>
          <span>Log Snack</span>
        </motion.button>
      </div>
    </motion.div>
  );

  const renderTodaysSummary = () => (
    <motion.div
      className="todays-summary"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3>📊 Today's Summary</h3>
      <div className="summary-cards">
        <div className="summary-card calories">
          <div className="card-header">
            <span className="card-icon">🔥</span>
            <span className="card-title">Calories</span>
          </div>
          <div className="card-value">
            <span className="current">1,450</span>
            <span className="target">/ 2,000</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '72.5%', backgroundColor: '#f59e0b' }}></div>
          </div>
        </div>

        <div className="summary-card protein">
          <div className="card-header">
            <span className="card-icon">💪</span>
            <span className="card-title">Protein</span>
          </div>
          <div className="card-value">
            <span className="current">85g</span>
            <span className="target">/ 120g</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '70.8%', backgroundColor: '#10b981' }}></div>
          </div>
        </div>

        <div className="summary-card carbs">
          <div className="card-header">
            <span className="card-icon">🌾</span>
            <span className="card-title">Carbs</span>
          </div>
          <div className="card-value">
            <span className="current">180g</span>
            <span className="target">/ 250g</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '72%', backgroundColor: '#3b82f6' }}></div>
          </div>
        </div>

        <div className="summary-card fat">
          <div className="card-header">
            <span className="card-icon">🥑</span>
            <span className="card-title">Fat</span>
          </div>
          <div className="card-value">
            <span className="current">55g</span>
            <span className="target">/ 80g</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '68.75%', backgroundColor: '#8b5cf6' }}></div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'logger':
        return (
          <div className="logger-section">
            {renderTodaysSummary()}
            {renderQuickActions()}
            <FoodLogger user={user} />
          </div>
        );
      case 'tracker':
        return (
          <div className="tracker-section">
            <MealTracker user={user} />
          </div>
        );
      case 'sync':
        return (
          <div className="sync-section">
            <MealSync user={user} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="food-meals-tab">
      {/* Gemini AI Toggle */}
      <motion.div
        className="gemini-toggle-section"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="toggle-header">
          <h3>🤖 AI-Powered Features</h3>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={geminiEnabled}
              onChange={(e) => setGeminiEnabled(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <p>Enable AI features for photo analysis, voice input, and smart suggestions</p>
        {renderGeminiFeatures()}
      </motion.div>

      {/* Section Navigation */}
      <motion.div
        className="section-navigation"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {sections.map((section) => (
          <motion.button
            key={section.id}
            className={`section-button ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="section-icon">{section.icon}</span>
            <div className="section-content">
              <span className="section-label">{section.label}</span>
              <span className="section-description">{section.description}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          className="section-content-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderSectionContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FoodMealsTab;

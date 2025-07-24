import React, { useState, useEffect } from 'react';
import { calculateBMI, getBMICategory } from '../utils/validation';

const PersonalizedDashboard = ({ user, healthProfile, stats }) => {
  const [personalizedInsights, setPersonalizedInsights] = useState([]);
  const [healthTips, setHealthTips] = useState([]);
  const [todaysGoal, setTodaysGoal] = useState(null);

  useEffect(() => {
    const generatePersonalizedContent = () => {
      if (!healthProfile) return;

      const insights = [];
      const tips = [];

      // BMI-based insights
      if (healthProfile.weight && healthProfile.height) {
        const bmi = calculateBMI(healthProfile.weight, healthProfile.height);
        const bmiCategory = getBMICategory(bmi);
        
        insights.push({
          type: 'bmi',
          title: 'BMI Status',
          value: bmi,
          category: bmiCategory.category,
          color: bmiCategory.color,
          emoji: bmiCategory.emoji,
          description: `Your BMI is ${bmi}, which falls in the ${bmiCategory.category.toLowerCase()} category.`
        });

        // BMI-specific tips
        if (bmiCategory.category === 'Underweight') {
          tips.push({
            icon: '🍽️',
            title: 'Healthy Weight Gain',
            description: 'Focus on nutrient-dense, calorie-rich foods like nuts, avocados, and lean proteins.',
            priority: 'high'
          });
        } else if (bmiCategory.category === 'Overweight' || bmiCategory.category === 'Obese') {
          tips.push({
            icon: '🥗',
            title: 'Weight Management',
            description: 'Incorporate more vegetables and reduce portion sizes. Aim for regular physical activity.',
            priority: 'high'
          });
        }
      }

      // Age-based insights
      const age = parseInt(healthProfile.age);
      if (age) {
        if (age >= 65) {
          tips.push({
            icon: '🦴',
            title: 'Bone Health',
            description: 'Focus on calcium and vitamin D rich foods. Include dairy, leafy greens, and fish.',
            priority: 'medium'
          });
        } else if (age >= 40) {
          tips.push({
            icon: '❤️',
            title: 'Heart Health',
            description: 'Limit sodium intake and include omega-3 rich foods like salmon and walnuts.',
            priority: 'medium'
          });
        } else if (age <= 25) {
          tips.push({
            icon: '💪',
            title: 'Building Strong Foundation',
            description: 'Focus on protein for muscle development and calcium for bone strength.',
            priority: 'medium'
          });
        }
      }

      // Activity level insights
      if (healthProfile.activityLevel) {
        const activityInsights = {
          'sedentary': {
            icon: '🚶',
            title: 'Increase Movement',
            description: 'Try to incorporate light walking and stretching throughout the day.',
            priority: 'high'
          },
          'light': {
            icon: '🏃',
            title: 'Great Start!',
            description: 'Consider adding one more day of activity to boost your fitness level.',
            priority: 'medium'
          },
          'moderate': {
            icon: '💯',
            title: 'Well Balanced',
            description: 'Excellent activity level! Focus on variety in your workouts.',
            priority: 'low'
          },
          'active': {
            icon: '🏆',
            title: 'Highly Active',
            description: 'Ensure adequate nutrition and recovery to support your active lifestyle.',
            priority: 'medium'
          },
          'very_active': {
            icon: '🔥',
            title: 'Athletic Performance',
            description: 'Focus on proper nutrition timing and adequate protein for recovery.',
            priority: 'high'
          }
        };

        if (activityInsights[healthProfile.activityLevel]) {
          tips.push(activityInsights[healthProfile.activityLevel]);
        }
      }

      // Medication-based tips
      if (healthProfile.medications && healthProfile.medications.length > 0) {
        tips.push({
          icon: '⏰',
          title: 'Medication Timing',
          description: 'Some medications work better when taken with or without food. Check with your doctor.',
          priority: 'high'
        });
      }

      // Health goals insights
      if (healthProfile.healthGoals && healthProfile.healthGoals.length > 0) {
        const goalInsights = {
          'Weight Loss': {
            icon: '⚖️',
            title: 'Weight Loss Focus',
            description: 'Create a moderate calorie deficit through portion control and increased activity.',
            priority: 'high'
          },
          'Weight Gain': {
            icon: '📈',
            title: 'Healthy Weight Gain',
            description: 'Add 300-500 calories daily through healthy, nutrient-dense foods.',
            priority: 'high'
          },
          'Muscle Building': {
            icon: '💪',
            title: 'Muscle Development',
            description: 'Aim for 1.6-2.2g protein per kg body weight and resistance training.',
            priority: 'high'
          },
          'Diabetes Management': {
            icon: '🩺',
            title: 'Blood Sugar Control',
            description: 'Focus on complex carbs, fiber, and consistent meal timing.',
            priority: 'high'
          },
          'Heart Health': {
            icon: '❤️',
            title: 'Cardiovascular Wellness',
            description: 'Limit saturated fats, increase omega-3s, and reduce sodium intake.',
            priority: 'high'
          }
        };

        healthProfile.healthGoals.forEach(goal => {
          if (goalInsights[goal]) {
            tips.push(goalInsights[goal]);
          }
        });
      }

      // Generate today's goal
      const goals = [
        { icon: '💧', text: 'Drink 8 glasses of water', type: 'hydration' },
        { icon: '🥬', text: 'Eat 5 servings of fruits & vegetables', type: 'nutrition' },
        { icon: '🚶', text: 'Take 10,000 steps', type: 'activity' },
        { icon: '😴', text: 'Get 7-8 hours of sleep', type: 'rest' },
        { icon: '🧘', text: 'Practice 10 minutes of mindfulness', type: 'mental' }
      ];

      const randomGoal = goals[Math.floor(Math.random() * goals.length)];
      setTodaysGoal(randomGoal);

      setPersonalizedInsights(insights);
      setHealthTips(tips.slice(0, 4)); // Limit to 4 tips
    };

    generatePersonalizedContent();
  }, [healthProfile, stats]);

  const getStreakInfo = () => {
    const streak = stats?.healthStreak || 0;
    let streakMessage = '';
    let streakColor = '#6b7280';
    
    if (streak === 0) {
      streakMessage = 'Start your health journey today!';
      streakColor = '#3b82f6';
    } else if (streak < 7) {
      streakMessage = 'Building momentum!';
      streakColor = '#f59e0b';
    } else if (streak < 30) {
      streakMessage = 'Great consistency!';
      streakColor = '#22c55e';
    } else {
      streakMessage = 'Amazing dedication!';
      streakColor = '#8b5cf6';
    }

    return { message: streakMessage, color: streakColor };
  };

  const streakInfo = getStreakInfo();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Section */}
      <div style={{
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        borderRadius: '16px',
        padding: '1.5rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
            Welcome back, {user?.name || 'User'}! 👋
          </h2>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {streakInfo.message} You're on a {stats?.healthStreak || 0}-day streak!
          </p>
        </div>
      </div>

      {/* Today's Goal */}
      {todaysGoal && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '2px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            margin: '0 0 0.75rem 0',
            color: '#1f2937',
            fontSize: '1.125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🎯 Today's Goal
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            background: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <span style={{ fontSize: '1.5rem' }}>{todaysGoal.icon}</span>
            <span style={{ color: '#166534', fontWeight: '500' }}>
              {todaysGoal.text}
            </span>
          </div>
        </div>
      )}

      {/* Personalized Insights */}
      {personalizedInsights.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '2px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: '#1f2937',
            fontSize: '1.125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📊 Your Health Insights
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {personalizedInsights.map((insight, index) => (
              <div
                key={index}
                style={{
                  padding: '1rem',
                  background: insight.color + '10',
                  border: `2px solid ${insight.color}30`,
                  borderRadius: '8px'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>{insight.emoji}</span>
                  <h4 style={{ margin: 0, color: insight.color, fontSize: '1rem' }}>
                    {insight.title}
                  </h4>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.4'
                }}>
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Tips */}
      {healthTips.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '2px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: '#1f2937',
            fontSize: '1.125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            💡 Personalized Tips
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {healthTips.map((tip, index) => (
              <div
                key={index}
                style={{
                  padding: '1rem',
                  background: tip.priority === 'high' ? '#fef2f2' : 
                             tip.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                  border: `2px solid ${
                    tip.priority === 'high' ? '#fecaca' : 
                    tip.priority === 'medium' ? '#fed7aa' : '#bbf7d0'
                  }`,
                  borderRadius: '8px'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>{tip.icon}</span>
                  <h4 style={{
                    margin: 0,
                    color: tip.priority === 'high' ? '#dc2626' : 
                           tip.priority === 'medium' ? '#d97706' : '#166534',
                    fontSize: '1rem'
                  }}>
                    {tip.title}
                  </h4>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.4'
                }}>
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedDashboard;

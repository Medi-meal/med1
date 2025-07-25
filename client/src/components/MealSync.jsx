import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const MealSync = ({ user }) => {
  const [syncData, setSyncData] = useState({
    recommendations: {},
    actualIntake: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    },
    totals: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');

  const mealEmojis = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎'
  };

  // Fetch synchronized meal data
  const fetchSyncData = async () => {
    if (!user || !user.email) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/meal-sync?email=${encodeURIComponent(user.email)}`);
      if (response.data.success) {
        setSyncData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching meal sync data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add single recommended food to actual intake
  const addRecommendedFood = async (food, mealType, nutritionData) => {
    try {
      await axios.post(`${API_URL}/api/add-recommended-food`, {
        email: user.email,
        food: food,
        mealType: mealType,
        nutritionData: nutritionData
      });
      
      // Refresh sync data
      await fetchSyncData();
      
    } catch (error) {
      console.error('Error adding recommended food:', error);
      alert('Failed to add food. Please try again.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user || !user.email) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/meal-sync?email=${encodeURIComponent(user.email)}`);
        if (response.data.success) {
          setSyncData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching meal sync data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading meal synchronization data...</div>
      </div>
    );
  }

  const getMealRecommendations = (mealType) => {
    return syncData.recommendations[mealType]?.foods || [];
  };

  const getMealIntake = (mealType) => {
    return syncData.actualIntake[mealType] || [];
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1f2937' }}>
          🔄 Synchronized Meal Tracking
        </h2>

        {/* Meal Type Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          {Object.keys(mealEmojis).map(mealType => (
            <button
              key={mealType}
              onClick={() => setSelectedMeal(mealType)}
              style={{
                margin: '0 0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: selectedMeal === mealType ? '#3b82f6' : 'white',
                color: selectedMeal === mealType ? 'white' : '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              {mealEmojis[mealType]} {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* AI Recommendations Column */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#059669', marginBottom: '1rem', borderBottom: '2px solid #d1fae5', paddingBottom: '0.5rem' }}>
              🤖 AI Recommendations for {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}
            </h3>
            
            {getMealRecommendations(selectedMeal).length === 0 ? (
              <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No recommendations available for this meal.</p>
            ) : (
              <div>
                {getMealRecommendations(selectedMeal).map((food, index) => (
                  <div key={index} style={{
                    padding: '0.75rem',
                    marginBottom: '0.75rem',
                    backgroundColor: food.isTaken ? '#d1fae5' : '#f9fafb',
                    border: `2px solid ${food.isTaken ? '#10b981' : '#e5e7eb'}`,
                    borderRadius: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                        {food.isTaken && '✅ '}{food.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {food.calories}cal | {food.protein}g protein | {food.benefits}
                      </div>
                      {food.isTaken && food.takenAt && (
                        <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                          Added: {new Date(food.takenAt).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                    
                    {!food.isTaken && (
                      <button
                        onClick={() => addRecommendedFood(food.name, selectedMeal, {
                          calories: food.calories || 0,
                          protein: food.protein || 0,
                          carbs: food.carbs || 0,
                          fat: food.fat || 0,
                          fiber: food.fiber || 0
                        })}
                        style={{
                          marginLeft: '1rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Add to Intake
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actual Intake Column */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#dc2626', marginBottom: '1rem', borderBottom: '2px solid #fecaca', paddingBottom: '0.5rem' }}>
              🍽️ Actual Intake for {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}
            </h3>
            
            {getMealIntake(selectedMeal).length === 0 ? (
              <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No foods logged for this meal yet.</p>
            ) : (
              <div>
                {getMealIntake(selectedMeal).map((food, index) => (
                  <div key={index} style={{
                    padding: '0.75rem',
                    marginBottom: '0.75rem',
                    backgroundColor: food.isRecommended ? '#ecfdf5' : '#f9fafb',
                    border: `2px solid ${food.isRecommended ? '#10b981' : '#f3f4f6'}`,
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                          {food.isRecommended && '🤖 '}{food.food}
                          {food.quantity && ` (${food.quantity})`}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {food.calories}cal | {food.protein}g protein | {food.carbs}g carbs | {food.fat}g fat
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {food.source === 'recommendation' ? 'From AI Recommendation' : 'Manually Added'} 
                          {' • '}{new Date(food.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Daily Nutrition Summary */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#7c3aed', marginBottom: '1rem' }}>📊 Today's Nutrition Summary</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
            {Object.entries(syncData.totals).map(([nutrient, value]) => (
              <div key={nutrient} style={{
                textAlign: 'center',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                  {Math.round(value)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'capitalize' }}>
                  {nutrient}
                  {nutrient === 'calories' ? '' : 'g'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={fetchSyncData}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            🔄 Refresh Meal Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealSync;

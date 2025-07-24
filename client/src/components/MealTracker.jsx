import React, { useState } from 'react';

const MealTracker = () => {
  const [todayMeals, setTodayMeals] = useState({
    breakfast: { eaten: false, foods: [] },
    lunch: { eaten: false, foods: [] },
    dinner: { eaten: false, foods: [] },
    snacks: { eaten: false, foods: [] }
  });
  
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [newFood, setNewFood] = useState('');

  const mealEmojis = {
    breakfast: '🌅',
    lunch: '☀️', 
    dinner: '🌙',
    snacks: '🍎'
  };

  const addFood = () => {
    if (newFood.trim()) {
      setTodayMeals(prev => ({
        ...prev,
        [selectedMeal]: {
          ...prev[selectedMeal],
          foods: [...prev[selectedMeal].foods, newFood.trim()]
        }
      }));
      setNewFood('');
    }
  };

  const markMealComplete = (mealType) => {
    setTodayMeals(prev => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        eaten: !prev[mealType].eaten
      }
    }));
  };

  const removeFood = (mealType, foodIndex) => {
    setTodayMeals(prev => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        foods: prev[mealType].foods.filter((_, index) => index !== foodIndex)
      }
    }));
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    }}>
      <h3 style={{ 
        color: '#1f2937', 
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        📊 Today's Meal Tracker
      </h3>

      {/* Meal Type Selector */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {Object.keys(todayMeals).map(mealType => (
          <button
            key={mealType}
            onClick={() => setSelectedMeal(mealType)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: selectedMeal === mealType ? '#22c55e' : '#f3f4f6',
              color: selectedMeal === mealType ? 'white' : '#6b7280',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize'
            }}
          >
            {mealEmojis[mealType]} {mealType}
          </button>
        ))}
      </div>

      {/* Add Food Section */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          value={newFood}
          onChange={(e) => setNewFood(e.target.value)}
          placeholder={`Add food to ${selectedMeal}`}
          style={{
            flex: '1',
            minWidth: '200px',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '0.875rem'
          }}
          onKeyPress={(e) => e.key === 'Enter' && addFood()}
        />
        <button
          onClick={addFood}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Add Food
        </button>
      </div>

      {/* Meals Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem'
      }}>
        {Object.entries(todayMeals).map(([mealType, meal]) => (
          <div
            key={mealType}
            style={{
              background: meal.eaten ? '#dcfce7' : '#f9fafb',
              border: meal.eaten ? '2px solid #22c55e' : '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1rem',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <h4 style={{ 
                margin: 0, 
                textTransform: 'capitalize',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {mealEmojis[mealType]} {mealType}
              </h4>
              <button
                onClick={() => markMealComplete(mealType)}
                style={{
                  background: meal.eaten ? '#22c55e' : '#e5e7eb',
                  color: meal.eaten ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {meal.eaten ? '✓ Complete' : 'Mark Complete'}
              </button>
            </div>

            <div style={{ minHeight: '60px' }}>
              {meal.foods.length === 0 ? (
                <p style={{ 
                  color: '#9ca3af', 
                  fontSize: '0.875rem',
                  margin: 0,
                  fontStyle: 'italic'
                }}>
                  No foods added yet
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {meal.foods.map((food, index) => (
                    <span
                      key={index}
                      style={{
                        background: '#e5e7eb',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {food}
                      <button
                        onClick={() => removeFood(mealType, index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '0.75rem'
                        }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealTracker;

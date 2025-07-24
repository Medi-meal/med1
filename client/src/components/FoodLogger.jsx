import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const FoodLogger = ({ user }) => {
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [currentMeal, setCurrentMeal] = useState({
    type: 'breakfast',
    foods: [],
    totalCalories: 0,
    notes: ''
  });
  const [foodInput, setFoodInput] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const { showSuccess, showError } = useNotifications();

  // Sample food database
  const foodDatabase = [
    { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, portion: '1 medium' },
    { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, portion: '1 medium' },
    { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: '100g' },
    { name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, portion: '1 cup cooked' },
    { name: 'Broccoli', calories: 55, protein: 4, carbs: 11, fat: 0.6, portion: '1 cup' },
    { name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14, portion: '28g (23 nuts)' },
    { name: 'Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0, portion: '1 cup non-fat' },
    { name: 'Oatmeal', calories: 154, protein: 5, carbs: 28, fat: 3, portion: '1 cup cooked' },
    { name: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 12, portion: '100g' },
    { name: 'Sweet Potato', calories: 112, protein: 2, carbs: 26, fat: 0.1, portion: '1 medium' }
  ];

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snack', label: 'Snack', icon: '🍎' }
  ];

  const todayMeals = loggedMeals.filter(meal => {
    const today = new Date().toDateString();
    return new Date(meal.timestamp).toDateString() === today;
  });

  const todayStats = todayMeals.reduce((acc, meal) => {
    acc.calories += meal.totalCalories;
    acc.protein += meal.foods.reduce((sum, food) => sum + food.protein, 0);
    acc.carbs += meal.foods.reduce((sum, food) => sum + food.carbs, 0);
    acc.fat += meal.foods.reduce((sum, food) => sum + food.fat, 0);
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const searchFoods = (query) => {
    if (!query) return [];
    return foodDatabase.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  };

  const addFoodToMeal = (food) => {
    const newFood = { ...food, id: Date.now() };
    setCurrentMeal(prev => ({
      ...prev,
      foods: [...prev.foods, newFood],
      totalCalories: prev.totalCalories + food.calories
    }));
    setFoodInput('');
    setSelectedFood(null);
  };

  const removeFoodFromMeal = (foodId) => {
    const foodToRemove = currentMeal.foods.find(f => f.id === foodId);
    setCurrentMeal(prev => ({
      ...prev,
      foods: prev.foods.filter(f => f.id !== foodId),
      totalCalories: prev.totalCalories - foodToRemove.calories
    }));
  };

  const logMeal = () => {
    if (currentMeal.foods.length === 0) {
      showError('Please add at least one food item to log the meal');
      return;
    }

    const newMeal = {
      ...currentMeal,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: user?.email
    };

    setLoggedMeals(prev => [...prev, newMeal]);
    setCurrentMeal({
      type: 'breakfast',
      foods: [],
      totalCalories: 0,
      notes: ''
    });
    
    showSuccess(`${mealTypes.find(m => m.value === newMeal.type)?.label} logged successfully!`);
  };

  const NutritionCard = ({ label, value, unit, color, icon }) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>
        {Math.round(value)}{unit}
      </div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{label}</div>
    </div>
  );

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
        <span style={{ fontSize: '1.5rem' }}>🍽️</span>
        <h2 style={{ margin: 0, color: '#1f2937' }}>Food Logger</h2>
      </div>

      {/* Today's Summary */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#374151', marginBottom: '1rem' }}>📊 Today's Nutrition</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <NutritionCard
            label="Calories"
            value={todayStats.calories}
            unit=" kcal"
            color="#22c55e"
            icon="🔥"
          />
          <NutritionCard
            label="Protein"
            value={todayStats.protein}
            unit="g"
            color="#3b82f6"
            icon="💪"
          />
          <NutritionCard
            label="Carbs"
            value={todayStats.carbs}
            unit="g"
            color="#f59e0b"
            icon="🌾"
          />
          <NutritionCard
            label="Fat"
            value={todayStats.fat}
            unit="g"
            color="#ef4444"
            icon="🥑"
          />
        </div>
      </div>

      {/* Add New Meal */}
      <div style={{ 
        background: '#f8fafc',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>➕ Log New Meal</h3>
        
        {/* Meal Type Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
            color: '#374151'
          }}>
            Meal Type
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {mealTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setCurrentMeal(prev => ({ ...prev, type: type.value }))}
                style={{
                  padding: '0.5rem 1rem',
                  border: `2px solid ${currentMeal.type === type.value ? '#22c55e' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  background: currentMeal.type === type.value ? '#f0fdf4' : 'white',
                  color: currentMeal.type === type.value ? '#166534' : '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                <span>{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Food Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
            color: '#374151'
          }}>
            Search Foods
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              placeholder="Type food name..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
            {foodInput && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                zIndex: 10,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {searchFoods(foodInput).map((food, index) => (
                  <div
                    key={index}
                    onClick={() => addFoodToMeal(food)}
                    style={{
                      padding: '0.75rem',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.target.style.background = '#f8fafc'}
                    onMouseOut={e => e.target.style.background = 'white'}
                  >
                    <div style={{ fontWeight: '500', color: '#1f2937' }}>{food.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {food.calories} cal • {food.portion}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current Meal Foods */}
        {currentMeal.foods.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Current Meal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {currentMeal.foods.map((food) => (
                <div key={food.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#1f2937' }}>{food.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {food.calories} cal • {food.portion}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFoodFromMeal(food.id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div style={{ 
              marginTop: '1rem',
              padding: '0.75rem',
              background: '#f0fdf4',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <strong>Total: {currentMeal.totalCalories} calories</strong>
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
            color: '#374151'
          }}>
            Notes (optional)
          </label>
          <textarea
            value={currentMeal.notes}
            onChange={(e) => setCurrentMeal(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="How did you feel after this meal?"
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Log Meal Button */}
        <button
          onClick={logMeal}
          style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={e => e.target.style.transform = 'translateY(-1px)'}
          onMouseOut={e => e.target.style.transform = 'translateY(0)'}
        >
          🍽️ Log Meal
        </button>
      </div>

      {/* Today's Meals */}
      {todayMeals.length > 0 && (
        <div>
          <h3 style={{ color: '#374151', marginBottom: '1.5rem' }}>📝 Today's Meals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {todayMeals.map((meal) => (
              <div key={meal.id} style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{mealTypes.find(m => m.value === meal.type)?.icon}</span>
                    <strong style={{ color: '#1f2937' }}>
                      {mealTypes.find(m => m.value === meal.type)?.label}
                    </strong>
                  </div>
                  <span style={{ 
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    {new Date(meal.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  {meal.foods.map(f => f.name).join(', ')} • {meal.totalCalories} calories
                </div>
                {meal.notes && (
                  <div style={{ 
                    fontSize: '0.875rem',
                    color: '#374151',
                    fontStyle: 'italic',
                    background: 'white',
                    padding: '0.5rem',
                    borderRadius: '6px'
                  }}>
                    "{meal.notes}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodLogger;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './GeminiRecommend.css';
import ProgressTracker from '../components/ProgressTracker';
import UserDashboard from '../components/UserDashboard';

const steps = [
  { name: 'age', label: 'Age', type: 'number', required: true },
  { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
  { name: 'foodType', label: 'Food Type', type: 'select', options: ['veg', 'nonveg', 'vegan', 'both'], required: true },
  { name: 'weightHeightBmi', label: 'Weight, Height & BMI', type: 'bmi', required: false },
  { name: 'medication', label: 'Medication', type: 'text', required: true },
  { name: 'disease', label: 'Disease', type: 'text', required: true },
];

// Progress Indicator Component
function StepProgress({ currentStep, totalSteps }) {
  return (
    <div className="step-progress">
      {Array.from({ length: totalSteps }, (_, index) => (
        <React.Fragment key={index}>
          <div 
            className={`step-indicator ${
              index < currentStep ? 'completed' : 
              index === currentStep ? 'active' : 'inactive'
            }`}
          >
            {index < currentStep ? '✓' : index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div className={`step-connector ${index < currentStep ? 'completed' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Enhanced Form Step Component
function FormStep({ step, form, onChange, onCalculateBMI }) {
  if (step.type === 'select') {
    return (
      <div className="form-group">
        <label>{step.label}</label>
        <select
          name={step.name}
          value={form[step.name]}
          onChange={onChange}
          required={step.required}
          className="form-select"
        >
          <option value="">Select {step.label}</option>
          {step.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }
  
  if (step.type === 'bmi') {
    return (
      <div className="form-group">
        <label>Weight (kg) & Height (cm)</label>
        <div className="bmi-inputs">
          <input
            name="weight"
            type="number"
            step="0.1"
            placeholder="Weight (kg)"
            value={form.weight}
            onChange={onChange}
            className="form-input half-width"
          />
          <input
            name="height"
            type="number"
            step="0.1"
            placeholder="Height (cm)"
            value={form.height}
            onChange={onChange}
            className="form-input half-width"
          />
        </div>
        <button type="button" onClick={onCalculateBMI} className="bmi-button">
          Calculate BMI
        </button>
        {form.bmi && (
          <div className="bmi-result">
            BMI: {form.bmi}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="form-group">
      <label>{step.label}</label>
      <input
        name={step.name}
        type={step.type}
        value={form[step.name]}
        onChange={onChange}
        required={step.required}
        className="form-input"
        placeholder={`Enter your ${step.label.toLowerCase()}`}
      />
    </div>
  );
}

// Enhanced Meal Tabs Component
function MealTabs({ selectedMeal, setSelectedMeal }) {
  const meals = ['Breakfast', 'Lunch', 'Dinner'];
  const mealRef = useRef(null);
  
  useEffect(() => {
    if (mealRef.current && selectedMeal) {
      const activeTab = mealRef.current.querySelector('.meal-tab.selected');
      const indicator = mealRef.current.querySelector('.meal-tab-indicator');
      if (activeTab && indicator) {
        indicator.style.left = `${activeTab.offsetLeft}px`;
        indicator.style.width = `${activeTab.offsetWidth}px`;
      }
    }
  }, [selectedMeal]);

  return (
    <div className="meal-tabs" ref={mealRef}>
      {meals.map(meal => (
        <button
          key={meal}
          onClick={() => setSelectedMeal(meal)}
          className={selectedMeal === meal ? 'meal-tab selected' : 'meal-tab'}
        >
          {meal}
        </button>
      ))}
      <div className="meal-tab-indicator" />
    </div>
  );
}

// Enhanced Main Tabs Component
function MainTabs({ activeMainTab, setActiveMainTab }) {
  const tabs = [
    { id: 'recommendations', label: '🤖 AI Recommendations', icon: '🤖' },
    { id: 'progress', label: '📊 Progress & Health', icon: '📊' },
    { id: 'dashboard', label: '📈 Analytics & Food', icon: '📈' }
  ];
  
  const handleTabClick = (tabId) => {
    setActiveMainTab(tabId);
    window.location.hash = tabId;
  };
  
  return (
    <div className="main-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={activeMainTab === tab.id ? 'active' : ''}
          aria-selected={activeMainTab === tab.id}
          role="tab"
        >
          <span className="tab-icon">{tab.icon}</span>
          {tab.label.replace(/^.+ /, '')}
        </button>
      ))}
    </div>
  );
}

// Enhanced Recommendation List Component
function RecommendationList({ mealData, highlightedFood }) {
  return (
    <div className="meal-output">
      <h4>Recommended Foods</h4>
      <ul className="food-list">
        {mealData?.recommended?.map((item, idx) => (
          <li key={idx} className="food-item">
            <span>{item.food}</span>
            <span className="quantity">{item.quantity}</span>
          </li>
        ))}
      </ul>
      
      <h4>Foods to Avoid</h4>
      <ul className="food-list">
        {mealData?.not_recommended?.map((food, idx) => (
          <li 
            key={idx} 
            className={`food-item not-recommended ${
              food.toLowerCase().includes(highlightedFood) ? 'highlighted' : ''
            }`}
          >
            <span>{food}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Enhanced Food Check Form Component
function FoodCheckForm({ foodQuery, setFoodQuery, foodWarning, foodCheckLoading, foodSuggestions, setFoodSuggestions, onCheckFood }) {
  return (
    <div className="food-check-form">
      <h3>Check Food Safety</h3>
      <form onSubmit={onCheckFood} autoComplete="off">
        <div className="food-query-input-wrapper">
          <input
            type="text"
            value={foodQuery}
            onChange={e => {
              setFoodQuery(e.target.value);
              setFoodSuggestions([]);
            }}
            placeholder="Ask about a specific food..."
            className="form-input"
            autoComplete="off"
          />
          <button 
            type="submit" 
            className="food-check-submit"
            disabled={foodCheckLoading}
          >
            {foodCheckLoading ? '...' : 'Check'}
          </button>
        </div>
        
        {foodWarning && (
          <div className={`food-warning ${foodWarning.includes('not recommended') ? 'warning' : 'error'}`}>
            {foodWarning}
          </div>
        )}
      </form>
    </div>
  );
}

// Main Component
export default function GeminiRecommend() {
  const [form, setForm] = useState({ 
    age: '', medication: '', disease: '', gender: '', foodType: '', 
    bmi: '', weight: '', height: '' 
  });
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [foodQuery, setFoodQuery] = useState('');
  const [foodWarning, setFoodWarning] = useState('');
  const [foodCheckLoading, setFoodCheckLoading] = useState(false);
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [highlightedFood, setHighlightedFood] = useState('');
  const [activeMainTab, setActiveMainTab] = useState('recommendations');
  const user = JSON.parse(localStorage.getItem('medimeal_user'));

  // Handle URL fragment for direct navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      switch (hash) {
        case 'progress':
          setActiveMainTab('progress');
          break;
        case 'dashboard':
          setActiveMainTab('dashboard');
          break;
        case 'food-logger':
        case 'meal-plan':
        case 'nutrition':
          setActiveMainTab('dashboard');
          break;
        case 'health-tracker':
        case 'weight-tracker':
        case 'workout':
          setActiveMainTab('progress');
          break;
        default:
          if (hash) {
            setActiveMainTab('recommendations');
          }
          break;
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load saved user input
  useEffect(() => {
    if (user && user.email) {
      axios.get(`http://localhost:5000/api/user-input?email=${encodeURIComponent(user.email)}`)
        .then(res => {
          if (res.data.input) setForm(f => ({ ...f, ...res.data.input }));
        })
        .catch(err => console.log('No saved input found'));
    }
  }, [user]);

  // Set initial meal selection
  useEffect(() => {
    if (result && result.meals && !selectedMeal) {
      setSelectedMeal('breakfast');
    }
    if (!result) {
      setSelectedMeal(null);
    }
  }, [result, selectedMeal]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCalculateBMI = () => {
    const weight = parseFloat(form.weight);
    const height = parseFloat(form.height) / 100; // Convert cm to meters
    if (weight && height) {
      const bmi = (weight / (height * height)).toFixed(1);
      setForm({ ...form, bmi });
    }
  };

  const handleNext = e => {
    e.preventDefault();
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/recommend', form);
      setResult(res.data);
      setSelectedMeal('breakfast');
      
      // Save user input
      if (user && user.email) {
        await axios.post('http://localhost:5000/api/save-user-input', {
          email: user.email,
          input: form
        });
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
    setLoading(false);
  };

  const handleCheckFood = async e => {
    e.preventDefault();
    if (!foodQuery.trim()) return;
    
    setFoodCheckLoading(true);
    const mealData = result[selectedMeal?.toLowerCase()];
    try {
      const res = await axios.post('http://localhost:5000/api/check-food', {
        age: form.age,
        gender: form.gender,
        foodType: form.foodType,
        disease: form.disease,
        medication: form.medication,
        food: foodQuery
      });
      setFoodWarning(res.data.warning);
      if (mealData?.not_recommended?.some(food => 
        food.toLowerCase().includes(foodQuery.toLowerCase())
      )) {
        setHighlightedFood(foodQuery.toLowerCase());
      } else {
        setHighlightedFood('');
      }
    } catch {
      setFoodWarning('Could not check food safety.');
      setHighlightedFood('');
    }
    setFoodCheckLoading(false);
  };

  return (
    <div className="gemini-main">
      <div className="gemini-bg" />
      
      {/* Enhanced Hero Section */}
      <div className="hero-section">
        <div className="hero-background" />
        <div className="hero-content">
          <h1>AI-Powered Nutrition Recommendations</h1>
          <p>Get personalized meal plans tailored to your health needs and dietary preferences</p>
        </div>
      </div>

      {/* Enhanced Form */}
      {!result && (
        <div className="form-container">
          <div className="gemini-card">
            <h2>Get Your Personalized Meal Plan</h2>
            <StepProgress currentStep={step} totalSteps={steps.length} />
            
            <form onSubmit={step === steps.length - 1 ? handleSubmit : handleNext}>
              <FormStep 
                step={steps[step]} 
                form={form} 
                onChange={handleChange} 
                onCalculateBMI={handleCalculateBMI} 
              />
              
              <div className="form-buttons">
                {step > 0 && (
                  <button type="button" onClick={handlePrev} className="btn btn-secondary">
                    ← Previous
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  {step === steps.length - 1 ? (
                    loading ? 'Generating Recommendations...' : 'Get My Meal Plan →'
                  ) : (
                    'Next Step →'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Main Tabs */}
      <MainTabs activeMainTab={activeMainTab} setActiveMainTab={setActiveMainTab} />

      {/* Enhanced Results Section */}
      {activeMainTab === 'recommendations' && (
        <>
          {result && (
            <div className="recommend-results">
              <MealTabs selectedMeal={selectedMeal} setSelectedMeal={setSelectedMeal} />
              
              {result[selectedMeal?.toLowerCase()] ? (
                <RecommendationList 
                  mealData={result[selectedMeal.toLowerCase()]} 
                  highlightedFood={highlightedFood} 
                />
              ) : (
                <div className="no-recommendations">
                  <p>No recommendations available for this meal.</p>
                </div>
              )}
              
              <FoodCheckForm
                foodQuery={foodQuery}
                setFoodQuery={setFoodQuery}
                foodWarning={foodWarning}
                foodCheckLoading={foodCheckLoading}
                foodSuggestions={foodSuggestions}
                setFoodSuggestions={setFoodSuggestions}
                onCheckFood={handleCheckFood}
              />
            </div>
          )}
        </>
      )}

      {activeMainTab === 'progress' && <ProgressTracker />}
      {activeMainTab === 'dashboard' && <UserDashboard user={user} />}
    </div>
  );
}

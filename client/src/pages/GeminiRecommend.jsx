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

// Smaller reusable component for form step input
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
          <button type="button" onClick={onCalculateBMI} className="btn btn-primary">Calculate BMI</button>
        </div>
        {form.bmi && (
          <input
            name="bmi"
            type="number"
            step="0.1"
            placeholder="BMI (optional)"
            value={form.bmi}
            onChange={onChange}
            className="form-input"
          />
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
        placeholder={step.label}
        value={form[step.name]}
        onChange={onChange}
        required={step.required}
        className="form-input"
      />
    </div>
  );
}

// Component for meal tabs
function MealTabs({ selectedMeal, setSelectedMeal }) {
  const mealTabsRef = useRef(null);
  const mealBtnRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const idx = ['Breakfast', 'Lunch', 'Dinner'].indexOf(selectedMeal);
    const btn = mealBtnRefs.current[idx];
    if (btn && mealTabsRef.current) {
      const { left: tabsLeft } = mealTabsRef.current.getBoundingClientRect();
      const { left, width } = btn.getBoundingClientRect();
      setIndicatorStyle({ left: left - tabsLeft, width });
    }
  }, [selectedMeal]);

  return (
    <div className="meal-tabs" ref={mealTabsRef}>
      {['Breakfast', 'Lunch', 'Dinner'].map((meal, idx) => (
        <button
          key={meal}
          ref={el => mealBtnRefs.current[idx] = el}
          className={`meal-tab${selectedMeal === meal ? ' selected' : ''}`}
          onClick={() => setSelectedMeal(meal)}
        >
          {meal}
        </button>
      ))}
      <div className="meal-tab-indicator" style={indicatorStyle} />
    </div>
  );
}

// Component for main tabs
function MainTabs({ activeMainTab, setActiveMainTab }) {
  const tabs = [
    { id: 'recommendations', label: '🤖 AI Recommendations', icon: '🤖' },
    { id: 'progress', label: '📊 Progress & Health', icon: '📊' },
    { id: 'dashboard', label: '📈 Analytics & Food', icon: '📈' }
  ];
  
  const handleTabClick = (tabId) => {
    setActiveMainTab(tabId);
    // Update URL hash for direct linking
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

// Component for food check form with suggestions
function FoodCheckForm({ foodQuery, setFoodQuery, foodWarning, foodCheckLoading, foodSuggestions, setFoodSuggestions, onCheckFood }) {
  return (
    <form onSubmit={onCheckFood} className="food-check-form" autoComplete="off">
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
          aria-label="Food query"
        />
        {foodSuggestions.length > 0 && (
          <ul className="food-suggestions-list" role="listbox">
            {foodSuggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => { setFoodQuery(s); setFoodSuggestions([]); }}
                role="option"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') { setFoodQuery(s); setFoodSuggestions([]); } }}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit" className="btn btn-primary" disabled={foodCheckLoading}>Check</button>
      {foodQuery && (
        <button type="button" onClick={() => { setFoodQuery(''); setFoodSuggestions([]); }} className="btn btn-clear" aria-label="Clear food query">×</button>
      )}
      {foodCheckLoading && <div className="loading-text">Checking<span className="dot-anim">...</span></div>}
      {!foodCheckLoading && foodWarning && (
        <div className={`food-warning ${foodWarning.toLowerCase().includes('not safe') || foodWarning.toLowerCase().includes('avoid') ? 'warning' : 'safe'}`}>
          {foodWarning}
        </div>
      )}
    </form>
  );
}

// Component for rendering recommended and not recommended food lists
function RecommendationList({ mealData, highlightedFood }) {
  return (
    <div className="meal-output fade-in">
      <h4>Recommended:</h4>
      <ul>
        {mealData?.recommended?.map((item, idx) =>
          <li key={idx}>{item.food} - {item.quantity}</li>
        )}
      </ul>
      <h4>Not Recommended:</h4>
      <ul>
        {mealData?.not_recommended?.map((food, idx) =>
          <li key={idx} className={food.toLowerCase().includes(highlightedFood) ? 'highlighted' : ''}>
            {food}
          </li>
        )}
      </ul>
    </div>
  );
}

export default function GeminiRecommend() {
  const [form, setForm] = useState({ age: '', medication: '', disease: '', gender: '', foodType: '', bmi: '', weight: '', height: '' });
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  // Removed unused bmiCategory state to fix lint error
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [foodQuery, setFoodQuery] = useState('');
  const [foodWarning, setFoodWarning] = useState('');
  const [foodCheckLoading, setFoodCheckLoading] = useState(false);
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [highlightedFood, setHighlightedFood] = useState('');
  const [activeMainTab, setActiveMainTab] = useState('recommendations');
  const user = JSON.parse(localStorage.getItem('medimeal_user'));

  // Handle URL fragment for direct navigation to specific tabs
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
          setActiveMainTab('dashboard'); // These will be tabs within dashboard
          break;
        case 'health-tracker':
        case 'weight-tracker':
        case 'workout':
          setActiveMainTab('progress'); // These will be tabs within progress tracker
          break;
        default:
          if (hash) {
            // If there's a hash but not recognized, default to recommendations
            setActiveMainTab('recommendations');
          }
          break;
      }
    };

    // Handle initial hash on component mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (result && result.meals && !selectedMeal) {
      setSelectedMeal('breakfast');
    }
    if (!result) {
      setSelectedMeal(null);
    }
  }, [result, selectedMeal]);

  useEffect(() => {
    if (user && user.email) {
      axios.get(`http://localhost:5000/api/user-input?email=${encodeURIComponent(user.email)}`)
        .then(res => {
          if (res.data.input) setForm(f => ({ ...f, ...res.data.input }));
        });
    }
  }, [user]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCalculateBMI = () => {
    const weight = parseFloat(form.weight);
    const height = parseFloat(form.height) / 100;
    if (weight > 0 && height > 0) {
      const bmi = (weight / (height * height)).toFixed(1);
      setForm(f => ({ ...f, bmi }));
      // Removed bmiCategory usage as it is unused
    }
  };

  const handleNext = e => {
    e.preventDefault();
    if (steps[step].name === 'bmi' && !form.bmi && form.weight && form.height) {
      handleCalculateBMI();
    }
    setStep(s => s + 1);
  };

  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('http://localhost:5000/api/gemini-recommend', form);
      setResult(res.data);
      if (user && user.email) {
        axios.post('http://localhost:5000/api/user-input', {
          email: user.email,
          input: form,
          recommendations: res.data
        });
      }
    } catch {
      setResult({ error: 'Failed to get recommendations.' });
    }
    setLoading(false);
  };

  const handleCheckFood = async e => {
    e.preventDefault();
    setFoodWarning('');
    setHighlightedFood('');
    const mealData = result[selectedMeal?.toLowerCase()];
    const query = foodQuery.trim();
    if (!query) return setFoodWarning('');
    setFoodCheckLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/gemini-food-check', {
        disease: form.disease,
        medication: form.medication,
        food: query
      });
      setFoodWarning(res.data.warning);
      if (mealData?.not_recommended?.some(food => food.toLowerCase().includes(query.toLowerCase()))) {
        setHighlightedFood(query.toLowerCase());
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
      <div className="hero-section">
        <div className="hero-background" />
        <div className="hero-content">
          <h1>Gemini Food Recommendations</h1>
          <p>Personalized, health-focused meal plans powered by AI</p>
        </div>
      </div>

      {!result && (
        <div className="form-container">
          <div className="gemini-card">
            <h2>Get Food Recommendations</h2>
            <form onSubmit={step === steps.length - 1 ? handleSubmit : handleNext}>
              <FormStep step={steps[step]} form={form} onChange={handleChange} onCalculateBMI={handleCalculateBMI} />
              <div className="form-buttons">
                {step > 0 && <button type="button" onClick={handlePrev} className="btn btn-secondary">Back</button>}
                <button type="submit" className="btn btn-primary">{step === steps.length - 1 ? (loading ? 'Loading...' : 'Get Recommendations') : 'Next'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MainTabs activeMainTab={activeMainTab} setActiveMainTab={setActiveMainTab} />

      {activeMainTab === 'recommendations' && (
        <>
          {result && (
            <div className="recommend-results">
              <MealTabs selectedMeal={selectedMeal} setSelectedMeal={setSelectedMeal} />
              {result[selectedMeal?.toLowerCase()] ? (
                <RecommendationList mealData={result[selectedMeal.toLowerCase()]} highlightedFood={highlightedFood} />
              ) : (
                <div className="no-recommendations" />
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

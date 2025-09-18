import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './GeminiRecommend.css';
import UserDashboard from '../components/UserDashboard';
import toast from 'react-hot-toast';
import { validateMedication, validateHealthCondition, MEDICAL_CONDITIONS } from '../utils/validation';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const steps = [
  { name: 'age', label: 'Age', type: 'number', required: true },
  { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
  { name: 'foodType', label: 'Food Type', type: 'select', options: ['veg', 'nonveg', 'vegan'], required: true },
  { name: 'weightHeightBmi', label: 'Weight, Height & BMI (Optional)', type: 'bmi', required: false },
  { name: 'medication', label: 'Medication', type: 'medication', required: true },
  { name: 'disease', label: 'Medical Condition', type: 'medical-condition', required: true },
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
        {form[step.name] && (
          <div className="age-validation">
            <span className="validation-success">✓ {step.label} selected</span>
          </div>
        )}
      </div>
    );
  }
  
  if (step.type === 'bmi') {
    return (
      <div className="form-group">
        <label>Weight (kg) & Height (cm) <span style={{color: '#6b7280', fontSize: '0.875rem'}}>(Optional)</span></label>
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
        <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
            💡 Gender-specific BMI calculation available. Please select your gender first for more accurate results.
          </small>
        </div>
        <button 
          type="button" 
          onClick={onCalculateBMI} 
          className="bmi-button"
          disabled={!form.weight || !form.height}
          style={{
            opacity: (!form.weight || !form.height) ? 0.6 : 1,
            cursor: (!form.weight || !form.height) ? 'not-allowed' : 'pointer'
          }}
        >
          Calculate BMI {form.gender && `(${form.gender})`}
        </button>
        {form.bmi && (
          <div className={`bmi-result ${
            parseFloat(form.bmi) < 18.5 ? 'bmi-underweight' :
            parseFloat(form.bmi) >= 18.5 && parseFloat(form.bmi) < 25 ? 'bmi-normal' :
            parseFloat(form.bmi) >= 25 && parseFloat(form.bmi) < 30 ? 'bmi-overweight' : 'bmi-obese'
          }`}>
            BMI: {form.bmi} {' '}
            <span className="bmi-category">
              {parseFloat(form.bmi) < 18.5 ? '(Underweight)' :
               parseFloat(form.bmi) >= 18.5 && parseFloat(form.bmi) < 25 ? '(Normal)' :
               parseFloat(form.bmi) >= 25 && parseFloat(form.bmi) < 30 ? '(Overweight)' : '(Obese)'}
            </span>
            {form.gender && (
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                📊 Calculated using {form.gender}-specific formula for better accuracy
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Enhanced Medication Input
  if (step.type === 'medication') {
    const medicationSuggestions = [
      'None / No medication',
      'Metformin (Diabetes)',
      'Lisinopril (Blood Pressure)',
      'Atorvastatin (Cholesterol)',
      'Levothyroxine (Thyroid)',
      'Vitamin D supplements',
      'Multivitamins'
    ];
    
    return (
      <div className="form-group">
        <label>{step.label}</label>
        <input
          name={step.name}
          type="text"
          value={form[step.name]}
          onChange={onChange}
          required={step.required}
          className="form-input"
          placeholder="Enter medications you're taking (e.g., Metformin 500mg daily)"
          list="medication-suggestions"
        />
        <datalist id="medication-suggestions">
          {medicationSuggestions.map((med, index) => (
            <option key={index} value={med} />
          ))}
        </datalist>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
          💡 Include dosage if known. Write "None" if not taking any medication.
        </div>
        {form[step.name] && (
          <div className="age-validation">
            {validateMedication(form[step.name]).isValid ? (
              <span className="validation-success">✓ Valid medication information</span>
            ) : (
              <span className="validation-error">{validateMedication(form[step.name]).error}</span>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Enhanced Medical Condition Select with Other Option
  if (step.type === 'medical-condition') {
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
          <option value="">Select your medical condition</option>
          {MEDICAL_CONDITIONS.map((condition, index) => (
            <option key={index} value={condition}>{condition}</option>
          ))}
        </select>
        
        {/* Show text input if "Other" is selected */}
        {form[step.name] === 'Other (Please specify)' && (
          <div style={{ marginTop: '0.75rem' }}>
            <input
              name="customDisease"
              type="text"
              value={form.customDisease || ''}
              onChange={onChange}
              className="form-input"
              placeholder="Please specify your medical condition"
              required
            />
          </div>
        )}
        
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
          💡 Select the condition that best matches your situation. Choose "None / Healthy" if you have no medical conditions.
        </div>
        
        {form[step.name] && (
          <div className="age-validation">
            {(form[step.name] !== 'Other (Please specify)' || form.customDisease) ? (
              <span className="validation-success">✓ Medical condition selected</span>
            ) : form[step.name] === 'Other (Please specify)' && !form.customDisease ? (
              <span className="validation-error">Please specify your medical condition</span>
            ) : null}
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
        min={step.name === 'age' ? 1 : undefined}
        max={step.name === 'age' ? 120 : undefined}
      />
      {step.name === 'age' && form[step.name] && (
        <div className="age-validation">
          {parseInt(form[step.name]) < 1 && (
            <span className="validation-error">Age must be at least 1 year</span>
          )}
          {parseInt(form[step.name]) > 120 && (
            <span className="validation-error">Age must be 120 years or less</span>
          )}
          {parseInt(form[step.name]) >= 1 && parseInt(form[step.name]) <= 120 && (
            <span className="validation-success">✓ Valid age</span>
          )}
        </div>
      )}
      {step.name === 'medication' && form[step.name] && (
        <div className="age-validation">
          {form[step.name].length < 2 && (
            <span className="validation-error">Medication name must be at least 2 characters</span>
          )}
          {form[step.name].length > 100 && (
            <span className="validation-error">Medication name must be less than 100 characters</span>
          )}
          {form[step.name].length >= 2 && form[step.name].length <= 100 && (
            <span className="validation-success">✓ Valid medication name</span>
          )}
        </div>
      )}
      {step.name === 'disease' && form[step.name] && (
        <div className="age-validation">
          {form[step.name].length < 2 && (
            <span className="validation-error">Medical condition must be at least 2 characters</span>
          )}
          {form[step.name].length > 200 && (
            <span className="validation-error">Medical condition must be less than 200 characters</span>
          )}
          {form[step.name].length >= 2 && form[step.name].length <= 200 && (
            <span className="validation-success">✓ Valid medical condition</span>
          )}
        </div>
      )}
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

// Enhanced Main Tabs Component - Focused on Recommendations Only
function MainTabs({ activeMainTab, setActiveMainTab }) {
  const tabs = [
    { id: 'recommendations', label: '🤖 AI Recommendations', icon: '🤖' },
    { id: 'analytics', label: '📈 Food Analytics', icon: '📈' }
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
function RecommendationList({ mealData, userProfile, onAddToFoodLogger, selectedMeal }) {
  const [selectedFoods, setSelectedFoods] = useState([]);
  const isProcessing = useRef(false);
  
  const handleCheckboxChange = (item, isChecked) => {
    if (isChecked) {
      setSelectedFoods(prev => [...prev, { ...item, mealType: selectedMeal }]);
    } else {
      setSelectedFoods(prev => prev.filter(food => food.food !== item.food));
    }
  };
  
  const handleAddToFoodLogger = () => {
    if (isProcessing.current || selectedFoods.length === 0) {
      return;
    }
    
    isProcessing.current = true;
    
    try {
      onAddToFoodLogger(selectedFoods);
      setSelectedFoods([]);
      // Reset all checkboxes
      const checkboxes = document.querySelectorAll('.food-checkbox');
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
    } finally {
      // Reset the flag after a short delay to prevent rapid clicking
      setTimeout(() => {
        isProcessing.current = false;
      }, 1000);
    }
  };
  
  return (
    <div className="meal-output">
      {userProfile && (
        <div className="recommendation-header">
          <h3>Personalized for You</h3>
          <div className="user-profile-summary">
            <span className="profile-tag">Age: {userProfile.age}</span>
            <span className="profile-tag">Diet: {userProfile.foodType}</span>
            <span className="profile-tag">Gender: {userProfile.gender}</span>
            {userProfile.bmi && (
              <span className="profile-tag">BMI: {userProfile.bmi}</span>
            )}
          </div>
        </div>
      )}
      
      <h4>Recommended Foods</h4>
      {selectedFoods.length > 0 && (
        <div className="add-to-logger">
          <button 
            className="add-to-logger-btn"
            onClick={handleAddToFoodLogger}
            disabled={isProcessing.current}
          >
            {isProcessing.current ? 'Adding...' : `Add ${selectedFoods.length} item${selectedFoods.length > 1 ? 's' : ''} to Food Logger`}
          </button>
        </div>
      )}
      <ul className="food-list">
        {mealData?.recommended?.map((item, idx) => (
          <li key={idx} className="food-item">
            <input 
              type="checkbox" 
              className="food-checkbox"
              onChange={(e) => handleCheckboxChange(item, e.target.checked)}
            />
            <span className="food-name">{item.food}</span>
            <span className="quantity">{item.quantity}</span>
          </li>
        ))}
        {(!mealData?.recommended || mealData.recommended.length === 0) && (
          <li className="food-item no-data">
            <span>No specific recommendations available for this meal.</span>
          </li>
        )}
      </ul>
      
      <h4>Foods to Avoid</h4>
      <ul className="food-list">
        {mealData?.not_recommended?.map((food, idx) => (
          <li 
            key={idx} 
            className="food-item not-recommended"
          >
            <span className="food-name">{food}</span>
            <span className="warning-icon">⚠️</span>
          </li>
        ))}
        {(!mealData?.not_recommended || mealData.not_recommended.length === 0) && (
          <li className="food-item no-data">
            <span>No specific foods to avoid for this meal.</span>
          </li>
        )}
      </ul>
    </div>
  );
}

// Main Component
export default function GeminiRecommend() {
  const [form, setForm] = useState({ 
    age: '', medication: '', disease: '', customDisease: '', gender: '', foodType: '', 
    bmi: '', weight: '', height: '' 
  });
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [activeMainTab, setActiveMainTab] = useState('recommendations');
  const [loggedFoods, setLoggedFoods] = useState([]);
  const user = JSON.parse(localStorage.getItem('medimeal_user'));
  const isAddingFoods = useRef(false);

  // Handle URL fragment for direct navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      switch (hash) {
        case 'analytics':
        case 'dashboard':
          setActiveMainTab('analytics');
          break;
        case 'food-logger':
        case 'meal-plan':
        case 'nutrition':
          setActiveMainTab('analytics');
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

  // Load logged foods only (no saved inputs)
  useEffect(() => {
    const loadLoggedFoods = async () => {
      const currentUser = JSON.parse(localStorage.getItem('medimeal_user'));
      if (currentUser && currentUser.email) {
        try {
          const foodRes = await axios.get(`${API_URL}/api/food-logger?email=${encodeURIComponent(currentUser.email)}`);
          if (foodRes.data.foods) setLoggedFoods(foodRes.data.foods);
        } catch {
          console.log('No logged foods found');
        }
      }
    };
    
    loadLoggedFoods();
  }, []); // Empty dependency array for one-time load
  
  // Function to handle adding foods to the food logger with sync support
  const handleAddToFoodLogger = (selectedFoods) => {
    // Prevent multiple calls
    if (isAddingFoods.current) {
      return;
    }
    
    if (!user || !user.email) {
      toast.error('Please log in to add foods to your food logger');
      return;
    }
    
    isAddingFoods.current = true;
    
    // Transform foods to include nutritional data for sync
    const foodsForSync = selectedFoods.map(food => ({
      food: food.food || food.name,
      mealType: selectedMeal,
      nutritionData: {
        calories: food.calories || 0,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fat: food.fat || 0,
        fiber: food.fiber || 0
      }
    }));
    
    // Use the new synchronized endpoint for multiple foods
    axios.post(`${API_URL}/api/add-multiple-recommended-foods`, {
      foods: foodsForSync,
      email: user.email
    })
    .then(response => {
      console.log('Foods successfully synchronized:', response.data);
      
      // Update local state for immediate UI feedback
      const foodsWithTimestamp = selectedFoods.map(food => ({
        ...food,
        timestamp: new Date().toISOString(),
        userId: user.email,
        mealType: selectedMeal,
        isRecommended: true,
        source: 'recommendation'
      }));
      
      setLoggedFoods(prev => [...prev, ...foodsWithTimestamp]);
      
      toast.success(`${selectedFoods.length} recommended item${selectedFoods.length > 1 ? 's' : ''} added to your food logger and synchronized!`);
      
      // If user is not already in the analytics tab, ask if they want to go there
      if (activeMainTab !== 'analytics') {
        setTimeout(() => {
          if (confirm('Would you like to go to the Food Analytics to see your updated meals?')) {
            setActiveMainTab('analytics');
            window.location.hash = 'food-logger';
          }
        }, 1000); // Small delay to ensure toast is visible
      }
    })
    .catch(err => {
      console.error('Error saving foods to logger:', err);
      toast.error('Failed to save foods to your logger. Please try again.');
    })
    .finally(() => {
      isAddingFoods.current = false;
    });
  };

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
    const gender = form.gender;
    
    if (weight && height && gender) {
      let bmi;
      
      // Gender-specific BMI calculations
      if (gender === 'Male') {
        // For males: BMI = weight(kg) / (height(m)^2) * 0.95 (slight adjustment for male body composition)
        bmi = ((weight / (height * height)) * 0.95).toFixed(1);
      } else if (gender === 'Female') {
        // For females: BMI = weight(kg) / (height(m)^2) * 1.05 (slight adjustment for female body composition)
        bmi = ((weight / (height * height)) * 1.05).toFixed(1);
      } else {
        // For 'Other' gender: use standard BMI calculation
        bmi = (weight / (height * height)).toFixed(1);
      }
      
      setForm({ ...form, bmi });
    } else if (weight && height && !gender) {
      // If gender not selected, show message to select gender first
      alert('Please select your gender first for accurate BMI calculation');
    } else {
      alert('Please enter both weight and height to calculate BMI');
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
    
    // Age validation
    const age = parseInt(form.age);
    if (!age || age < 1 || age > 120) {
      toast.error('Please enter a valid age between 1 and 120 years.');
      return;
    }
    
    // Enhanced medication validation
    const medicationValidation = validateMedication(form.medication);
    if (!medicationValidation.isValid) {
      toast.error(medicationValidation.error);
      return;
    }
    
    // Enhanced disease/medical condition validation
    let finalDisease = form.disease;
    if (form.disease === 'Other (Please specify)') {
      if (!form.customDisease || form.customDisease.trim() === '') {
        toast.error('Please specify your medical condition.');
        return;
      }
      finalDisease = form.customDisease.trim();
    }
    
    const diseaseValidation = validateHealthCondition(finalDisease);
    if (!diseaseValidation.isValid) {
      toast.error(diseaseValidation.error);
      return;
    }
    
    // Gender validation
    if (!form.gender || form.gender.trim() === '') {
      toast.error('Please select your gender.');
      return;
    }
    
    // Food Type validation
    if (!form.foodType || form.foodType.trim() === '') {
      toast.error('Please select your food type preference.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Enhanced API call with comprehensive user data
      const requestData = {
        age: age,
        gender: form.gender,
        foodType: form.foodType,
        medication: form.medication,
        disease: finalDisease, // Use processed disease value
        bmi: form.bmi || null,
        weight: form.weight ? parseFloat(form.weight) : null,
        height: form.height ? parseFloat(form.height) : null,
        userId: user?.email || null
      };
      
      console.log('Sending recommendation request:', requestData);
      
      // Call the correct Gemini API endpoint
      const res = await axios.post(`${API_URL}/api/gemini-recommend`, requestData);
      
      // Process and enhance the response
      const recommendationData = res.data;
      
      // Add metadata about the recommendations
      const enhancedData = {
        ...recommendationData,
        userProfile: {
          age: requestData.age,
          foodType: requestData.foodType,
          gender: requestData.gender,
          bmi: requestData.bmi
        },
        generatedAt: new Date().toISOString(),
        recommendationType: getRecommendationType(requestData)
      };
      
      setResult(enhancedData);
      setSelectedMeal('breakfast');
      
      // Redirect to recommendations tab after successful input
      setActiveMainTab('recommendations');
      
    } catch (error) {
      console.error('Error getting recommendations:', error);
      
      // Enhanced error handling with user-friendly messages
      let errorMessage = 'Failed to get recommendations. Please try again.';
      
      if (error.response?.status === 429) {
        errorMessage = 'Service is temporarily overloaded. Please try again in a few moments.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Our team has been notified.';
      } else if (!navigator.onLine) {
        errorMessage = 'Please check your internet connection and try again.';
      }
      
      // Show error toast notification
      toast.error(errorMessage);
    }
    
    setLoading(false);
  };
  
  // Helper function to determine recommendation type based on user data
  const getRecommendationType = (userData) => {
    const { age, foodType, bmi } = userData;
    let type = [];
    
    if (age < 18) type.push('youth');
    else if (age > 65) type.push('senior');
    else type.push('adult');
    
    if (foodType === 'veg') type.push('vegetarian');
    else if (foodType === 'vegan') type.push('vegan');
    else if (foodType === 'nonveg') type.push('non-vegetarian');
    else type.push('flexible');
    
    if (bmi) {
      const bmiValue = parseFloat(bmi);
      if (bmiValue < 18.5) type.push('underweight');
      else if (bmiValue > 25) type.push('overweight');
      else type.push('normal-weight');
    }
    
    return type.join('-');
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
                    loading ? (
                      <span>
                        🤖 Analyzing your profile and generating personalized recommendations...
                      </span>
                    ) : (
                      'Get My Personalized Meal Plan →'
                    )
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
                  userProfile={result.userProfile}
                  onAddToFoodLogger={handleAddToFoodLogger}
                  selectedMeal={selectedMeal.toLowerCase()}
                />
              ) : (
                <div className="no-recommendations">
                  <p>No recommendations available for this meal.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeMainTab === 'analytics' && (
        <div className="analytics-section">
          <UserDashboard 
            user={user} 
            loggedFoods={loggedFoods} 
            onFoodAdded={(newFood) => {
              // Add the new food to the logged foods state
              const foodWithMetadata = {
                ...newFood,
                userId: user?.email || 'guest',
                id: Date.now() // Simple ID generation
              };
              
              setLoggedFoods(prev => [...prev, foodWithMetadata]);
              
              // Save to backend with proper food structure
              if (user?.email) {
                const foodForBackend = {
                  food: newFood.name,
                  mealType: newFood.mealType,
                  calories: newFood.calories,
                  protein: newFood.protein,
                  carbs: newFood.carbs,
                fat: newFood.fat,
                fiber: newFood.fiber,
                source: 'manual',
                timestamp: new Date()
              };
              
              axios.post(`${API_URL}/api/food-logger`, {
                foods: [foodForBackend],
                email: user.email
              }).then(response => {
                console.log('Food saved to backend:', response.data);
                toast.success(`${newFood.name} added to your ${newFood.mealType}!`);
              }).catch(error => {
                console.error('Error saving food to backend:', error);
                toast.error('Failed to save food to backend. Please try again.');
              });
            }
          }}
        />
        </div>
      )}
    </div>
  );
}

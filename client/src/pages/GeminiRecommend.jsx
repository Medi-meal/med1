import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './GeminiRecommend.css';
import ProgressTracker from '../components/ProgressTracker';
import UserDashboard from '../components/UserDashboard';

const steps = [
  { name: 'age', label: 'Age', type: 'number', required: true },
  { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
  { name: 'foodType', label: 'Food Type', type: 'select', options: ['veg', 'nonveg', 'vegan'], required: true },
  { name: 'weightHeightBmi', label: 'Weight, Height & BMI', type: 'bmi', required: false },
  { name: 'medication', label: 'Medication', type: 'text', required: true },
  { name: 'disease', label: 'Medical Condition', type: 'text', required: true },
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
function RecommendationList({ mealData, highlightedFood, userProfile, onAddToFoodLogger, selectedMeal }) {
  const [selectedFoods, setSelectedFoods] = useState([]);
  
  const handleCheckboxChange = (item, isChecked) => {
    if (isChecked) {
      setSelectedFoods(prev => [...prev, { ...item, mealType: selectedMeal }]);
    } else {
      setSelectedFoods(prev => prev.filter(food => food.food !== item.food));
    }
  };
  
  const handleAddToFoodLogger = () => {
    if (selectedFoods.length > 0) {
      onAddToFoodLogger(selectedFoods);
      setSelectedFoods([]);
      // Reset all checkboxes
      const checkboxes = document.querySelectorAll('.food-checkbox');
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
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
          >
            Add {selectedFoods.length} item{selectedFoods.length > 1 ? 's' : ''} to Food Logger
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
            className={`food-item not-recommended ${
              food.toLowerCase().includes(highlightedFood) ? 'highlighted' : ''
            }`}
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

// Enhanced Food Check Form Component
function FoodCheckForm({ foodQuery, setFoodQuery, foodWarning, foodCheckLoading, onCheckFood }) {
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
  const [highlightedFood, setHighlightedFood] = useState('');
  const [activeMainTab, setActiveMainTab] = useState('recommendations');
  const [loggedFoods, setLoggedFoods] = useState([]);
  const [healthProfile, setHealthProfile] = useState(null);
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

  // Load saved user input and health profile
  useEffect(() => {
    if (user && user.email) {
      axios.get(`http://localhost:5000/api/user-input?email=${encodeURIComponent(user.email)}`)
        .then(res => {
          if (res.data.input) {
            setForm(f => ({ ...f, ...res.data.input }));
            setHealthProfile(res.data.input); // Store health profile
          }
        })
        .catch(() => console.log('No saved input found'));
        
      // Also fetch any logged foods if you have a food logging API
      axios.get(`http://localhost:5000/api/food-logger?email=${encodeURIComponent(user.email)}`)
        .then(res => {
          if (res.data.foods) setLoggedFoods(res.data.foods);
        })
        .catch(() => console.log('No logged foods found'));
    }
  }, [user]);
  
  // Function to handle adding foods to the food logger with sync support
  const handleAddToFoodLogger = (selectedFoods) => {
    if (!user || !user.email) {
      alert('Please log in to add foods to your food logger');
      return;
    }
    
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
    axios.post('http://localhost:5000/api/add-multiple-recommended-foods', {
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
      
      alert(`${selectedFoods.length} recommended item${selectedFoods.length > 1 ? 's' : ''} added to your food logger and synchronized!`);
      
      // If user is not already in the food logger tab, ask if they want to go there
      if (activeMainTab !== 'dashboard') {
        if (confirm('Would you like to go to the Food Logger to see your updated meals?')) {
          setActiveMainTab('dashboard');
          window.location.hash = 'food-logger';
        }
      }
    })
    .catch(err => {
      console.error('Error saving foods to logger:', err);
      alert('Failed to save foods to your logger. Please try again.');
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
    
    // Age validation
    const age = parseInt(form.age);
    if (!age || age < 1 || age > 120) {
      alert('Please enter a valid age between 1 and 120 years.');
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
        disease: form.disease, // Backend still expects 'disease' field
        bmi: form.bmi || null,
        weight: form.weight ? parseFloat(form.weight) : null,
        height: form.height ? parseFloat(form.height) : null,
        userId: user?.email || null
      };
      
      console.log('Sending recommendation request:', requestData);
      
      // Call the correct Gemini API endpoint
      const res = await axios.post('http://localhost:5000/api/gemini-recommend', requestData);
      
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
      
      // Save user input to database
      if (user && user.email) {
        try {
          await axios.post('http://localhost:5000/api/user-input', {
            email: user.email,
            input: requestData,
            recommendations: enhancedData
          });
          console.log('User input and recommendations saved successfully');
        } catch (saveError) {
          console.error('Error saving user input:', saveError);
        }
      }
      
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
      
      // You can add a toast notification here if you have a notification system
      alert(errorMessage);
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

  const handleCheckFood = async e => {
    e.preventDefault();
    if (!foodQuery.trim()) return;
    
    setFoodCheckLoading(true);
    const mealData = result[selectedMeal?.toLowerCase()];
    
    try {
      // Enhanced food check with more comprehensive data
      const requestData = {
        age: parseInt(form.age),
        gender: form.gender,
        foodType: form.foodType,
        disease: form.disease,
        medication: form.medication,
        food: foodQuery.trim(),
        bmi: form.bmi || null
      };
      
      // Use the correct Gemini food check endpoint
      const res = await axios.post('http://localhost:5000/api/gemini-food-check', requestData);
      
      const warningMessage = res.data.warning || res.data.message || 'Food safety checked.';
      setFoodWarning(warningMessage);
      
      // Enhanced highlighting logic
      if (mealData?.not_recommended?.some(food => 
        food.toLowerCase().includes(foodQuery.toLowerCase()) ||
        foodQuery.toLowerCase().includes(food.toLowerCase())
      )) {
        setHighlightedFood(foodQuery.toLowerCase());
      } else {
        setHighlightedFood('');
      }
      
    } catch (error) {
      console.error('Error checking food safety:', error);
      
      let errorMessage = 'Could not check food safety. Please try again.';
      if (error.response?.status === 429) {
        errorMessage = 'Service temporarily busy. Please try again in a moment.';
      }
      
      setFoodWarning(errorMessage);
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
                  highlightedFood={highlightedFood}
                  userProfile={result.userProfile}
                  onAddToFoodLogger={handleAddToFoodLogger}
                  selectedMeal={selectedMeal.toLowerCase()}
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
                onCheckFood={handleCheckFood}
              />
            </div>
          )}
        </>
      )}

      {activeMainTab === 'progress' && (
        <>
          <ProgressTracker healthProfile={healthProfile} />
          <div className="health-profile-section">
            <h2>My Health Profile</h2>
            <p>Update your health information to receive more accurate recommendations.</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // Save health profile to the backend
              axios.post('http://localhost:5000/api/user-input', {
                input: form,
                email: user?.email
              })
              .then(() => {
                alert('Health profile updated successfully!');
                setHealthProfile({...form});
              })
              .catch(err => {
                console.error('Error saving health profile:', err);
                alert('Failed to save your health profile. Please try again.');
              });
            }} className="health-profile-form">
              <div className="form-grid">
                {/* Age */}
                <div className="form-group">
                  <label>Age</label>
                  <input
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={handleChange}
                    className="form-input"
                    min="1"
                    max="120"
                  />
                </div>
                
                {/* Gender */}
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                {/* Food Type */}
                <div className="form-group">
                  <label>Food Type</label>
                  <select
                    name="foodType"
                    value={form.foodType}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select Food Type</option>
                    <option value="veg">Vegetarian</option>
                    <option value="nonveg">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>
                
                {/* Weight */}
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    name="weight"
                    type="number"
                    value={form.weight}
                    onChange={handleChange}
                    className="form-input"
                    step="0.1"
                  />
                </div>
                
                {/* Height */}
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input
                    name="height"
                    type="number"
                    value={form.height}
                    onChange={handleChange}
                    className="form-input"
                    step="0.1"
                  />
                </div>
                
                {/* BMI */}
                <div className="form-group">
                  <label>BMI</label>
                  <div className="bmi-inputs">
                    <input
                      name="bmi"
                      type="text"
                      value={form.bmi}
                      readOnly
                      className="form-input"
                    />
                    <button type="button" onClick={handleCalculateBMI} className="bmi-button">
                      Calculate
                    </button>
                  </div>
                </div>
                
                {/* Medication */}
                <div className="form-group">
                  <label>Medication</label>
                  <input
                    name="medication"
                    type="text"
                    value={form.medication}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your medications"
                  />
                </div>
                
                {/* Medical Condition */}
                <div className="form-group">
                  <label>Medical Condition</label>
                  <input
                    name="disease"
                    type="text"
                    value={form.disease}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your medical conditions"
                  />
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary">
                Save Health Profile
              </button>
            </form>
          </div>
        </>
      )}
      {activeMainTab === 'dashboard' && (
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
            
            // Optionally save to backend
            if (user?.email) {
              axios.post('http://localhost:5000/api/food-logger', {
                foods: [foodWithMetadata],
                email: user.email
              }).catch(error => {
                console.error('Error saving food to backend:', error);
              });
            }
          }}
        />
      )}
    </div>
  );
}

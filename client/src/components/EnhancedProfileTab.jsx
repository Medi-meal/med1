import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';
import { calculateBMI, getBMICategory } from '../utils/validation';
import Select from 'react-select';
import CustomTooltip from './CustomTooltip';

const EnhancedProfileTab = ({ user, healthProfile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('👤');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [medications, setMedications] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [healthConditions, setHealthConditions] = useState([]);
  const [isEmailVerified] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [bmiHistory, setBmiHistory] = useState([]);
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const { showSuccess, showError } = useNotifications();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm({
    mode: 'onChange',
    defaultValues: healthProfile || {}
  });

  const watchedWeight = watch('weight');
  const watchedHeight = watch('height');

  useEffect(() => {
    if (healthProfile) {
      reset(healthProfile);
      setSelectedGoals(Array.isArray(healthProfile.healthGoals) ? healthProfile.healthGoals : []);
      setMedications(Array.isArray(healthProfile.medications) ? healthProfile.medications : []);
      setAllergies(Array.isArray(healthProfile.allergies) ? healthProfile.allergies : []);
      setHealthConditions(Array.isArray(healthProfile.healthConditions) ? healthProfile.healthConditions : []);
      setLastUpdated(healthProfile.lastUpdated ? new Date(healthProfile.lastUpdated) : new Date());
      
      // Initialize BMI history with current data
      if (healthProfile.weight && healthProfile.height) {
        const currentBMI = calculateBMI(healthProfile.weight, healthProfile.height);
        setBmiHistory([
          { date: new Date().toISOString().split('T')[0], bmi: parseFloat(currentBMI) }
        ]);
      }
    }
  }, [healthProfile, reset]);

  const avatarIcons = ['👨‍💼', '👩‍💼', '👨‍⚕️', '👩‍⚕️', '👨‍🍳', '👩‍🍳', '👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍🎨', '👩‍🎨', '🧑‍🔬'];
  
  const healthGoalOptions = [
    { value: 'Weight Loss', label: '🏃‍♀️ Weight Loss', color: '#ef4444' },
    { value: 'Weight Gain', label: '💪 Weight Gain', color: '#10b981' },
    { value: 'Muscle Building', label: '🏋️‍♂️ Muscle Building', color: '#8b5cf6' },
    { value: 'Heart Health', label: '❤️ Heart Health', color: '#f59e0b' },
    { value: 'Diabetes Management', label: '🩺 Diabetes Management', color: '#06b6d4' },
    { value: 'Lower Cholesterol', label: '📉 Lower Cholesterol', color: '#84cc16' },
    { value: 'Better Sleep', label: '😴 Better Sleep', color: '#6366f1' },
    { value: 'Increased Energy', label: '⚡ Increased Energy', color: '#f97316' },
    { value: 'Stress Reduction', label: '🧘‍♀️ Stress Reduction', color: '#14b8a6' },
    { value: 'Digestive Health', label: '🫁 Digestive Health', color: '#a855f7' }
  ];

  const foodTypeOptions = [
    { value: 'Flexible', label: '🍽️ Flexible (All foods)', icon: '🍽️' },
    { value: 'Vegetarian', label: '🥗 Vegetarian', icon: '🥗' },
    { value: 'Vegan', label: '🌱 Vegan', icon: '🌱' },
    { value: 'Keto', label: '🥑 Keto', icon: '🥑' },
    { value: 'Paleo', label: '🍖 Paleo', icon: '🍖' },
    { value: 'Mediterranean', label: '🫒 Mediterranean', icon: '🫒' }
  ];

  const activityLevelInfo = {
    sedentary: 'Little to no exercise, desk job',
    light: 'Light exercise 1-3 days/week',
    moderate: 'Moderate exercise 3-5 days/week',
    active: 'Hard exercise 6-7 days/week',
    'very-active': 'Very hard exercise, physical job'
  };

  const commonMedications = [
    'Aspirin', 'Ibuprofen', 'Metformin', 'Lisinopril', 'Atorvastatin',
    'Levothyroxine', 'Omeprazole', 'Vitamin D', 'Multivitamin', 'Fish Oil'
  ];

  const commonAllergies = [
    { label: '🥜 Peanuts', value: 'Peanuts', color: '#ef4444' },
    { label: '🦐 Shellfish', value: 'Shellfish', color: '#f97316' },
    { label: '🥛 Dairy', value: 'Dairy', color: '#06b6d4' },
    { label: '🌾 Gluten', value: 'Gluten', color: '#84cc16' },
    { label: '🥚 Eggs', value: 'Eggs', color: '#f59e0b' },
    { label: '🌰 Tree Nuts', value: 'Tree Nuts', color: '#8b5cf6' },
    { label: '🐟 Fish', value: 'Fish', color: '#14b8a6' },
    { label: '🍓 Soy', value: 'Soy', color: '#ec4899' }
  ];

  const onSubmit = (data) => {
    try {
      const updatedProfile = {
        ...data,
        healthGoals: selectedGoals,
        medications,
        allergies,
        healthConditions,
        avatar: uploadedAvatar || selectedAvatar,
        lastUpdated: new Date().toISOString()
      };
      
      if (onUpdateProfile) {
        onUpdateProfile(updatedProfile);
      }
      
      setIsEditing(false);
      setLastUpdated(new Date());
      showSuccess('Profile updated successfully! 🎉');
    } catch {
      showError('Failed to update profile. Please try again.');
    }
  };

  const handleAutoSave = async (fieldName, value) => {
    // Auto-save functionality on field blur
    if (!isEditing) return;
    
    try {
      // Simulate auto-save (in real app, this would be an API call)
      console.log(`Auto-saving ${fieldName}:`, value);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleCancelEdit = () => {
    reset(healthProfile || {});
    setSelectedGoals(healthProfile?.healthGoals || []);
    setMedications(healthProfile?.medications || []);
    setAllergies(healthProfile?.allergies || []);
    setHealthConditions(healthProfile?.healthConditions || []);
    setIsEditing(false);
  };

  const toggleGoal = (goal) => {
    setSelectedGoals(prev => 
      prev.includes(goal.value) 
        ? prev.filter(g => g !== goal.value)
        : [...prev, goal.value]
    );
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addMedication = (medication) => {
    if (medication && !medications.includes(medication.value)) {
      setMedications(prev => [...prev, medication.value]);
    }
  };

  const removeMedication = (medication) => {
    setMedications(prev => prev.filter(med => med !== medication));
  };

  const addAllergy = (allergy) => {
    if (allergy && !allergies.some(a => a.value === allergy.value)) {
      setAllergies(prev => [...prev, allergy]);
    }
  };

  const removeAllergy = (allergyValue) => {
    setAllergies(prev => prev.filter(a => a.value !== allergyValue));
  };

  const addHealthCondition = (condition) => {
    if (condition && !healthConditions.includes(condition)) {
      setHealthConditions(prev => [...prev, condition]);
    }
  };

  const removeHealthCondition = (condition) => {
    setHealthConditions(prev => prev.filter(c => c !== condition));
  };

  const currentBMI = watchedHeight && watchedWeight 
    ? calculateBMI(watchedWeight, watchedHeight)
    : null;

  const bmiCategory = currentBMI ? getBMICategory(parseFloat(currentBMI)) : null;

  const getBMIColor = (category) => {
    switch (category) {
      case 'Underweight': return '#3b82f6';
      case 'Normal': return '#10b981';
      case 'Overweight': return '#f59e0b';
      case 'Obese': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="enhanced-profile-tab">
      <motion.div 
        className="profile-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <div className="profile-header-section">
          <div className="avatar-section">
            <motion.div 
              className="avatar-display"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {uploadedAvatar ? (
                <img src={uploadedAvatar} alt="Profile" className="uploaded-avatar" />
              ) : (
                selectedAvatar
              )}
            </motion.div>
            {isEditing && (
              <motion.div 
                className="avatar-selector"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="avatar-options">
                  {avatarIcons.map((icon, index) => (
                    <motion.button
                      key={index}
                      type="button"
                      className={`avatar-option ${selectedAvatar === icon ? 'selected' : ''}`}
                      onClick={() => setSelectedAvatar(icon)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {icon}
                    </motion.button>
                  ))}
                </div>
                <div className="upload-section">
                  <label htmlFor="avatar-upload" className="upload-btn">
                    📸 Upload Photo
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </motion.div>
            )}
          </div>
          
          <div className="profile-info">
            <div className="name-section">
              {isEditing ? (
                <input
                  type="text"
                  className="editable-name"
                  defaultValue={user?.name || 'User'}
                  onBlur={(e) => handleAutoSave('name', e.target.value)}
                />
              ) : (
                <h2>{user?.name || 'User'}</h2>
              )}
            </div>
            
            <div className="email-section">
              <p className="email">{user?.email}</p>
              <span className={`verification-badge ${isEmailVerified ? 'verified' : 'unverified'}`}>
                {isEmailVerified ? '✅ Verified' : '⚠️ Unverified'}
              </span>
            </div>
            
            <div className="last-updated">
              <small>Last updated: {lastUpdated.toLocaleDateString()}</small>
            </div>
            
            <div className="action-buttons">
              <motion.button
                className={`edit-toggle-btn ${isEditing ? 'save-mode' : 'edit-mode'}`}
                onClick={isEditing ? handleSubmit(onSubmit) : () => setIsEditing(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isEditing && !isValid}
              >
                {isEditing ? '💾 Save Changes' : '✏️ Edit Profile'}
              </motion.button>
              
              <AnimatePresence>
                {isEditing && (
                  <motion.button
                    className="cancel-btn"
                    onClick={handleCancelEdit}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ❌ Cancel
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Enhanced BMI Display */}
        {currentBMI && (
          <motion.div 
            className="bmi-display enhanced"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bmi-main">
              <motion.div 
                className="bmi-circle" 
                style={{ 
                  borderColor: getBMIColor(bmiCategory),
                  background: `conic-gradient(${getBMIColor(bmiCategory)} ${(currentBMI / 40) * 100}%, #f3f4f6 0%)`
                }}
                animate={{ 
                  borderColor: getBMIColor(bmiCategory),
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 0.5 }}
              >
                <span className="bmi-value">{currentBMI}</span>
                <span className="bmi-label">BMI</span>
              </motion.div>
              
              <div className="bmi-info">
                <motion.span 
                  className="bmi-category" 
                  style={{ color: getBMIColor(bmiCategory) }}
                  animate={{ color: getBMIColor(bmiCategory) }}
                  transition={{ duration: 0.3 }}
                >
                  {bmiCategory}
                </motion.span>
                <div className="bmi-range">
                  Normal range: 18.5 - 24.9
                </div>
                <div className="bmi-scale">
                  <div className="scale-bar">
                    <div className="scale-indicator" style={{ left: `${Math.min((currentBMI / 40) * 100, 100)}%` }}></div>
                  </div>
                  <div className="scale-labels">
                    <span>15</span>
                    <span>25</span>
                    <span>35</span>
                  </div>
                </div>
              </div>
            </div>
            
            {bmiHistory.length > 1 && (
              <div className="bmi-trend">
                <h4>📈 BMI Trend</h4>
                <div className="mini-chart">
                  {/* Simple trend visualization */}
                  {bmiHistory.map((entry, index) => (
                    <div 
                      key={index} 
                      className="trend-point"
                      style={{ 
                        height: `${(entry.bmi / 40) * 100}%`,
                        backgroundColor: getBMIColor(getBMICategory(entry.bmi))
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
          <div className="form-grid">
            {/* Enhanced Basic Information */}
            <div className="form-section">
              <h3>📊 Basic Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    disabled={!isEditing}
                    {...register('age', { 
                      required: 'Age is required',
                      min: { value: 1, message: 'Age must be at least 1' },
                      max: { value: 120, message: 'Age must be less than 120' }
                    })}
                    onBlur={(e) => handleAutoSave('age', e.target.value)}
                  />
                  {errors.age && <span className="error-message">{errors.age.message}</span>}
                </div>
                
                <div className="form-group">
                  <label>Gender *</label>
                  <select 
                    disabled={!isEditing} 
                    {...register('gender', { required: 'Gender is required' })}
                    onBlur={(e) => handleAutoSave('gender', e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <span className="error-message">{errors.gender.message}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group slider-group">
                  <label>Height (cm) *</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="50"
                      max="250"
                      disabled={!isEditing}
                      className="height-slider"
                      value={watchedHeight || 170}
                      onChange={(e) => {
                        const height = e.target.value;
                        register('height').onChange({ target: { value: height, name: 'height' } });
                      }}
                    />
                    <input
                      type="number"
                      disabled={!isEditing}
                      className="slider-input"
                      {...register('height', { 
                        required: 'Height is required',
                        min: { value: 50, message: 'Height must be at least 50cm' },
                        max: { value: 300, message: 'Height must be less than 300cm' }
                      })}
                      onBlur={(e) => handleAutoSave('height', e.target.value)}
                    />
                  </div>
                  {errors.height && <span className="error-message">{errors.height.message}</span>}
                </div>
                
                <div className="form-group slider-group">
                  <label>Weight (kg) *</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="20"
                      max="200"
                      step="0.5"
                      disabled={!isEditing}
                      className="weight-slider"
                      value={watchedWeight || 70}
                      onChange={(e) => {
                        const weight = e.target.value;
                        register('weight').onChange({ target: { value: weight, name: 'weight' } });
                      }}
                    />
                    <input
                      type="number"
                      step="0.1"
                      disabled={!isEditing}
                      className="slider-input"
                      {...register('weight', { 
                        required: 'Weight is required',
                        min: { value: 20, message: 'Weight must be at least 20kg' },
                        max: { value: 500, message: 'Weight must be less than 500kg' }
                      })}
                      onBlur={(e) => handleAutoSave('weight', e.target.value)}
                    />
                  </div>
                  {errors.weight && <span className="error-message">{errors.weight.message}</span>}
                </div>
              </div>
            </div>

            {/* Enhanced Health Goals */}
            <div className="form-section">
              <h3>🎯 Health Goals</h3>
              <p className="section-description">Select your health and wellness objectives</p>
              
              <div className="goals-container">
                <div className="goals-grid">
                  {healthGoalOptions.map((goal) => (
                    <motion.button
                      key={goal.value}
                      type="button"
                      className={`goal-chip ${selectedGoals.includes(goal.value) ? 'selected' : ''}`}
                      onClick={() => isEditing && toggleGoal(goal)}
                      disabled={!isEditing}
                      whileHover={isEditing ? { scale: 1.02, y: -2 } : {}}
                      whileTap={isEditing ? { scale: 0.98 } : {}}
                      style={{
                        '--goal-color': goal.color,
                        backgroundColor: selectedGoals.includes(goal.value) ? goal.color : 'transparent',
                        borderColor: goal.color,
                        color: selectedGoals.includes(goal.value) ? 'white' : goal.color
                      }}
                    >
                      <CustomTooltip content={`Click to ${selectedGoals.includes(goal.value) ? 'remove' : 'add'} this goal`}>
                        <span>{goal.label}</span>
                      </CustomTooltip>
                      {selectedGoals.includes(goal.value) && (
                        <motion.div
                          className="goal-progress"
                          initial={{ width: 0 }}
                          animate={{ width: '75%' }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
                
                {selectedGoals.length > 0 && (
                  <motion.div 
                    className="selected-goals-summary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h4>Your Selected Goals ({selectedGoals.length})</h4>
                    <div className="goals-summary-list">
                      {selectedGoals.map((goalValue) => {
                        const goal = healthGoalOptions.find(g => g.value === goalValue);
                        if (!goal) return null;
                        return (
                          <span key={goalValue} className="summary-goal" style={{ backgroundColor: goal.color }}>
                            {goal.label}
                          </span>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Enhanced Activity & Preferences */}
            <div className="form-section">
              <h3>🏃‍♀️ Activity & Preferences</h3>
              
              <div className="form-group">
                <label>Activity Level</label>
                <CustomTooltip content="Your daily activity level affects calorie recommendations">
                  <select 
                    disabled={!isEditing} 
                    {...register('activityLevel')}
                  >
                    <option value="sedentary">🪑 Sedentary (little to no exercise)</option>
                    <option value="light">🚶‍♀️ Light (light exercise 1-3 days/week)</option>
                    <option value="moderate">🏃‍♀️ Moderate (moderate exercise 3-5 days/week)</option>
                    <option value="active">💪 Active (hard exercise 6-7 days/week)</option>
                    <option value="very-active">🏋️‍♀️ Very Active (very hard exercise, physical job)</option>
                  </select>
                </CustomTooltip>
                <div className="activity-info">
                  {watch('activityLevel') && (
                    <small className="activity-description">
                      {activityLevelInfo[watch('activityLevel')]}
                    </small>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Food Type Preference</label>
                {isEditing ? (
                  <Select
                    options={foodTypeOptions}
                    value={foodTypeOptions.find(opt => opt.value === watch('foodType'))}
                    onChange={(selected) => {
                      register('foodType').onChange({ target: { value: selected?.value, name: 'foodType' } });
                    }}
                    isDisabled={!isEditing}
                    className="food-type-select"
                    classNamePrefix="select"
                    formatOptionLabel={(option) => (
                      <div className="food-option">
                        <span className="food-icon">{option.icon}</span>
                        <span>{option.label.replace(option.icon + ' ', '')}</span>
                      </div>
                    )}
                  />
                ) : (
                  <div className="selected-food-type">
                    {foodTypeOptions.find(opt => opt.value === watch('foodType'))?.label || 'Not selected'}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Health Information */}
            <div className="form-section">
              <h3>🏥 Health Information</h3>
              
              <div className="form-group">
                <label>Health Conditions</label>
                <div className="multi-input-container">
                  {healthConditions.map((condition, index) => (
                    <motion.span 
                      key={index} 
                      className="health-tag"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      🏥 {typeof condition === 'string' ? condition : condition.name || 'Unknown'}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeHealthCondition(condition)}
                          className="remove-tag"
                        >
                          ×
                        </button>
                      )}
                    </motion.span>
                  ))}
                  {isEditing && (
                    <input
                      type="text"
                      placeholder="Add health condition..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          addHealthCondition(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                      className="add-condition-input"
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Allergies</label>
                <div className="allergies-container">
                  <div className="allergy-tags">
                    {allergies.map((allergy, index) => {
                      // Ensure allergy is an object with required properties
                      const allergyObj = typeof allergy === 'string' 
                        ? { label: allergy, value: allergy, color: '#ef4444' }
                        : allergy;
                      
                      return (
                        <motion.span 
                          key={index} 
                          className="allergy-tag"
                          style={{ 
                            backgroundColor: (allergyObj.color || '#ef4444') + '20', 
                            borderColor: allergyObj.color || '#ef4444' 
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          {allergyObj.label || allergyObj.value || 'Unknown'}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeAllergy(allergyObj.value || allergyObj.label)}
                              className="remove-tag"
                            >
                              ×
                            </button>
                          )}
                        </motion.span>
                      );
                    })}
                  </div>
                  
                  {isEditing && (
                    <div className="allergy-selector">
                      <Select
                        options={commonAllergies}
                        value={null}
                        onChange={addAllergy}
                        placeholder="Add allergy..."
                        className="allergy-select"
                        isMulti={false}
                        formatOptionLabel={(option) => (
                          <div className="allergy-option">
                            {option.label}
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Medications & Supplements</label>
                <div className="medications-container">
                  <div className="medication-tags">
                    {medications.map((medication, index) => (
                      <motion.span 
                        key={index} 
                        className="medication-tag"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        💊 {typeof medication === 'string' ? medication : medication.name || 'Unknown'}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeMedication(medication)}
                            className="remove-tag"
                          >
                            ×
                          </button>
                        )}
                      </motion.span>
                    ))}
                  </div>
                  
                  {isEditing && (
                    <div className="medication-selector">
                      <Select
                        options={commonMedications.map(med => ({ value: med, label: med }))}
                        value={null}
                        onChange={addMedication}
                        placeholder="Add medication..."
                        className="medication-select"
                        isMulti={false}
                        isCreatable={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EnhancedProfileTab;

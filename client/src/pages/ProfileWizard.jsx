import React, { useState, useEffect } from 'react';
import { ValidatedInput, BMICalculator, MedicationInput, SelectInput } from '../components/ValidatedInputs';
import { validateForm, calculateBMI } from '../utils/validation';
import { useNotifications } from '../hooks/useNotifications';
import './ProfileWizard.css';

const initialProfile = {
  gender: '',
  age: '',
  height: '',
  weight: '',
  foodType: '',
  medications: [],
  disease: '',
  allergies: [],
  activityLevel: '',
  healthGoals: [],
  diseaseDuration: '',
  unavailableFoods: []
};

const steps = [
  { title: 'Basic Information', icon: '👤' },
  { title: 'Health Profile', icon: '🏥' },
  { title: 'Medications & Allergies', icon: '💊' },
  { title: 'Lifestyle & Goals', icon: '🎯' },
  { title: 'Review & Submit', icon: '✅' }
];

const foodOptions = ['Milk', 'Eggs', 'Wheat', 'Peanuts', 'Soy', 'Fish', 'Chicken', 'Rice', 'Potato', 'Tomato'];
const healthGoalOptions = ['Weight Loss', 'Weight Gain', 'Muscle Building', 'Heart Health', 'Diabetes Management', 'General Wellness'];

export default function ProfileWizard() {
  const [profile, setProfile] = useState(initialProfile);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [bmi, setBMI] = useState('');
  const { showSuccess, showError, showWarning } = useNotifications();

  // Calculate BMI when height or weight changes
  useEffect(() => {
    if (profile.height && profile.weight) {
      const calculatedBMI = calculateBMI(profile.weight, profile.height);
      setBMI(calculatedBMI);
    }
  }, [profile.height, profile.weight]);

  const handleChange = (field, value) => {
    setProfile(p => ({ ...p, [field]: value }));
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addMedication = () => {
    setProfile(p => ({
      ...p,
      medications: [...p.medications, { name: '', dosage: '', duration: '' }]
    }));
  };

  const removeMedication = (index) => {
    setProfile(p => ({
      ...p,
      medications: p.medications.filter((_, i) => i !== index)
    }));
  };

  const handleMedChange = (index, field, value) => {
    setProfile(p => ({
      ...p,
      medications: p.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleUnavailableFood = (food) => {
    setProfile(p => ({
      ...p,
      unavailableFoods: p.unavailableFoods.includes(food)
        ? p.unavailableFoods.filter(f => f !== food)
        : [...p.unavailableFoods, food]
    }));
  };

  const handleHealthGoalToggle = (goal) => {
    setProfile(p => ({
      ...p,
      healthGoals: p.healthGoals.includes(goal)
        ? p.healthGoals.filter(g => g !== goal)
        : [...p.healthGoals, goal]
    }));
  };

  const validateCurrentStep = () => {
    let requiredFields = [];

    switch (step) {
      case 0: // Basic Information
        requiredFields = ['gender', 'age', 'height', 'weight'];
        break;
      case 1: // Health Profile
        requiredFields = ['foodType'];
        break;
      case 2: // Medications & Allergies
        // Optional step, but validate if provided
        break;
      case 3: // Lifestyle & Goals
        requiredFields = ['activityLevel'];
        break;
      default:
        break;
    }

    const validation = validateForm(profile, requiredFields);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      showError('Please fix the errors before continuing');
      return false;
    }

    setErrors({});
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (step < steps.length - 1) {
        setStep(step + 1);
        showSuccess('Step completed successfully!');
      }
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const submitProfile = async () => {
    if (!validateCurrentStep()) return;

    try {
      // Here you would submit to your API
      console.log('Submitting profile:', profile);
      showSuccess('Profile saved successfully!', 'Welcome to Medimeal!');
      // Redirect to dashboard or recommendations
    } catch (err) {
      console.error('Profile submission error:', err);
      showError('Failed to save profile. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="wizard-step-content">
            <h3>📋 Basic Information</h3>
            <div className="form-grid">
              <SelectInput
                label="Gender"
                value={profile.gender}
                onChange={(value) => handleChange('gender', value)}
                options={[
                  { value: '', label: 'Select Gender' },
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' }
                ]}
                error={errors.gender}
                required
              />
              <ValidatedInput
                label="Age"
                type="number"
                value={profile.age}
                onChange={(value) => handleChange('age', value)}
                error={errors.age}
                required
                min="1"
                max="120"
              />
              <ValidatedInput
                label="Height (cm)"
                type="number"
                value={profile.height}
                onChange={(value) => handleChange('height', value)}
                error={errors.height}
                required
                min="50"
                max="300"
              />
              <ValidatedInput
                label="Weight (kg)"
                type="number"
                value={profile.weight}
                onChange={(value) => handleChange('weight', value)}
                error={errors.weight}
                required
                min="10"
                max="500"
              />
            </div>
            {profile.height && profile.weight && (
              <BMICalculator height={profile.height} weight={profile.weight} />
            )}
          </div>
        );

      case 1:
        return (
          <div className="wizard-step-content">
            <h3>🏥 Health Profile</h3>
            <div className="form-grid">
              <SelectInput
                label="Food Preference"
                value={profile.foodType}
                onChange={(value) => handleChange('foodType', value)}
                options={[
                  { value: '', label: 'Select Food Type' },
                  { value: 'Vegetarian', label: 'Vegetarian' },
                  { value: 'Non-Vegetarian', label: 'Non-Vegetarian' },
                  { value: 'Vegan', label: 'Vegan' },
                  { value: 'Flexible', label: 'Flexible' }
                ]}
                error={errors.foodType}
                required
              />
              <ValidatedInput
                label="Current Health Condition"
                value={profile.disease}
                onChange={(value) => handleChange('disease', value)}
                placeholder="e.g., Diabetes, Hypertension, None"
              />
              <ValidatedInput
                label="Disease Duration"
                value={profile.diseaseDuration}
                onChange={(value) => handleChange('diseaseDuration', value)}
                placeholder="e.g., 2 years, 6 months, N/A"
              />
            </div>
            
            <div className="food-restrictions">
              <h4>🚫 Foods to Avoid</h4>
              <div className="food-toggle-grid">
                {foodOptions.map(food => (
                  <button
                    key={food}
                    type="button"
                    className={`food-toggle ${profile.unavailableFoods.includes(food) ? 'selected' : ''}`}
                    onClick={() => handleUnavailableFood(food)}
                  >
                    {food}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="wizard-step-content">
            <h3>💊 Medications & Allergies</h3>
            <MedicationInput
              medications={profile.medications}
              onAdd={addMedication}
              onRemove={removeMedication}
              onChange={handleMedChange}
            />
            
            <div className="allergies-section">
              <h4>🤧 Known Allergies</h4>
              <ValidatedInput
                label="Allergies"
                value={profile.allergies.join(', ')}
                onChange={(value) => handleChange('allergies', value.split(',').map(a => a.trim()).filter(Boolean))}
                placeholder="e.g., Peanuts, Shellfish, Dairy"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="wizard-step-content">
            <h3>🎯 Lifestyle & Goals</h3>
            <div className="form-grid">
              <SelectInput
                label="Activity Level"
                value={profile.activityLevel}
                onChange={(value) => handleChange('activityLevel', value)}
                options={[
                  { value: '', label: 'Select Activity Level' },
                  { value: 'sedentary', label: 'Sedentary (Little/No Exercise)' },
                  { value: 'light', label: 'Light (1-3 days/week)' },
                  { value: 'moderate', label: 'Moderate (3-5 days/week)' },
                  { value: 'active', label: 'Active (6-7 days/week)' },
                  { value: 'very-active', label: 'Very Active (2x/day)' }
                ]}
                error={errors.activityLevel}
                required
              />
            </div>
            
            <div className="health-goals">
              <h4>🎯 Health Goals</h4>
              <div className="goals-grid">
                {healthGoalOptions.map(goal => (
                  <button
                    key={goal}
                    type="button"
                    className={`goal-toggle ${profile.healthGoals.includes(goal) ? 'selected' : ''}`}
                    onClick={() => handleHealthGoalToggle(goal)}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="wizard-step-content">
            <h3>✅ Review & Submit</h3>
            <div className="profile-summary">
              <div className="summary-section">
                <h4>Basic Information</h4>
                <p><strong>Gender:</strong> {profile.gender}</p>
                <p><strong>Age:</strong> {profile.age} years</p>
                <p><strong>Height:</strong> {profile.height} cm</p>
                <p><strong>Weight:</strong> {profile.weight} kg</p>
                <p><strong>BMI:</strong> {bmi}</p>
              </div>
              
              <div className="summary-section">
                <h4>Health Profile</h4>
                <p><strong>Food Type:</strong> {profile.foodType}</p>
                <p><strong>Health Condition:</strong> {profile.disease || 'None'}</p>
                <p><strong>Activity Level:</strong> {profile.activityLevel}</p>
              </div>
              
              {profile.medications.length > 0 && (
                <div className="summary-section">
                  <h4>Medications</h4>
                  {profile.medications.map((med, idx) => (
                    <p key={idx}><strong>{med.name}:</strong> {med.dosage} for {med.duration}</p>
                  ))}
                </div>
              )}
              
              {profile.healthGoals.length > 0 && (
                <div className="summary-section">
                  <h4>Health Goals</h4>
                  <p>{profile.healthGoals.join(', ')}</p>
                </div>
              )}
            </div>
            
            <button 
              type="button" 
              className="submit-profile-btn"
              onClick={submitProfile}
            >
              Save Profile & Continue
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-wizard-container">
      <div className="wizard-header">
        <h2>Complete Your Health Profile</h2>
        <div className="wizard-progress">
          {steps.map((stepInfo, i) => (
            <div 
              key={i} 
              className={`wizard-step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
            >
              <span className="step-icon">{stepInfo.icon}</span>
              <span className="step-title">{stepInfo.title}</span>
            </div>
          ))}
        </div>
      </div>

      {renderStepContent()}

      <div className="wizard-navigation">
        {step > 0 && (
          <button 
            type="button" 
            className="nav-btn prev-btn"
            onClick={prevStep}
          >
            ← Previous
          </button>
        )}
        
        {step < steps.length - 1 && (
          <button 
            type="button" 
            className="nav-btn next-btn"
            onClick={nextStep}
          >
            Next →
          </button>
        )}
      </div>
      
      {showWarning && (
        <div className="warning-notice">
          Please review all fields before proceeding
        </div>
      )}
    </div>
  );
} 
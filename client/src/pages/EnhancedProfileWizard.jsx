import React, { useState } from 'react';
import { ValidatedInput, BMICalculator, MedicationInput, SelectInput } from '../components/ValidatedInputs';
import { validateForm } from '../utils/validation';
import { useNotifications } from '../hooks/useNotifications';

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
  healthGoals: []
};

const steps = [
  { title: 'Basic Information', icon: '👤' },
  { title: 'Health Profile', icon: '🏥' },
  { title: 'Medications & Allergies', icon: '💊' },
  { title: 'Lifestyle & Goals', icon: '🎯' },
  { title: 'Review & Submit', icon: '✅' }
];

const genderOptions = ['Male', 'Female', 'Other'];
const foodTypeOptions = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Flexible'];
const activityLevelOptions = [
  { value: 'sedentary', label: 'Sedentary (little/no exercise)' },
  { value: 'light', label: 'Light (1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (3-5 days/week)' },
  { value: 'active', label: 'Active (6-7 days/week)' },
  { value: 'very_active', label: 'Very Active (2x/day)' }
];

const healthGoalsOptions = [
  'Weight Loss', 'Weight Gain', 'Muscle Building', 'Heart Health', 
  'Diabetes Management', 'Blood Pressure Control', 'General Wellness',
  'Energy Boost', 'Better Sleep', 'Digestive Health'
];

export default function ProfileWizard() {
  const [profile, setProfile] = useState(initialProfile);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [bmi, setBMI] = useState('');
  const { showSuccess, showError } = useNotifications();

  const handleChange = (field, value) => {
    setProfile(p => ({ ...p, [field]: value }));
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleHealthGoalsChange = (goal) => {
    const currentGoals = profile.healthGoals || [];
    const updatedGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    handleChange('healthGoals', updatedGoals);
  };

  const validateCurrentStep = () => {
    let requiredFields = [];

    switch (step) {
      case 0: // Basic Information
        requiredFields = ['gender', 'age', 'height', 'weight'];
        break;
      case 1: // Health Profile
        requiredFields = ['foodType', 'disease'];
        break;
      case 2: // Medications & Allergies
        // Optional step
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
      window.location.href = '/profile';
    } catch {
      showError('Failed to save profile. Please try again.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="step-content">
            <h3 style={{ color: '#1f2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              👤 Basic Information
            </h3>
            
            <SelectInput
              label="Gender"
              value={profile.gender}
              onChange={(value) => handleChange('gender', value)}
              options={genderOptions}
              required
            />

            <ValidatedInput
              label="Age"
              type="number"
              value={profile.age}
              onChange={(value) => handleChange('age', value)}
              validationType="age"
              required
              placeholder="Enter your age"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <ValidatedInput
                label="Height (cm)"
                type="number"
                value={profile.height}
                onChange={(value) => handleChange('height', value)}
                validationType="height"
                required
                placeholder="e.g., 170"
              />

              <ValidatedInput
                label="Weight (kg)"
                type="number"
                value={profile.weight}
                onChange={(value) => handleChange('weight', value)}
                validationType="weight"
                required
                placeholder="e.g., 70"
              />
            </div>

            <BMICalculator
              weight={profile.weight}
              height={profile.height}
              onBMIChange={(calculatedBMI) => setBMI(calculatedBMI)}
            />
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <h3 style={{ color: '#1f2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🏥 Health Profile
            </h3>

            <SelectInput
              label="Food Preference"
              value={profile.foodType}
              onChange={(value) => handleChange('foodType', value)}
              options={foodTypeOptions}
              required
            />

            <ValidatedInput
              label="Health Conditions/Diseases"
              type="text"
              value={profile.disease}
              onChange={(value) => handleChange('disease', value)}
              validationType="disease"
              required
              placeholder="e.g., Diabetes, Hypertension, None"
            />
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3 style={{ color: '#1f2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              💊 Medications & Allergies
            </h3>

            <MedicationInput
              medications={profile.medications}
              onChange={(medications) => handleChange('medications', medications)}
            />

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#374151',
                fontSize: '0.875rem'
              }}>
                Food Allergies 🚫
              </label>
              <ValidatedInput
                type="text"
                value={profile.allergies.join(', ')}
                onChange={(value) => handleChange('allergies', value.split(',').map(a => a.trim()).filter(a => a))}
                placeholder="e.g., Nuts, Shellfish, Dairy (separate with commas)"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3 style={{ color: '#1f2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🎯 Lifestyle & Goals
            </h3>

            <SelectInput
              label="Activity Level"
              value={profile.activityLevel}
              onChange={(value) => handleChange('activityLevel', value)}
              options={activityLevelOptions}
              required
            />

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '1rem',
                fontWeight: '500',
                color: '#374151',
                fontSize: '0.875rem'
              }}>
                Health Goals (select all that apply)
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.5rem'
              }}>
                {healthGoalsOptions.map(goal => (
                  <label
                    key={goal}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      border: profile.healthGoals?.includes(goal) ? '2px solid #22c55e' : '2px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: profile.healthGoals?.includes(goal) ? '#dcfce7' : 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={profile.healthGoals?.includes(goal) || false}
                      onChange={() => handleHealthGoalsChange(goal)}
                      style={{ margin: 0 }}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      {goal}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3 style={{ color: '#1f2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ✅ Review & Submit
            </h3>

            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Profile Summary</h4>
              
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div><strong>Gender:</strong> {profile.gender}</div>
                <div><strong>Age:</strong> {profile.age} years</div>
                <div><strong>Height:</strong> {profile.height} cm</div>
                <div><strong>Weight:</strong> {profile.weight} kg</div>
                {bmi && <div><strong>BMI:</strong> {bmi}</div>}
                <div><strong>Food Preference:</strong> {profile.foodType}</div>
                <div><strong>Health Conditions:</strong> {profile.disease}</div>
                <div><strong>Medications:</strong> {profile.medications.length > 0 ? profile.medications.join(', ') : 'None'}</div>
                <div><strong>Allergies:</strong> {profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None'}</div>
                <div><strong>Activity Level:</strong> {profile.activityLevel}</div>
                <div><strong>Health Goals:</strong> {profile.healthGoals?.length > 0 ? profile.healthGoals.join(', ') : 'None selected'}</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '2rem',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            {steps.map((stepInfo, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: index <= step ? '#22c55e' : '#e5e7eb',
                  color: index <= step ? 'white' : '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  marginBottom: '0.5rem',
                  transition: 'all 0.3s ease'
                }}>
                  {stepInfo.icon}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  color: index <= step ? '#22c55e' : '#9ca3af',
                  fontWeight: index === step ? '600' : '400'
                }}>
                  {stepInfo.title}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{
            width: '100%',
            height: '4px',
            background: '#e5e7eb',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(step / (steps.length - 1)) * 100}%`,
              height: '100%',
              background: '#22c55e',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={prevStep}
            disabled={step === 0}
            style={{
              padding: '0.75rem 1.5rem',
              background: step === 0 ? '#f3f4f6' : '#6b7280',
              color: step === 0 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: step === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ← Previous
          </button>

          {step === steps.length - 1 ? (
            <button
              onClick={submitProfile}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              🚀 Complete Profile
            </button>
          ) : (
            <button
              onClick={nextStep}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

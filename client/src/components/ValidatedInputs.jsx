import React, { useState, useEffect } from 'react';
import { validateField, calculateBMI, getBMICategory } from '../utils/validation';

export const ValidatedInput = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  validationType,
  required = false,
  placeholder,
  disabled = false,
  customRules = {},
  className = ''
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (touched && validationType) {
      const validation = validateField(validationType, newValue, customRules);
      setError(validation.error || '');
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (validationType) {
      const validation = validateField(validationType, value, customRules);
      setError(validation.error || '');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: disabled ? '#f9fafb' : 'white'
  };

  const focusStyle = {
    borderColor: error ? '#ef4444' : '#22c55e'
  };

  return (
    <div className={`validated-input ${className}`} style={{ marginBottom: '1rem' }}>
      <label style={{
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '500',
        color: '#374151',
        fontSize: '0.875rem'
      }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyle}
      />
      
      {error && (
        <div style={{
          color: '#ef4444',
          fontSize: '0.75rem',
          marginTop: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <span>⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

export const BMICalculator = ({ weight, height, onBMIChange }) => {
  const [bmi, setBMI] = useState('');
  const [category, setCategory] = useState(null);

  useEffect(() => {
    if (weight && height) {
      const calculatedBMI = calculateBMI(weight, height);
      if (calculatedBMI) {
        setBMI(calculatedBMI);
        setCategory(getBMICategory(calculatedBMI));
        onBMIChange && onBMIChange(calculatedBMI);
      }
    } else {
      setBMI('');
      setCategory(null);
      onBMIChange && onBMIChange('');
    }
  }, [weight, height, onBMIChange]);

  if (!bmi) return null;

  return (
    <div style={{
      background: category?.color + '10',
      border: `2px solid ${category?.color}30`,
      borderRadius: '12px',
      padding: '1rem',
      marginTop: '1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.5rem'
      }}>
        <span style={{ fontSize: '1.5rem' }}>{category?.emoji}</span>
        <div>
          <h4 style={{
            margin: 0,
            color: category?.color,
            fontSize: '1.125rem',
            fontWeight: '600'
          }}>
            BMI: {bmi}
          </h4>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            Category: {category?.category}
          </p>
        </div>
      </div>
      
      <div style={{
        fontSize: '0.75rem',
        color: '#6b7280',
        fontStyle: 'italic'
      }}>
        BMI is calculated as weight (kg) / height² (m²)
      </div>
    </div>
  );
};

export const MedicationInput = ({ medications = [], onChange }) => {
  const [currentMedication, setCurrentMedication] = useState('');
  const [error, setError] = useState('');

  const addMedication = () => {
    if (!currentMedication.trim()) {
      setError('Please enter a medication name');
      return;
    }
    
    if (medications.includes(currentMedication.trim())) {
      setError('This medication is already added');
      return;
    }
    
    onChange([...medications, currentMedication.trim()]);
    setCurrentMedication('');
    setError('');
  };

  const removeMedication = (index) => {
    const updatedMedications = medications.filter((_, i) => i !== index);
    onChange(updatedMedications);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMedication();
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '500',
        color: '#374151',
        fontSize: '0.875rem'
      }}>
        Medications 💊
      </label>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          type="text"
          value={currentMedication}
          onChange={(e) => {
            setCurrentMedication(e.target.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          placeholder="Enter medication name"
          style={{
            flex: 1,
            padding: '0.75rem',
            border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`,
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        <button
          type="button"
          onClick={addMedication}
          style={{
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Add
        </button>
      </div>
      
      {error && (
        <div style={{
          color: '#ef4444',
          fontSize: '0.75rem',
          marginBottom: '0.5rem'
        }}>
          ⚠️ {error}
        </div>
      )}
      
      {medications.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginTop: '0.5rem'
        }}>
          {medications.map((med, index) => (
            <span
              key={index}
              style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              💊 {med}
              <button
                onClick={() => removeMedication(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  padding: 0
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const SelectInput = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  required = false,
  placeholder = 'Select an option'
}) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '500',
        color: '#374151',
        fontSize: '0.875rem'
      }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '1rem',
          outline: 'none',
          backgroundColor: 'white',
          cursor: 'pointer'
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  );
};

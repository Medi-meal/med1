// Validation utilities for health-related inputs
export const validationRules = {
  age: {
    min: 1,
    max: 120,
    message: 'Age must be between 1 and 120 years'
  },
  weight: {
    min: 0.5,
    max: 1000,
    message: 'Weight must be between 0.5 and 1000 kg'
  },
  height: {
    min: 30,
    max: 300,
    message: 'Height must be between 30 and 300 cm'
  },
  bmi: {
    min: 10,
    max: 100,
    message: 'BMI must be between 10 and 80'
  }
};

export const validateField = (fieldName, value, customRules = {}) => {
  const rules = { ...validationRules[fieldName], ...customRules };
  const numValue = parseFloat(value);
  
  // Check if value exists
  if (!value || value.toString().trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  // Check if it's a valid number
  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  
  // Check minimum value
  if (rules.min !== undefined && numValue < rules.min) {
    return { isValid: false, error: rules.message || `${fieldName} must be at least ${rules.min}` };
  }
  
  // Check maximum value
  if (rules.max !== undefined && numValue > rules.max) {
    return { isValid: false, error: rules.message || `${fieldName} must be at most ${rules.max}` };
  }
  
  return { isValid: true, error: null };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true, error: null };
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
  }
  return { isValid: true, error: null };
};

// Common medications list for validation
const COMMON_MEDICATIONS = [
  'none', 'no medication', 'n/a', 'nil',
  // Pain relief
  'ibuprofen', 'paracetamol', 'acetaminophen', 'aspirin', 'tylenol', 'advil',
  // Diabetes
  'metformin', 'insulin', 'glimepiride', 'gliclazide', 'pioglitazone',
  // Blood pressure
  'lisinopril', 'amlodipine', 'losartan', 'atenolol', 'metoprolol',
  // Heart conditions
  'atorvastatin', 'simvastatin', 'clopidogrel', 'warfarin',
  // Antibiotics
  'amoxicillin', 'azithromycin', 'ciprofloxacin', 'doxycycline',
  // Mental health
  'sertraline', 'fluoxetine', 'alprazolam', 'lorazepam',
  // Thyroid
  'levothyroxine', 'methimazole',
  // Vitamins
  'vitamin d', 'vitamin b12', 'calcium', 'iron', 'folic acid'
];

// Common medical conditions
export const MEDICAL_CONDITIONS = [
  'None / Healthy',
  'Diabetes Type 1',
  'Diabetes Type 2',
  'High Blood Pressure (Hypertension)',
  'Heart Disease',
  'High Cholesterol',
  'Asthma',
  'Arthritis',
  'Thyroid Disorders',
  'Depression',
  'Anxiety',
  'PCOS (Polycystic Ovary Syndrome)',
  'Kidney Disease',
  'Liver Disease',
  'Obesity',
  'Anemia',
  'Gastroesophageal Reflux Disease (GERD)',
  'Irritable Bowel Syndrome (IBS)',
  'Celiac Disease',
  'Food Allergies',
  'Migraine',
  'Osteoporosis',
  'Sleep Apnea',
  'Other (Please specify)'
];

export const validateMedication = (medication) => {
  if (!medication || medication.trim() === '') {
    return { isValid: false, error: 'Medication information is required. Enter "none" if not taking any.' };
  }
  
  const cleanMedication = medication.toLowerCase().trim();
  
  // Check length
  if (cleanMedication.length < 2) {
    return { isValid: false, error: 'Medication name must be at least 2 characters' };
  }
  if (cleanMedication.length > 200) {
    return { isValid: false, error: 'Medication information must be less than 200 characters' };
  }
  
  // Check for potentially harmful patterns
  const suspiciousPatterns = [
    /\d{10,}/, // Very long numbers (might be phone numbers)
    /[<>{}]/,  // HTML/XML tags
    /(script|javascript)/i, // Potential XSS
  ];
  
  for (let pattern of suspiciousPatterns) {
    if (pattern.test(cleanMedication)) {
      return { isValid: false, error: 'Please enter only medication names and dosages' };
    }
  }
  
  // Suggest common medications if partially matching
  const suggestions = COMMON_MEDICATIONS.filter(med => 
    med.includes(cleanMedication) && med !== cleanMedication
  ).slice(0, 3);
  
  return { 
    isValid: true, 
    error: null,
    suggestions: suggestions.length > 0 ? suggestions : null
  };
};

export const validateHealthCondition = (condition) => {
  if (!condition || condition.trim() === '') {
    return { isValid: false, error: 'Medical condition is required. Select "None / Healthy" if applicable.' };
  }
  
  const cleanCondition = condition.trim();
  
  // Check length
  if (cleanCondition.length < 2) {
    return { isValid: false, error: 'Medical condition must be at least 2 characters' };
  }
  if (cleanCondition.length > 300) {
    return { isValid: false, error: 'Medical condition description must be less than 300 characters' };
  }
  
  // Check for potentially harmful patterns
  const suspiciousPatterns = [
    /\d{10,}/, // Very long numbers
    /[<>{}]/,  // HTML/XML tags
    /(script|javascript)/i, // Potential XSS
  ];
  
  for (let pattern of suspiciousPatterns) {
    if (pattern.test(cleanCondition)) {
      return { isValid: false, error: 'Please enter only medical condition information' };
    }
  }
  
  return { isValid: true, error: null };
};

export const validateAllergies = (allergies) => {
  if (allergies && allergies.length > 20) {
    return { isValid: false, error: 'Maximum 20 allergies allowed' };
  }
  
  for (let allergy of allergies || []) {
    if (allergy.length > 50) {
      return { isValid: false, error: 'Each allergy must be less than 50 characters' };
    }
  }
  
  return { isValid: true, error: null };
};

export const calculateBMI = (weight, height) => {
  const weightKg = parseFloat(weight);
  const heightM = parseFloat(height) / 100; // Convert cm to meters
  
  if (isNaN(weightKg) || isNaN(heightM) || heightM <= 0) {
    return null;
  }
  
  return (weightKg / (heightM * heightM)).toFixed(1);
};

export const getBMICategory = (bmi) => {
  const bmiValue = parseFloat(bmi);
  
  if (bmiValue < 18.5) return { category: 'Underweight', color: '#3b82f6', emoji: '⚡' };
  if (bmiValue < 25) return { category: 'Normal', color: '#22c55e', emoji: '✅' };
  if (bmiValue < 30) return { category: 'Overweight', color: '#f59e0b', emoji: '⚠️' };
  return { category: 'Obese', color: '#ef4444', emoji: '🚨' };
};

export const validateForm = (formData, requiredFields = []) => {
  const errors = {};
  let isValid = true;
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors[field] = `${field} is required`;
      isValid = false;
    }
  });
  
  // Validate specific fields
  if (formData.age) {
    const ageValidation = validateField('age', formData.age);
    if (!ageValidation.isValid) {
      errors.age = ageValidation.error;
      isValid = false;
    }
  }
  
  if (formData.weight) {
    const weightValidation = validateField('weight', formData.weight);
    if (!weightValidation.isValid) {
      errors.weight = weightValidation.error;
      isValid = false;
    }
  }
  
  if (formData.height) {
    const heightValidation = validateField('height', formData.height);
    if (!heightValidation.isValid) {
      errors.height = heightValidation.error;
      isValid = false;
    }
  }
  
  if (formData.email) {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
      isValid = false;
    }
  }
  
  if (formData.password) {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error;
      isValid = false;
    }
  }
  
  if (formData.medication) {
    const medicationValidation = validateMedication(formData.medication);
    if (!medicationValidation.isValid) {
      errors.medication = medicationValidation.error;
      isValid = false;
    }
  }
  
  if (formData.disease) {
    const diseaseValidation = validateHealthCondition(formData.disease);
    if (!diseaseValidation.isValid) {
      errors.disease = diseaseValidation.error;
      isValid = false;
    }
  }
  
  if (formData.allergies) {
    const allergiesValidation = validateAllergies(formData.allergies);
    if (!allergiesValidation.isValid) {
      errors.allergies = allergiesValidation.error;
      isValid = false;
    }
  }
  
  return { isValid, errors };
};

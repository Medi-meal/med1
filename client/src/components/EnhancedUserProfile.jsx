import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { calculateBMI, getBMICategory } from '../utils/validation';

const EnhancedUserProfile = ({ user, healthProfile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(healthProfile || {});
  const { showSuccess, showError } = useNotifications();

  // Random avatar icons
  const avatarIcons = ['👨‍💼', '👩‍💼', '👨‍⚕️', '👩‍⚕️', '👨‍🍳', '👩‍🍳', '👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍🎨', '👩‍🎨', '🧑‍🔬'];
  const [selectedAvatar, setSelectedAvatar] = useState(avatarIcons[Math.floor(Math.random() * avatarIcons.length)]);

  const handleSaveProfile = () => {
    try {
      // Validate required fields
      if (!editedProfile.age || !editedProfile.height || !editedProfile.weight) {
        showError('Please fill in all required fields (age, height, weight)');
        return;
      }

      // Update profile
      if (onUpdateProfile) {
        onUpdateProfile(editedProfile);
      }
      
      setIsEditing(false);
      showSuccess('Profile updated successfully!');
    } catch {
      showError('Failed to update profile. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(healthProfile || {});
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const currentBMI = healthProfile?.height && healthProfile?.weight 
    ? calculateBMI(healthProfile.weight, healthProfile.height)
    : null;

  const bmiCategory = currentBMI ? getBMICategory(parseFloat(currentBMI)) : null;

  const getBMIColor = (category) => {
    switch (category) {
      case 'Underweight': return '#3b82f6';
      case 'Normal weight': return '#22c55e';
      case 'Overweight': return '#f59e0b';
      case 'Obese': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const ProfileCard = ({ title, children, icon }) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <span style={{ fontSize: '1.25rem' }}>{icon}</span>
        <h3 style={{ margin: 0, color: '#1f2937' }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  const InfoRow = ({ label, value, editable = false, field, type = 'text', options = null }) => {
    if (isEditing && editable) {
      if (options) {
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <span style={{ fontWeight: '500', color: '#374151' }}>{label}:</span>
            <select
              value={editedProfile[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                minWidth: '150px'
              }}
            >
              <option value="">Select {label}</option>
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      } else {
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <span style={{ fontWeight: '500', color: '#374151' }}>{label}:</span>
            <input
              type={type}
              value={editedProfile[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                minWidth: '150px'
              }}
            />
          </div>
        );
      }
    }

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <span style={{ fontWeight: '500', color: '#374151' }}>{label}:</span>
        <span style={{ color: '#6b7280' }}>{value || 'Not set'}</span>
      </div>
    );
  };

  return (
    <div style={{
      background: '#f8fafc',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>👤</span>
          <h2 style={{ margin: 0, color: '#1f2937' }}>User Profile</h2>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            ✏️ Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSaveProfile}
              style={{
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              💾 Save
            </button>
            <button
              onClick={handleCancelEdit}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              ❌ Cancel
            </button>
          </div>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {/* Personal Information */}
        <ProfileCard title="Personal Information" icon="📋">
          {/* Avatar Selection */}
          {isEditing && (
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                Choose Avatar:
              </span>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '0.5rem'
              }}>
                {avatarIcons.map((icon, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAvatar(icon)}
                    style={{
                      padding: '0.5rem',
                      border: `2px solid ${selectedAvatar === icon ? '#22c55e' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      background: selectedAvatar === icon ? '#f0fdf4' : 'white',
                      cursor: 'pointer',
                      fontSize: '1.5rem'
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            marginBottom: '1rem',
            padding: '1rem',
            background: '#f0fdf4',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '3rem' }}>{selectedAvatar}</div>
            <div>
              <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '1.125rem' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {user?.email}
              </div>
            </div>
          </div>

          <InfoRow 
            label="Name" 
            value={user?.name} 
            editable={false}
          />
          <InfoRow 
            label="Email" 
            value={user?.email} 
            editable={false}
          />
          <InfoRow 
            label="Age" 
            value={healthProfile?.age} 
            editable={true}
            field="age"
            type="number"
          />
          <InfoRow 
            label="Gender" 
            value={healthProfile?.gender} 
            editable={true}
            field="gender"
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' }
            ]}
          />
        </ProfileCard>

        {/* Health Metrics */}
        <ProfileCard title="Health Metrics" icon="📊">
          <InfoRow 
            label="Height" 
            value={healthProfile?.height ? `${healthProfile.height} cm` : null} 
            editable={true}
            field="height"
            type="number"
          />
          <InfoRow 
            label="Weight" 
            value={healthProfile?.weight ? `${healthProfile.weight} kg` : null} 
            editable={true}
            field="weight"
            type="number"
          />
          
          {currentBMI && (
            <div style={{
              background: '#f0fdf4',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem',
              border: `2px solid ${getBMIColor(bmiCategory)}`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: '600', color: '#1f2937' }}>BMI:</span>
                <span style={{ 
                  fontWeight: '700',
                  fontSize: '1.125rem',
                  color: getBMIColor(bmiCategory)
                }}>
                  {currentBMI}
                </span>
              </div>
              <div style={{ 
                textAlign: 'center',
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                color: getBMIColor(bmiCategory),
                fontWeight: '500'
              }}>
                {bmiCategory}
              </div>
            </div>
          )}
          
          <InfoRow 
            label="Activity Level" 
            value={healthProfile?.activityLevel} 
            editable={true}
            field="activityLevel"
            options={[
              { value: 'sedentary', label: 'Sedentary' },
              { value: 'light', label: 'Light Activity' },
              { value: 'moderate', label: 'Moderate Activity' },
              { value: 'active', label: 'Very Active' },
              { value: 'very-active', label: 'Extremely Active' }
            ]}
          />
        </ProfileCard>

        {/* Diet & Health */}
        <ProfileCard title="Diet & Health" icon="🥗">
          <InfoRow 
            label="Food Type" 
            value={healthProfile?.foodType} 
            editable={true}
            field="foodType"
            options={[
              { value: 'Vegetarian', label: 'Vegetarian' },
              { value: 'Non-Vegetarian', label: 'Non-Vegetarian' },
              { value: 'Vegan', label: 'Vegan' },
              { value: 'Flexible', label: 'Flexible' }
            ]}
          />
          <InfoRow 
            label="Health Condition" 
            value={healthProfile?.disease} 
            editable={true}
            field="disease"
          />
          
          {healthProfile?.medications && healthProfile.medications.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <span style={{ fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                Medications:
              </span>
              <div style={{ 
                background: '#f8fafc',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                {healthProfile.medications.join(', ')}
              </div>
            </div>
          )}
          
          {healthProfile?.allergies && healthProfile.allergies.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <span style={{ fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                Allergies:
              </span>
              <div style={{ 
                background: '#fef2f2',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: '#dc2626'
              }}>
                {healthProfile.allergies.join(', ')}
              </div>
            </div>
          )}
        </ProfileCard>

        {/* Health Goals */}
        <ProfileCard title="Health Goals" icon="🎯">
          {healthProfile?.healthGoals && healthProfile.healthGoals.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '0.5rem'
            }}>
              {healthProfile.healthGoals.map((goal, index) => (
                <div key={index} style={{
                  background: '#dbeafe',
                  color: '#1e40af',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {goal}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center',
              color: '#6b7280',
              fontStyle: 'italic'
            }}>
              No health goals set yet
            </div>
          )}
        </ProfileCard>
      </div>
    </div>
  );
};

export default EnhancedUserProfile;

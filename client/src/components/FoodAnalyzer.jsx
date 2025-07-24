import React, { useState } from 'react';
import axios from 'axios';

const FoodAnalyzer = ({ user }) => {
  const [foodQuery, setFoodQuery] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const analyzeFood = async () => {
    if (!foodQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/food-analysis', {
        food: foodQuery,
        userProfile: user
      });
      
      const newAnalysis = {
        food: foodQuery,
        result: response.data,
        timestamp: new Date()
      };
      
      setAnalysis(newAnalysis);
      setSearchHistory(prev => [newAnalysis, ...prev.slice(0, 4)]); // Keep last 5 searches
      setFoodQuery('');
    } catch (error) {
      console.error('Food analysis error:', error);
      setAnalysis({
        food: foodQuery,
        result: { error: 'Failed to analyze food. Please try again.' },
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return '#22c55e';
      case 'caution': return '#f59e0b';
      case 'avoid': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'safe': return '✅';
      case 'caution': return '⚠️';
      case 'avoid': return '❌';
      default: return '❓';
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    }}>
      <h3 style={{ 
        color: '#1f2937', 
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        🔍 Food Safety Analyzer
      </h3>

      {/* Search Input */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        <input
          type="text"
          value={foodQuery}
          onChange={(e) => setFoodQuery(e.target.value)}
          placeholder="Enter a food item to check safety (e.g., 'spinach', 'grapefruit juice')"
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
          onKeyPress={(e) => e.key === 'Enter' && analyzeFood()}
        />
        <button
          onClick={analyzeFood}
          disabled={loading || !foodQuery.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading ? '#9ca3af' : '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            minWidth: '100px'
          }}
        >
          {loading ? '🔄 Analyzing...' : '🔍 Analyze'}
        </button>
      </div>

      {/* Current Analysis Result */}
      {analysis && (
        <div style={{
          background: analysis.result.error ? '#fef2f2' : '#f0fdf4',
          border: `2px solid ${analysis.result.error ? '#fecaca' : '#bbf7d0'}`,
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <h4 style={{
              margin: 0,
              color: '#1f2937',
              fontSize: '1.125rem'
            }}>
              Analysis for "{analysis.food}"
            </h4>
            {!analysis.result.error && (
              <span style={{
                background: getStatusColor(analysis.result.status),
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                {getStatusIcon(analysis.result.status)}
                {analysis.result.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            )}
          </div>

          {analysis.result.error ? (
            <p style={{ color: '#dc2626', margin: 0 }}>
              {analysis.result.error}
            </p>
          ) : (
            <div>
              {analysis.result.recommendation && (
                <p style={{ 
                  color: '#374151', 
                  margin: '0 0 0.75rem 0',
                  fontSize: '1rem',
                  lineHeight: '1.5'
                }}>
                  <strong>Recommendation:</strong> {analysis.result.recommendation}
                </p>
              )}
              
              {analysis.result.warnings && analysis.result.warnings.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <strong style={{ color: '#dc2626' }}>⚠️ Warnings:</strong>
                  <ul style={{ 
                    margin: '0.5rem 0 0 0', 
                    paddingLeft: '1.25rem',
                    color: '#dc2626'
                  }}>
                    {analysis.result.warnings.map((warning, index) => (
                      <li key={index} style={{ marginBottom: '0.25rem' }}>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.result.interactions && analysis.result.interactions.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <strong style={{ color: '#dc2626' }}>💊 Drug Interactions:</strong>
                  <ul style={{ 
                    margin: '0.5rem 0 0 0', 
                    paddingLeft: '1.25rem',
                    color: '#dc2626'
                  }}>
                    {analysis.result.interactions.map((interaction, index) => (
                      <li key={index} style={{ marginBottom: '0.25rem' }}>
                        {interaction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.result.benefits && analysis.result.benefits.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <strong style={{ color: '#16a34a' }}>✅ Benefits:</strong>
                  <ul style={{ 
                    margin: '0.5rem 0 0 0', 
                    paddingLeft: '1.25rem',
                    color: '#16a34a'
                  }}>
                    {analysis.result.benefits.map((benefit, index) => (
                      <li key={index} style={{ marginBottom: '0.25rem' }}>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div>
          <h4 style={{ 
            color: '#374151', 
            marginBottom: '0.75rem',
            fontSize: '1rem'
          }}>
            📝 Recent Searches
          </h4>
          <div style={{
            display: 'grid',
            gap: '0.5rem'
          }}>
            {searchHistory.map((item, index) => (
              <div
                key={index}
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setFoodQuery(item.food)}
                onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.background = '#f9fafb'}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    color: '#374151', 
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {item.food}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {!item.result.error && (
                      <span style={{
                        color: getStatusColor(item.result.status),
                        fontSize: '0.875rem'
                      }}>
                        {getStatusIcon(item.result.status)}
                      </span>
                    )}
                    <span style={{ 
                      color: '#9ca3af', 
                      fontSize: '0.75rem' 
                    }}>
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodAnalyzer;

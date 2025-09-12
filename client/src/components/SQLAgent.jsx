import React, { useState, useEffect } from 'react';
import './SQLAgent.css';

const SQLAgent = ({ userEmail }) => {
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState('natural');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [examples, setExamples] = useState(null);
  const [showExamples, setShowExamples] = useState(false);

  useEffect(() => {
    fetchExamples();
  }, []);

  const fetchExamples = async () => {
    try {
      const response = await fetch('/api/sql-query/examples');
      const data = await response.json();
      setExamples(data);
    } catch (err) {
      console.error('Failed to fetch examples:', err);
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    if (!userEmail) {
      setError('User email is required for authentication');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/sql-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-email': userEmail
        },
        body: JSON.stringify({
          query: query,
          type: queryType
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.message || data.error || 'Query failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
    setQueryType('natural');
    setShowExamples(false);
  };

  const formatResults = (data) => {
    if (!data || data.length === 0) {
      return <div className="no-results">No results found</div>;
    }

    const columns = Object.keys(data[0]);
    
    return (
      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>{col.replace(/_/g, ' ').toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {columns.map(col => (
                  <td key={col}>
                    {typeof row[col] === 'number' && row[col] % 1 !== 0 
                      ? row[col].toFixed(2) 
                      : row[col] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="sql-agent">
      <div className="sql-agent-header">
        <h2>🔍 AI Nutrition Query Assistant</h2>
        <p>Ask questions about your nutrition data in plain English or use SQL</p>
      </div>

      <div className="query-section">
        <div className="query-type-selector">
          <label>
            <input
              type="radio"
              value="natural"
              checked={queryType === 'natural'}
              onChange={(e) => setQueryType(e.target.value)}
            />
            Natural Language
          </label>
          <label>
            <input
              type="radio"
              value="sql"
              checked={queryType === 'sql'}
              onChange={(e) => setQueryType(e.target.value)}
            />
            SQL Query
          </label>
        </div>

        <div className="query-input-container">
          <textarea
            className="query-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              queryType === 'natural' 
                ? "Ask about your nutrition data... e.g., 'Show my calories today' or 'What did I eat for lunch this week?'"
                : "Enter SQL query... e.g., 'SELECT meal_type, SUM(calories) FROM food_logs GROUP BY meal_type'"
            }
            rows={3}
          />
          
          <div className="query-actions">
            <button
              className="execute-btn"
              onClick={executeQuery}
              disabled={loading || !query.trim()}
            >
              {loading ? '🔄 Querying...' : '🚀 Execute Query'}
            </button>
            
            <button
              className="examples-btn"
              onClick={() => setShowExamples(!showExamples)}
            >
              💡 Examples
            </button>
          </div>
        </div>
      </div>

      {showExamples && examples && (
        <div className="examples-section">
          <h3>📝 Example Queries</h3>
          <div className="examples-grid">
            <div className="examples-category">
              <h4>Natural Language</h4>
              {examples.natural_language.map((example, index) => (
                <button
                  key={index}
                  className="example-item"
                  onClick={() => handleExampleClick(example)}
                >
                  "{example}"
                </button>
              ))}
            </div>
            
            <div className="examples-category">
              <h4>SQL Examples</h4>
              {examples.sql_queries.map((example, index) => (
                <div key={index} className="sql-example">
                  <strong>{example.description}</strong>
                  <code onClick={() => {
                    setQuery(example.query);
                    setQueryType('sql');
                    setShowExamples(false);
                  }}>
                    {example.query}
                  </code>
                </div>
              ))}
            </div>
          </div>
          
          <div className="security-notes">
            <h4>🔒 Security Notes</h4>
            <ul>
              {examples.security_notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {error && (
        <div className="error-section">
          <h3>❌ Query Error</h3>
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div className="results-section">
          <div className="results-header">
            <h3>✅ Query Results</h3>
            <div className="results-meta">
              <span>📊 {results.data.length} results</span>
              <span>⏱️ {new Date(results.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
          
          {results.query && (
            <div className="executed-query">
              <h4>Executed SQL:</h4>
              <code>{results.query}</code>
            </div>
          )}
          
          <div className="results-data">
            {formatResults(results.data)}
          </div>
          
          {results.data.length > 0 && (
            <div className="export-options">
              <button 
                onClick={() => {
                  const csv = convertToCSV(results.data);
                  downloadCSV(csv, 'nutrition-query-results.csv');
                }}
                className="export-btn"
              >
                📥 Export as CSV
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Utility functions
const convertToCSV = (data) => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default SQLAgent;

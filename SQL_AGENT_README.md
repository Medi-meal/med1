# Secure SQL Agent for Med1 Diet App

## Overview
A secure, read-only SQL query agent that provides natural language and SQL querying capabilities for your diet recommendation app. The agent enforces strict security policies while allowing flexible data analysis.

## Security Features

### 🔒 **Read-Only Operations**
- Only SELECT statements allowed
- INSERT, UPDATE, DELETE, DROP, and other write operations are blocked
- Regex-based detection of dangerous SQL patterns

### 👤 **User Scoping**
- All queries automatically scoped to authenticated user's email/userId
- Cross-user data access prevention
- Automatic injection of user filtering clauses

### 🛡️ **Query Safety**
- Multiple SQL statement detection and blocking
- Automatic LIMIT clause addition (default: 5 rows)
- Parameterized query execution to prevent SQL injection

## API Endpoints

### POST `/api/sql-query`
Execute natural language or SQL queries.

**Headers:**
```
user-email: user@example.com
Content-Type: application/json
```

**Body:**
```json
{
  "query": "Show my last 5 meals",
  "type": "natural"  // or "sql"
}
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "query": "SELECT ... FROM food_logs WHERE user_id = 'user@example.com' LIMIT 5",
  "user": { "id": 1, "name": "User Name", "email": "user@example.com" },
  "timestamp": "2025-09-12T..."
}
```

### GET `/api/sql-query/examples`
Get example queries and usage patterns.

### GET `/api/sql-query/schema`
Get database schema information and security details.

### POST `/api/sql-query/sync`
Sync data from MongoDB to SQLite for SQL querying.

## Database Schema

### Tables
- **users**: User account information (name, email, password, created_at)
- **user_inputs**: Health data and preferences (bmi, age, weight, height, etc.)
- **food_logs**: Daily food intake tracking (food_name, calories, macros, etc.)
- **recommendations**: AI-generated meal recommendations

## Natural Language Query Examples

```javascript
// Recent meals
"Show my last 3 meals"
"What did I eat yesterday?"

// Nutrition analysis
"How many calories did I eat today?"
"What's my protein intake this week?"
"Show my carb consumption for the last 7 days"

// Recommendations
"Show my current meal recommendations"
"What should I eat for breakfast?"

// Profile information
"Show my profile information"
"What are my health goals?"
```

## SQL Query Examples

```sql
-- Recent food logs with user scoping
SELECT food_name, meal_type, calories, log_date 
FROM food_logs 
WHERE user_id = 'user@example.com' 
ORDER BY created_at DESC 
LIMIT 5;

-- Daily calorie breakdown
SELECT meal_type, SUM(calories) as total_calories 
FROM food_logs 
WHERE user_id = 'user@example.com' 
AND DATE(log_date) = DATE('now') 
GROUP BY meal_type;

-- Weekly nutrition trends
SELECT DATE(log_date) as date, 
       SUM(calories) as calories,
       SUM(protein) as protein,
       SUM(carbs) as carbs,
       SUM(fat) as fat
FROM food_logs 
WHERE user_id = 'user@example.com' 
AND log_date >= DATE('now', '-7 days')
GROUP BY DATE(log_date)
ORDER BY log_date DESC;
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd server
npm install sqlite3
```

### 2. Start Server
The SQL agent is automatically initialized when your Express server starts.

### 3. Sync Data (First Time)
```bash
curl -X POST http://localhost:5000/api/sql-query/sync \
  -H "user-email: your@email.com" \
  -H "Content-Type: application/json"
```

## Usage Examples

### Natural Language Query
```javascript
const response = await fetch('/api/sql-query', {
  method: 'POST',
  headers: {
    'user-email': 'user@example.com',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'Show my calories for today',
    type: 'natural'
  })
});

const result = await response.json();
console.log(result.data); // Array of results
```

### Direct SQL Query
```javascript
const response = await fetch('/api/sql-query', {
  method: 'POST',
  headers: {
    'user-email': 'user@example.com',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'SELECT meal_type, AVG(calories) FROM food_logs WHERE user_id = ? GROUP BY meal_type',
    type: 'sql'
  })
});
```

## Security Testing

Run the included test suite:
```bash
node testSQLAgent.js
```

The test covers:
- SQL injection prevention
- Cross-user access blocking
- Read-only operation enforcement
- Natural language query processing
- User authentication and verification

## Error Handling

Common error responses:

```json
{
  "error": "Authentication required",
  "message": "Please provide user-email header or userEmail parameter"
}

{
  "error": "Only SELECT statements are allowed",
  "message": "INSERT INTO users... blocked"
}

{
  "error": "User not found",
  "message": "User must exist in SQL database to execute queries"
}
```

## Performance Notes

- Default LIMIT of 5 results for fast responses
- Maximum LIMIT of 1000 results
- SQLite database stored in `diet_data.db`
- Indexes recommended on email/user_id fields for production

## Integration with Frontend

Add the SQL query component to your React app:

```jsx
const SQLQueryComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  
  const executeQuery = async () => {
    const response = await fetch('/api/sql-query', {
      method: 'POST',
      headers: {
        'user-email': userEmail,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        type: 'natural'
      })
    });
    
    const data = await response.json();
    setResults(data);
  };
  
  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask about your nutrition data..."
      />
      <button onClick={executeQuery}>Query</button>
      {results && (
        <pre>{JSON.stringify(results.data, null, 2)}</pre>
      )}
    </div>
  );
};
```

## Files Added

- `server/sqlAgent.js` - Main SQL agent class
- `server/routes/sqlAgent.js` - Express routes
- `server/dataSync.js` - MongoDB to SQLite sync utility
- `server/testSQLAgent.js` - Security and functionality tests
- `server/diet_data.db` - SQLite database (auto-created)

The SQL agent is now fully integrated and ready to use!

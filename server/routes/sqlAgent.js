const express = require('express');
const SecureSQLAgent = require('../sqlAgent');
const router = express.Router();

// Initialize SQL agent
const sqlAgent = new SecureSQLAgent();

// Middleware to verify user authentication
const requireAuth = (req, res, next) => {
    const userEmail = req.headers['user-email'] || req.body.userEmail || req.query.userEmail;
    
    if (!userEmail) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Please provide user-email header or userEmail parameter'
        });
    }
    
    req.userEmail = userEmail;
    next();
};

// POST /api/sql-query - Execute natural language or SQL query
router.post('/sql-query', requireAuth, async (req, res) => {
    try {
        const { query, type = 'natural' } = req.body;
        const userEmail = req.userEmail;

        if (!query) {
            return res.status(400).json({
                error: 'Query required',
                message: 'Please provide a query in the request body'
            });
        }

        // Verify user exists in database
        const userVerification = await sqlAgent.verifyUser(userEmail);
        if (!userVerification.verified) {
            return res.status(403).json({
                error: 'User not found',
                message: 'User must exist in SQL database to execute queries',
                details: userVerification.error
            });
        }

        let result;
        
        if (type === 'natural') {
            // Process natural language query
            result = await sqlAgent.processNaturalQuery(query, userEmail);
        } else if (type === 'sql') {
            // Execute raw SQL query (with safety checks)
            result = await sqlAgent.executeQuery(query, userEmail);
        } else {
            return res.status(400).json({
                error: 'Invalid query type',
                message: 'Type must be "natural" or "sql"'
            });
        }

        if (result.error) {
            return res.status(400).json({
                error: 'Query execution failed',
                message: result.error
            });
        }

        res.json({
            success: true,
            data: result.data,
            query: result.query,
            user: userVerification.user,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('SQL query error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while processing your query'
        });
    }
});

// GET /api/sql-query/examples - Get example queries
router.get('/examples', (req, res) => {
    const examples = {
        natural_language: [
            "Show my last 5 meals",
            "How many calories did I eat today?",
            "What's my protein intake this week?",
            "Show my current recommendations",
            "What's my profile information?"
        ],
        sql_queries: [
            {
                description: "Recent food logs",
                query: "SELECT food_name, meal_type, calories, log_date FROM food_logs WHERE user_id = 'user@example.com' ORDER BY created_at DESC LIMIT 5"
            },
            {
                description: "Today's calorie breakdown by meal",
                query: "SELECT meal_type, SUM(calories) as total_calories FROM food_logs WHERE user_id = 'user@example.com' AND DATE(log_date) = DATE('now') GROUP BY meal_type"
            },
            {
                description: "Weekly protein intake",
                query: "SELECT DATE(log_date) as date, SUM(protein) as daily_protein FROM food_logs WHERE user_id = 'user@example.com' AND log_date >= DATE('now', '-7 days') GROUP BY DATE(log_date) ORDER BY log_date DESC"
            }
        ],
        security_notes: [
            "All queries are automatically scoped to your user account",
            "Only SELECT statements are allowed",
            "Results are limited to 5 rows by default",
            "Multiple SQL statements are blocked for security"
        ]
    };

    res.json(examples);
});

// GET /api/sql-query/schema - Get database schema info
router.get('/schema', requireAuth, async (req, res) => {
    try {
        const schema = {
            tables: {
                users: {
                    description: "User account information",
                    columns: ["id", "name", "email", "password", "created_at"],
                    key_field: "email"
                },
                user_inputs: {
                    description: "User health and preference data",
                    columns: ["id", "email", "bmi", "age", "weight", "height", "activity_level", "dietary_preferences", "health_goals", "recommendations_text", "last_recommendation_update", "created_at"],
                    key_field: "email"
                },
                food_logs: {
                    description: "Daily food intake tracking",
                    columns: ["id", "user_id", "food_name", "quantity", "meal_type", "calories", "protein", "carbs", "fat", "fiber", "is_recommended", "source", "log_date", "total_calories", "total_protein", "total_carbs", "total_fat", "total_fiber", "created_at"],
                    key_field: "user_id"
                },
                recommendations: {
                    description: "AI-generated meal recommendations",
                    columns: ["id", "email", "meal_type", "food_name", "quantity", "calories", "protein", "carbs", "fat", "is_recommended", "created_at"],
                    key_field: "email"
                }
            },
            security: {
                user_scoping: "All queries are automatically filtered by your email/user_id",
                allowed_operations: ["SELECT"],
                default_limit: 5,
                max_limit: 1000
            }
        };

        res.json(schema);
    } catch (error) {
        console.error('Schema error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Could not retrieve schema information'
        });
    }
});

// POST /api/sql-query/sync - Sync data from MongoDB to SQLite
router.post('/sync', requireAuth, async (req, res) => {
    try {
        const DataSync = require('../dataSync');
        const dataSync = new DataSync();
        
        const results = await dataSync.syncAll();
        dataSync.close();
        
        res.json({
            success: true,
            message: "Data synchronized successfully from MongoDB to SQLite",
            results: results,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Could not sync data: ' + error.message
        });
    }
});

module.exports = router;

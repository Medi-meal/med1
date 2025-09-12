const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database setup
const DB_PATH = path.join(__dirname, 'diet_data.db');

// Enhanced safety patterns - adapted for diet app
const DENY_RE = /\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
const HAS_LIMIT_RE = /\blimit\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;
const REQUIRES_USER_SCOPE = ['users', 'user_inputs', 'food_logs'];

class SecureSQLAgent {
    constructor() {
        this.db = null;
        this.initDatabase();
    }

    initDatabase() {
        // Create database if it doesn't exist
        this.db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err);
            } else {
                console.log('Connected to SQLite database for diet app');
                this.createTables();
            }
        });
    }

    createTables() {
        const createTables = `
            -- Users table (mirrors MongoDB User collection)
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE NOT NULL,
                password TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- User inputs table (mirrors MongoDB UserInput collection)
            CREATE TABLE IF NOT EXISTS user_inputs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                bmi REAL,
                age INTEGER,
                weight REAL,
                height REAL,
                activity_level TEXT,
                dietary_preferences TEXT,
                health_goals TEXT,
                recommendations_text TEXT,
                last_recommendation_update DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (email) REFERENCES users(email)
            );

            -- Food logs table (mirrors MongoDB FoodLog collection)
            CREATE TABLE IF NOT EXISTS food_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                food_name TEXT,
                quantity REAL,
                meal_type TEXT,
                calories REAL,
                protein REAL,
                carbs REAL,
                fat REAL,
                fiber REAL,
                is_recommended BOOLEAN,
                source TEXT,
                log_date DATE,
                total_calories REAL,
                total_protein REAL,
                total_carbs REAL,
                total_fat REAL,
                total_fiber REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Recommendations table (extracted from UserInput for easier querying)
            CREATE TABLE IF NOT EXISTS recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                meal_type TEXT, -- breakfast, lunch, dinner
                food_name TEXT,
                quantity TEXT,
                calories REAL,
                protein REAL,
                carbs REAL,
                fat REAL,
                is_recommended BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (email) REFERENCES users(email)
            );
        `;

        this.db.exec(createTables, (err) => {
            if (err) {
                console.error('Error creating tables:', err);
            } else {
                console.log('Diet app SQL tables created successfully');
            }
        });
    }

    // Enhanced SQL safety check with user scope validation
    _safeSql(query, userEmail) {
        // Check for multiple statements
        if ((query.match(/;/g) || []).length > 1) {
            return { error: "Multiple SQL statements are not allowed." };
        }

        // Check for dangerous operations
        if (DENY_RE.test(query)) {
            return { error: "Only SELECT statements are allowed." };
        }

        // Check if query needs user scoping
        const needsUserScope = REQUIRES_USER_SCOPE.some(table => 
            query.toLowerCase().includes(table)
        );

        if (needsUserScope && !userEmail) {
            return { error: "User authentication required for this query." };
        }

        // Ensure user scoping is present in the query
        if (needsUserScope && userEmail) {
            const emailPattern = new RegExp(`email\\s*=\\s*['"]${userEmail}['"]`, 'i');
            const userIdPattern = new RegExp(`user_id\\s*=\\s*['"]${userEmail}['"]`, 'i');
            
            if (!emailPattern.test(query) && !userIdPattern.test(query)) {
                // Auto-inject user scoping if not present
                const whereIndex = query.toLowerCase().indexOf('where');
                if (whereIndex !== -1) {
                    const beforeWhere = query.substring(0, whereIndex + 5);
                    const afterWhere = query.substring(whereIndex + 5);
                    query = `${beforeWhere} (email = '${userEmail}' OR user_id = '${userEmail}') AND ${afterWhere}`;
                } else {
                    // Add WHERE clause
                    const fromIndex = query.toLowerCase().lastIndexOf('from');
                    if (fromIndex !== -1) {
                        const tableName = query.substring(fromIndex + 4).trim().split(/\s+/)[0];
                        if (REQUIRES_USER_SCOPE.includes(tableName)) {
                            query += ` WHERE email = '${userEmail}' OR user_id = '${userEmail}'`;
                        }
                    }
                }
            }
        }

        // Add LIMIT if not present (default to 5 for diet app)
        if (!HAS_LIMIT_RE.test(query)) {
            query = query.replace(/;?\s*$/, '');
            query += ' LIMIT 5;';
        }

        return { query: query };
    }

    // Execute safe SQL query
    async executeQuery(query, userEmail) {
        return new Promise((resolve, reject) => {
            const safeResult = this._safeSql(query, userEmail);
            
            if (safeResult.error) {
                return resolve({ error: safeResult.error });
            }

            const safeQuery = safeResult.query;
            console.log('Executing safe query:', safeQuery);

            this.db.all(safeQuery, [], (err, rows) => {
                if (err) {
                    resolve({ error: `Database error: ${err.message}` });
                } else {
                    resolve({ data: rows, query: safeQuery });
                }
            });
        });
    }

    // Verify user exists and get their info
    async verifyUser(email) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT id, name, email FROM users WHERE email = ? LIMIT 1';
            
            this.db.get(query, [email], (err, row) => {
                if (err) {
                    resolve({ error: `Database error: ${err.message}` });
                } else if (row) {
                    resolve({ verified: true, user: row });
                } else {
                    resolve({ verified: false, error: "User not found in database" });
                }
            });
        });
    }

    // Generate natural language response for common diet queries
    async processNaturalQuery(question, userEmail) {
        const lowerQuestion = question.toLowerCase();
        let sqlQuery = '';

        // Common diet-related query patterns
        if (lowerQuestion.includes('last') && lowerQuestion.includes('meal')) {
            const number = lowerQuestion.match(/\d+/) ? lowerQuestion.match(/\d+/)[0] : '3';
            sqlQuery = `
                SELECT food_name, quantity, meal_type, calories, protein, carbs, fat, log_date
                FROM food_logs 
                WHERE user_id = '${userEmail}'
                ORDER BY created_at DESC
                LIMIT ${number}
            `;
        } else if (lowerQuestion.includes('calories') && lowerQuestion.includes('today')) {
            sqlQuery = `
                SELECT SUM(calories) as total_calories, meal_type
                FROM food_logs 
                WHERE user_id = '${userEmail}' AND DATE(log_date) = DATE('now')
                GROUP BY meal_type
            `;
        } else if (lowerQuestion.includes('protein') && lowerQuestion.includes('week')) {
            sqlQuery = `
                SELECT DATE(log_date) as date, SUM(protein) as daily_protein
                FROM food_logs 
                WHERE user_id = '${userEmail}' AND log_date >= DATE('now', '-7 days')
                GROUP BY DATE(log_date)
                ORDER BY log_date DESC
            `;
        } else if (lowerQuestion.includes('recommendation')) {
            sqlQuery = `
                SELECT meal_type, food_name, quantity, calories, protein, carbs, fat
                FROM recommendations 
                WHERE email = '${userEmail}' AND is_recommended = 1
                ORDER BY meal_type, calories DESC
            `;
        } else if (lowerQuestion.includes('profile') || lowerQuestion.includes('info')) {
            sqlQuery = `
                SELECT u.name, u.email, ui.bmi, ui.age, ui.weight, ui.height, ui.activity_level
                FROM users u
                LEFT JOIN user_inputs ui ON u.email = ui.email
                WHERE u.email = '${userEmail}'
                ORDER BY ui.created_at DESC
                LIMIT 1
            `;
        } else {
            // Default: recent food logs
            sqlQuery = `
                SELECT food_name, meal_type, calories, log_date
                FROM food_logs 
                WHERE user_id = '${userEmail}'
                ORDER BY created_at DESC
                LIMIT 5
            `;
        }

        return await this.executeQuery(sqlQuery, userEmail);
    }

    // Close database connection
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }
}

module.exports = SecureSQLAgent;

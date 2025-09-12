const mongoose = require('mongoose');
const SecureSQLAgent = require('./sqlAgent');

// Import MongoDB models
const User = require('./models/User');
const UserInput = require('./models/UserInput');
const FoodLog = require('./models/FoodLog');

class DataSync {
    constructor() {
        this.sqlAgent = new SecureSQLAgent();
    }

    async syncUsers() {
        try {
            console.log('Syncing users from MongoDB to SQLite...');
            const users = await User.find({});
            
            for (const user of users) {
                const insertQuery = `
                    INSERT OR REPLACE INTO users (name, email, password, created_at)
                    VALUES (?, ?, ?, ?)
                `;
                
                await this.executeDirectQuery(insertQuery, [
                    user.name || '',
                    user.email,
                    user.password || '',
                    new Date().toISOString()
                ]);
            }
            
            console.log(`Synced ${users.length} users`);
            return { success: true, count: users.length };
        } catch (error) {
            console.error('Error syncing users:', error);
            return { success: false, error: error.message };
        }
    }

    async syncUserInputs() {
        try {
            console.log('Syncing user inputs from MongoDB to SQLite...');
            const userInputs = await UserInput.find({});
            
            for (const input of userInputs) {
                // Insert user input data
                const insertInputQuery = `
                    INSERT OR REPLACE INTO user_inputs 
                    (email, bmi, age, weight, height, activity_level, dietary_preferences, 
                     health_goals, recommendations_text, last_recommendation_update, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                
                await this.executeDirectQuery(insertInputQuery, [
                    input.email,
                    input.input?.bmi || null,
                    input.input?.age || null,
                    input.input?.weight || null,
                    input.input?.height || null,
                    input.input?.activityLevel || '',
                    input.input?.dietaryPreferences || '',
                    input.input?.healthGoals || '',
                    input.recommendationsText || '',
                    input.lastRecommendationUpdate ? input.lastRecommendationUpdate.toISOString() : null,
                    input.createdAt ? input.createdAt.toISOString() : new Date().toISOString()
                ]);

                // Sync recommendations if they exist
                if (input.recommendations) {
                    await this.syncRecommendations(input.email, input.recommendations);
                }
            }
            
            console.log(`Synced ${userInputs.length} user inputs`);
            return { success: true, count: userInputs.length };
        } catch (error) {
            console.error('Error syncing user inputs:', error);
            return { success: false, error: error.message };
        }
    }

    async syncRecommendations(email, recommendations) {
        try {
            const mealTypes = ['breakfast', 'lunch', 'dinner'];
            
            for (const mealType of mealTypes) {
                if (recommendations[mealType] && recommendations[mealType].recommended) {
                    for (const item of recommendations[mealType].recommended) {
                        const insertRecQuery = `
                            INSERT OR REPLACE INTO recommendations 
                            (email, meal_type, food_name, quantity, calories, protein, carbs, fat, is_recommended, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;
                        
                        await this.executeDirectQuery(insertRecQuery, [
                            email,
                            mealType,
                            item.food || '',
                            item.quantity || '',
                            item.calories || 0,
                            item.protein || 0,
                            item.carbs || 0,
                            item.fat || 0,
                            1, // is_recommended = true
                            new Date().toISOString()
                        ]);
                    }
                }
            }
        } catch (error) {
            console.error('Error syncing recommendations:', error);
        }
    }

    async syncFoodLogs() {
        try {
            console.log('Syncing food logs from MongoDB to SQLite...');
            const foodLogs = await FoodLog.find({});
            
            for (const log of foodLogs) {
                if (log.foods && log.foods.length > 0) {
                    for (const food of log.foods) {
                        const insertFoodQuery = `
                            INSERT OR REPLACE INTO food_logs 
                            (user_id, food_name, quantity, meal_type, calories, protein, carbs, fat, 
                             fiber, is_recommended, source, log_date, total_calories, total_protein, 
                             total_carbs, total_fat, total_fiber, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;
                        
                        await this.executeDirectQuery(insertFoodQuery, [
                            log.userId,
                            food.food || '',
                            food.quantity || 0,
                            food.mealType || '',
                            food.calories || 0,
                            food.protein || 0,
                            food.carbs || 0,
                            food.fat || 0,
                            food.fiber || 0,
                            food.isRecommended || false,
                            food.source || '',
                            log.date ? log.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                            log.totalCalories || 0,
                            log.totalProtein || 0,
                            log.totalCarbs || 0,
                            log.totalFat || 0,
                            log.totalFiber || 0,
                            food.timestamp ? food.timestamp.toISOString() : new Date().toISOString()
                        ]);
                    }
                }
            }
            
            console.log(`Synced ${foodLogs.length} food logs`);
            return { success: true, count: foodLogs.length };
        } catch (error) {
            console.error('Error syncing food logs:', error);
            return { success: false, error: error.message };
        }
    }

    async executeDirectQuery(query, params = []) {
        return new Promise((resolve, reject) => {
            this.sqlAgent.db.run(query, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    async syncAll() {
        console.log('Starting full data sync from MongoDB to SQLite...');
        
        const results = {
            users: await this.syncUsers(),
            userInputs: await this.syncUserInputs(),
            foodLogs: await this.syncFoodLogs()
        };

        console.log('Data sync completed!');
        console.log('Results:', results);
        
        return results;
    }

    close() {
        this.sqlAgent.close();
    }
}

module.exports = DataSync;

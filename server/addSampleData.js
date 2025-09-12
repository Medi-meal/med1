const SecureSQLAgent = require('./sqlAgent');

async function addSampleData() {
    console.log('Adding sample data for testing...');
    
    const sqlAgent = new SecureSQLAgent();
    
    // Wait for database initialization
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        // Add sample user
        await sqlAgent.db.run(`
            INSERT OR REPLACE INTO users (name, email, password, created_at) 
            VALUES ('Demo User', 'demo@medimeal.com', 'hashed_password', datetime('now'))
        `);

        // Add sample user input data
        await sqlAgent.db.run(`
            INSERT OR REPLACE INTO user_inputs 
            (email, bmi, age, weight, height, activity_level, dietary_preferences, health_goals, created_at)
            VALUES ('demo@medimeal.com', 22.5, 28, 70, 175, 'moderate', 'balanced', 'weight maintenance', datetime('now'))
        `);

        // Add sample food logs for the past few days
        const foodLogs = [
            ['demo@medimeal.com', 'Oatmeal with Berries', 1, 'breakfast', 300, 12, 45, 8, 6, 1, 'recommended', '2025-09-12'],
            ['demo@medimeal.com', 'Greek Yogurt', 1, 'breakfast', 150, 20, 8, 5, 0, 1, 'recommended', '2025-09-12'],
            ['demo@medimeal.com', 'Grilled Chicken Salad', 1, 'lunch', 450, 35, 15, 25, 5, 1, 'recommended', '2025-09-12'],
            ['demo@medimeal.com', 'Quinoa Bowl', 1, 'lunch', 380, 14, 55, 12, 7, 1, 'recommended', '2025-09-12'],
            ['demo@medimeal.com', 'Salmon with Vegetables', 1, 'dinner', 520, 42, 20, 28, 8, 1, 'recommended', '2025-09-12'],
            ['demo@medimeal.com', 'Brown Rice', 0.5, 'dinner', 110, 2, 22, 1, 2, 1, 'recommended', '2025-09-12'],
            
            // Yesterday's data
            ['demo@medimeal.com', 'Smoothie Bowl', 1, 'breakfast', 280, 8, 35, 12, 8, 1, 'recommended', '2025-09-11'],
            ['demo@medimeal.com', 'Turkey Sandwich', 1, 'lunch', 420, 28, 35, 18, 4, 1, 'recommended', '2025-09-11'],
            ['demo@medimeal.com', 'Vegetable Stir Fry', 1, 'dinner', 380, 15, 45, 18, 6, 1, 'recommended', '2025-09-11'],
            
            // Day before yesterday
            ['demo@medimeal.com', 'Avocado Toast', 1, 'breakfast', 350, 12, 30, 20, 10, 1, 'recommended', '2025-09-10'],
            ['demo@medimeal.com', 'Lentil Soup', 1, 'lunch', 290, 18, 35, 8, 12, 1, 'recommended', '2025-09-10'],
            ['demo@medimeal.com', 'Grilled Fish', 1, 'dinner', 400, 35, 5, 22, 0, 1, 'recommended', '2025-09-10']
        ];

        for (const log of foodLogs) {
            await sqlAgent.db.run(`
                INSERT OR REPLACE INTO food_logs 
                (user_id, food_name, quantity, meal_type, calories, protein, carbs, fat, fiber, is_recommended, source, log_date, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `, log);
        }

        // Add sample recommendations
        const recommendations = [
            ['demo@medimeal.com', 'breakfast', 'Steel Cut Oats', '1 cup', 150, 5, 30, 2],
            ['demo@medimeal.com', 'breakfast', 'Fresh Blueberries', '1/2 cup', 40, 0, 10, 0],
            ['demo@medimeal.com', 'breakfast', 'Almond Milk', '1 cup', 60, 1, 8, 2],
            
            ['demo@medimeal.com', 'lunch', 'Grilled Chicken Breast', '4 oz', 185, 35, 0, 4],
            ['demo@medimeal.com', 'lunch', 'Mixed Green Salad', '2 cups', 20, 2, 4, 0],
            ['demo@medimeal.com', 'lunch', 'Olive Oil Dressing', '1 tbsp', 120, 0, 0, 14],
            
            ['demo@medimeal.com', 'dinner', 'Baked Salmon', '4 oz', 230, 25, 0, 14],
            ['demo@medimeal.com', 'dinner', 'Steamed Broccoli', '1 cup', 30, 3, 6, 0],
            ['demo@medimeal.com', 'dinner', 'Sweet Potato', '1 medium', 100, 2, 24, 0]
        ];

        for (const rec of recommendations) {
            await sqlAgent.db.run(`
                INSERT OR REPLACE INTO recommendations 
                (email, meal_type, food_name, quantity, calories, protein, carbs, fat, is_recommended, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
            `, rec);
        }

        console.log('✅ Sample data added successfully!');
        console.log('📊 Added:');
        console.log('   - 1 demo user');
        console.log('   - 1 user input profile');
        console.log(`   - ${foodLogs.length} food log entries`);
        console.log(`   - ${recommendations.length} meal recommendations`);
        
    } catch (error) {
        console.error('❌ Error adding sample data:', error);
    } finally {
        sqlAgent.close();
    }
}

// Run if this file is executed directly
if (require.main === module) {
    addSampleData().catch(console.error);
}

module.exports = addSampleData;

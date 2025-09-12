const SecureSQLAgent = require('./sqlAgent');

async function testSQLAgent() {
    console.log('='.repeat(60));
    console.log('Testing Secure SQL Agent for Diet App');
    console.log('='.repeat(60));

    const sqlAgent = new SecureSQLAgent();
    
    // Wait a moment for database initialization
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 1: Insert sample user (for testing only)
    console.log('\n1. Setting up test user...');
    try {
        await sqlAgent.db.run(`
            INSERT OR REPLACE INTO users (name, email, password) 
            VALUES ('Test User', 'test@example.com', 'hashed_password')
        `);
        console.log('✅ Test user created');
    } catch (error) {
        console.log('❌ Error creating test user:', error.message);
    }

    // Test 2: User verification
    console.log('\n2. Testing user verification...');
    const userVerification = await sqlAgent.verifyUser('test@example.com');
    console.log('User verification result:', userVerification);

    // Test 3: Test SQL safety checks
    console.log('\n3. Testing SQL safety checks...');
    
    const testQueries = [
        {
            name: 'Valid SELECT query',
            query: 'SELECT name, email FROM users WHERE email = "test@example.com"',
            shouldWork: true
        },
        {
            name: 'Dangerous INSERT attempt',
            query: 'INSERT INTO users (name, email) VALUES ("hacker", "hack@evil.com")',
            shouldWork: false
        },
        {
            name: 'DELETE attempt',
            query: 'DELETE FROM users WHERE email = "test@example.com"',
            shouldWork: false
        },
        {
            name: 'Multiple statements',
            query: 'SELECT * FROM users; DROP TABLE users;',
            shouldWork: false
        },
        {
            name: 'Query without user scope',
            query: 'SELECT * FROM users',
            shouldWork: false // Should be rejected or auto-scoped
        }
    ];

    for (const test of testQueries) {
        console.log(`\nTesting: ${test.name}`);
        console.log(`Query: ${test.query}`);
        
        const result = await sqlAgent.executeQuery(test.query, 'test@example.com');
        
        if (test.shouldWork) {
            if (result.error) {
                console.log(`❌ Expected success but got error: ${result.error}`);
            } else {
                console.log(`✅ Query executed successfully`);
                console.log(`Data:`, result.data);
            }
        } else {
            if (result.error) {
                console.log(`✅ Query properly blocked: ${result.error}`);
            } else {
                console.log(`❌ Dangerous query was allowed! Result:`, result.data);
            }
        }
    }

    // Test 4: Natural language queries
    console.log('\n4. Testing natural language queries...');
    
    // First, add some test food log data
    await sqlAgent.db.run(`
        INSERT OR REPLACE INTO food_logs 
        (user_id, food_name, meal_type, calories, protein, carbs, fat, log_date) 
        VALUES 
        ('test@example.com', 'Chicken Breast', 'lunch', 231, 43.5, 0, 5, date('now')),
        ('test@example.com', 'Brown Rice', 'lunch', 216, 5, 45, 1.8, date('now')),
        ('test@example.com', 'Greek Yogurt', 'breakfast', 100, 17, 6, 0, date('now'))
    `);

    const naturalQueries = [
        'Show my last 3 meals',
        'How many calories did I eat today?',
        'What\'s my profile information?'
    ];

    for (const query of naturalQueries) {
        console.log(`\nNatural query: "${query}"`);
        const result = await sqlAgent.processNaturalQuery(query, 'test@example.com');
        
        if (result.error) {
            console.log(`❌ Error: ${result.error}`);
        } else {
            console.log(`✅ Query executed successfully`);
            console.log(`Generated SQL: ${result.query}`);
            console.log(`Results:`, result.data);
        }
    }

    // Test 5: User scoping enforcement
    console.log('\n5. Testing user scoping enforcement...');
    
    // Try to access another user's data
    const unauthorizedResult = await sqlAgent.executeQuery(
        'SELECT * FROM food_logs WHERE user_id = "another@user.com"', 
        'test@example.com'
    );
    
    if (unauthorizedResult.error) {
        console.log('✅ Cross-user access properly blocked');
    } else {
        console.log('❌ Cross-user access was allowed!', unauthorizedResult.data);
    }

    console.log('\n' + '='.repeat(60));
    console.log('SQL Agent testing completed!');
    console.log('='.repeat(60));

    sqlAgent.close();
}

// Run the test if this file is executed directly
if (require.main === module) {
    testSQLAgent().catch(console.error);
}

module.exports = testSQLAgent;

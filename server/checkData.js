const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'diet_data.db');
const db = new sqlite3.Database(DB_PATH);

console.log('=== Database Content Summary ===\n');

const tables = ['users', 'user_inputs', 'food_logs', 'recommendations'];

let completed = 0;

tables.forEach(table => {
    db.get(`SELECT COUNT(*) as count FROM ${table};`, (err, row) => {
        if (err) {
            console.error(`Error counting ${table}:`, err);
        } else {
            console.log(`📊 ${table}: ${row.count} records`);
        }
        
        completed++;
        if (completed === tables.length) {
            console.log('\n=== Sample Data ===');
            
            // Show sample data from tables that have records
            let sampleCompleted = 0;
            
            tables.forEach(table => {
                db.get(`SELECT COUNT(*) as count FROM ${table};`, (err, countRow) => {
                    if (countRow && countRow.count > 0) {
                        db.all(`SELECT * FROM ${table} LIMIT 3;`, (err, rows) => {
                            if (!err && rows.length > 0) {
                                console.log(`\n🔎 Sample from ${table}:`);
                                rows.forEach((row, index) => {
                                    console.log(`  Row ${index + 1}:`, JSON.stringify(row, null, 2));
                                });
                            }
                            
                            sampleCompleted++;
                            if (sampleCompleted === tables.length) {
                                db.close();
                            }
                        });
                    } else {
                        sampleCompleted++;
                        if (sampleCompleted === tables.length) {
                            db.close();
                        }
                    }
                });
            });
        }
    });
});
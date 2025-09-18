const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'diet_data.db');
const db = new sqlite3.Database(DB_PATH);

console.log('=== SQLite Database Tables ===');

// Get all tables
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';", (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('\nTables found:');
        rows.forEach(row => {
            console.log(`📋 ${row.name}`);
        });
        
        // Get table details for each table
        let completed = 0;
        const total = rows.length;
        
        if (total === 0) {
            console.log('No tables found');
            db.close();
            return;
        }
        
        rows.forEach(row => {
            db.all(`PRAGMA table_info(${row.name});`, (err, columns) => {
                if (err) {
                    console.error(`Error getting info for ${row.name}:`, err);
                } else {
                    console.log(`\n🔍 Table: ${row.name}`);
                    console.log('Columns:');
                    columns.forEach(col => {
                        console.log(`  - ${col.name} (${col.type})`);
                    });
                }
                
                completed++;
                if (completed === total) {
                    db.close();
                }
            });
        });
    }
});
const Datastore = require('nedb');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'dist', 'database.db');

// Check if the database file exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '');
}

let db = new Datastore({ filename: dbPath, autoload: true });

db.loadDatabase((err) => {
  if (err) {
    console.error('Error loading database:', err);
  } else {
    console.log('Database initialized successfully.');
  }
});

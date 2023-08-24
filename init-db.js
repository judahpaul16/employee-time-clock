const Datastore = require('nedb');
const path = require('path');
const fs = require('fs');

let dirPath = path.join(__dirname, 'dist');
let dbPath = path.join(__dirname, 'dist', 'database.db');

// Check if the database file exists
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

let db = new Datastore({ filename: dbPath, autoload: true });

module.exports = db;
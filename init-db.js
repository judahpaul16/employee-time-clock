const Datastore = require('nedb');
const path = require('path');
const fs = require('fs');

let dirPath = path.join(__dirname, 'dist');
let usersPath = path.join(dirPath, 'users.db');
let recordsPath = path.join(dirPath, 'records.db');

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

const usersDB = new Datastore({ filename: usersPath, autoload: true });
const recordsDB = new Datastore({ filename: recordsPath, autoload: true });

module.exports = {
  usersDB,
  recordsDB
};
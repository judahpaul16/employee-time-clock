const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
const corsOptions = {
    origin: 'http://localhost:8081', // only allow this origin
    optionsSuccessStatus: 204,
  };
  
  app.use(cors(corsOptions));
  
const port = 3001;

app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to the SQLite database.');
});

db.run(`CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY,
    pin TEXT NOT NULL,
    action TEXT NOT NULL,
    time TEXT NOT NULL
  )`, (err) => {
    if (err) return console.log(err);
    console.log('Table created or already exists.');
});

// Endpoint to get records
app.get('/records', (req, res) => {
  db.all('SELECT * FROM records', [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// Endpoint to add record
app.post('/record', (req, res) => {
  const { pin, action, time } = req.body;
  db.run('INSERT INTO records (pin, action, time) VALUES (?, ?, ?)', [pin, action, time], (err) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ message: 'Record added.' });
  });
});

// Starting the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
const corsOptions = {
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
    name TEXT NOT NULL DEFAULT 'Unknown',
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

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Endpoint to add record
app.post('/record', (req, res) => {
    const { pin, action, time } = req.body;

    // Get the name associated with the PIN
    db.get('SELECT name FROM records WHERE pin = ?', [pin], (err, row) => {
        if (err) return res.status(500).send(err);

        const name = row ? row.name : 'Unknown';

        // Insert the new record
        db.run('INSERT INTO records (name, pin, action, time) VALUES (?, ?, ?, ?)', [name, pin, action, time], function(err) {
            if (err) return res.status(500).send(err);

            // Return the new record ID and name
            res.status(201).json({ id: this.lastID, name });
        });
    });
});

if (process.env.NODE_ENV === 'production') {
    // Export the app for production (e.g., when using Phusion Passenger)
    module.exports = app;
  } else {
    // Start the server for local development and testing
    const port = 3001;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
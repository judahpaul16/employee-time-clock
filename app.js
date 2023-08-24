const express = require('express');
const Datastore = require('nedb');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Create the Express app
const app = express();
app.use(cors());
const corsOptions = {optionsSuccessStatus: 204};
app.use(cors(corsOptions));
const port = 3001;
app.use(bodyParser.json());

const dbPath = path.join(__dirname, 'dist', 'database.db');
if (process.env.NODE_ENV === 'development') {
    const db = new Datastore({ filename: dbPath, autoload: true });
}

// Route to get records
app.get('/get-records', (req, res) => {
    db.find({}, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.use(express.static(path.join(__dirname, 'dist')));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Route to add record
app.post('/add-record', (req, res) => {
    const { pin, action, time } = req.body;
  
    // Find the name associated with the PIN
    db.findOne({ pin }, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
    
        const name = row ? row.name : 'Unknown';
    
        // Insert the new record
        db.insert({ name, pin, action, time }, (err, newRecord) => {
            if (err) return res.status(500).json({ error: err.message });
    
            // Return the new record ID and name
            res.status(201).json({ id: newRecord._id, name });
        });
    });
});  

if (process.env.NODE_ENV === 'production') {
    // Export the app for production (e.g., when using Phusion Passenger)
    module.exports = app;
    module.exports.db = db;
} else {
    // Start the server for local development and testing
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
}
const express = require('express');
const Datastore = require('nedb');
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

// Create the database
const db = new Datastore({ filename: './dist/database.db', autoload: true });

// Endpoint to get records
app.get('/get-records', (req, res) => {
    db.find({}, (err, rows) => {
      if (err) return res.status(500).send(err);
      res.json(rows);
    });
});  

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Endpoint to add record
app.post('/add-record', (req, res) => {
    const { pin, action, time } = req.body;
  
    // Find the name associated with the PIN
    db.findOne({ pin }, (err, row) => {
      if (err) return res.status(500).send(err);
  
      const name = row ? row.name : 'Unknown';
  
      // Insert the new record
      db.insert({ name, pin, action, time }, (err, newRecord) => {
        if (err) return res.status(500).send(err);
  
        // Return the new record ID and name
        res.status(201).json({ id: newRecord._id, name });
      });
    });
});  

if (process.env.NODE_ENV === 'production') {
    // Export the app for production (e.g., when using Phusion Passenger)
    module.exports = app;
} else {
    // Start the server for local development and testing
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
}
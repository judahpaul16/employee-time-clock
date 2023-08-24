const express = require('express');
const Datastore = require('nedb');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { usersDB, recordsDB } = require('./init-db.js');
const path = require('path');
const cors = require('cors');
const session = require('express-session');

// Secret key for session, randomly generated
let SECRET_KEY = crypto.randomBytes(32).toString('hex');

// Create the Express app
const app = express();
app.use(cors());
const corsOptions = {optionsSuccessStatus: 204};
app.use(cors(corsOptions));
const port = 3001;
app.use(bodyParser.json());

// Use session middleware
app.use(session({
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // Ensures the cookie is sent as HttpOnly
    secure: true,  // Set to true if you are using HTTPS
  }
}));

const requireAdmin = (req, res, next) => {
  if (!req.session || req.session.admin !== true) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
};

// Route to get records by PIN
app.get('/get-records', (req, res) => {
    recordsDB.find({}, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
  
  // Route to get all users
  app.get('/get-users', (req, res) => {
    usersDB.find({}, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
  
  // Route to get user records by user ID
  app.get('/get-user-records', (req, res) => {
    const { id } = req.query;
    usersDB.findOne({ _id: id }, (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      recordsDB.find({ pin: user.pin }, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      });
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
    
    // Check if a user with the provided PIN exists
    usersDB.findOne({ pin }, (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (!user) return res.status(400).json({ error: 'No user with this PIN' });
  
      // Find the name associated with the PIN
      const name = user.name;
      // Insert the new record
      recordsDB.insert({ name, pin, action, time }, (err, newRecord) => {
        if (err) return res.status(500).json({ error: err.message });
  
        // Return the new record ID and name
        res.status(201).json({ id: newRecord._id, name });
      });
    });
});  

// Route to login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Find the user in the database
    usersDB.findOne({ username }, (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        // Verify password
        if (!user) return res.status(401).json({ error: 'No user with those credentials' });
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ error: 'Invalid credentials' });
        
        // Set admin flag in session
        req.session.admin = true;
    
        res.json({ success: true });
    });
});
  
// Route to logout
app.post('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Route to check if user is logged in
app.get('/is-logged-in', (req, res) => {
    res.json({ isLoggedIn: !!req.session.admin });
});

// Route to add user
app.post('/add-user', (req, res) => {
    const { username, password } = req.body;
    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 8);
    // Generate a login token
    const loginToken = crypto.randomBytes(16).toString('hex');
    // Insert the new user
    usersDB.insert({ username, password: hashedPassword, loginToken: loginToken }, (err, newUser) => {
        if (err) return res.status(500).json({ error: err.message });
        // Return the new user ID and login token
        res.status(201).json({ id: newUser._id, token: loginToken });
    });
});

if (process.env.NODE_ENV === 'production') {
    // Export the app for production (e.g., when using Phusion Passenger)
    module.exports = app;
    module.exports.db = {
        usersDB,
        recordsDB
    };
} else {
    // Start the server for local development and testing
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

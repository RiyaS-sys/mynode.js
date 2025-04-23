const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'yourpassword',
    database: process.env.DB_NAME || 'yourdbname'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1); // Exit if there is a connection error, but not during tests
        }
    }
    console.log('Connected to the MySQL database');
});

// Set up session store
const sessionStore = new MySQLStore({}, db);

app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 60 * 1000 // Set cookie expiration time (30 minutes)
    }
}));

// Route to handle blood requests
app.post('/request-blood', (req, res) => {
    const { blood_type, units, hospital_name } = req.body;

    if (!blood_type || !units || !hospital_name) {
        return res.status(400).send('Missing required fields: blood_type, units, or hospital_name.');
    }

    const query = 'INSERT INTO blood_requests (blood_type, units, hospital_name) VALUES (?, ?, ?)';
    db.query(query, [blood_type, units, hospital_name], (error, results) => {
        if (error) {
            console.error("Error inserting blood request:", error);
            return res.status(500).send('An error occurred while inserting blood request.');
        }
        res.send('Blood request submitted successfully!');
    });
});

// Rest of your routes remain the same...

// Only start the server if this file is run directly
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}

// Export the app for testing
module.exports = app;
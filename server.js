const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST, // now "db"
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1); // Exit if there is a connection error
    }
    console.log('Connected to the MySQL database');
});

// Set up session store
const sessionStore = new MySQLStore({}, db);

app.use(session({
    key: 'session_cookie_name',
    secret: 'your_secret_key', // Change this to a secure key
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

// Route to handle donor registration
app.post('/submit-form', (req, res) => {
    const { donor_name, blood_type, gender, age, contact, city } = req.body;

    if (!donor_name || !blood_type || !gender || !age || !contact || !city) {
        return res.status(400).send('Missing required donor fields.');
    }

    const query = 'INSERT INTO donors (name, blood_type, gender, age, contact, city) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [donor_name, blood_type, gender, age, contact, city], (err, result) => {
        if (err) {
            console.error('Error inserting donor data:', err);
            return res.status(500).send('Error inserting donor data.');
        }
        res.send('Donor registration successful!');
    });
});

// Route to handle admin login
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    const hardcodedUsername = 'admin';
    const hardcodedHashedPassword = '$2b$10$CAg/oyFXW3x5EosW3xhhEeH7eQgYcTgor/GPCNWbReyDSK7tqpEjW'; // Hashed password

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username === hardcodedUsername) {
        const isPasswordValid = bcrypt.compareSync(password, hardcodedHashedPassword);
        if (isPasswordValid) {
            req.session.user = { username }; // Store user data in session
            return res.json({ success: true, message: 'Login successful', redirectUrl: '/inventory.html' });
        } else {
            return res.status(401).json({ error: 'Invalid password' });
        }
    } else {
        return res.status(401).json({ error: 'User not found' });
    }
});

// Route to get all donor data
app.get('/donors', (req, res) => {
    const query = 'SELECT * FROM donors';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching donor data:', err);
            return res.status(500).send('Error fetching donor data.');
        }
        res.json(results);
    });
});

// Route to get all blood requests
app.get('/blood-requests', (req, res) => {
    const query = 'SELECT * FROM blood_requests';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching blood requests:', err);
            return res.status(500).send('Error fetching blood requests.');
        }
        res.json(results);
    });
});

// Route to update blood request status
app.post('/update-blood-request', (req, res) => {
    const { requestId, status } = req.body;
    console.log('Received request to update ID:', requestId, 'with status:', status); // Log received data

    // Database query to update the blood request
    const query = 'UPDATE blood_requests SET status = ? WHERE id = ?';
    db.query(query, [status, requestId], (error, results) => {
        if (error) {
            console.error('Error updating blood request:', error); // Log error
            return res.status(500).json({ error: 'Failed to update request' }); // Send error response
        }
        
        // Check if any rows were affected
        if (results.affectedRows === 0) {
            console.warn('No rows updated. Request ID might not exist:', requestId);
            return res.status(404).json({ error: 'Request ID not found' }); // Handle case where no rows are updated
        }

        console.log('Successfully updated request:', results);
        res.status(200).json({ message: 'Request updated successfully' }); // Send success response
    });
});

// Route to update donor contacted status
app.post('/update-donor-contacted', (req, res) => {
    const { donorId } = req.body;

    // Log the received donorId for verification
    console.log('Received donorId for update:', donorId);

    // Check if donorId is present in the request
    if (!donorId) {
        console.error('No donorId provided in the request.');
        return res.status(400).send('Invalid request. donorId is required.');
    }

    // Check if the donorId exists in the database
    const selectQuery = 'SELECT * FROM donors WHERE id = ?';
    db.query(selectQuery, [donorId], (selectError, selectResults) => {
        if (selectError) {
            console.error('Error fetching donor data:', selectError);
            return res.status(500).send('Error fetching donor data.');
        }

        if (selectResults.length === 0) {
            console.error(`No donor found with ID ${donorId}`);
            return res.status(404).send('No donor found with the provided ID.');
        }

        // Proceed to update the donor contacted status
        const updateQuery = 'UPDATE donors SET contacted = TRUE WHERE id = ?';
        db.query(updateQuery, [donorId], (updateError, updateResults) => {
            if (updateError) {
                console.error('Error updating donor contacted status:', updateError);
                return res.status(500).send('An error occurred while updating the donor status.');
            }

            console.log('Donor contacted status updated successfully for ID:', donorId);
            res.send('Donor status updated successfully!');
        });
    });
});
// Route to get current inventory
app.get('/get-inventory', (req, res) => {
    const query = 'SELECT blood_type, units FROM inventory'; // Adjust based on your actual table structure
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching inventory:', err);
            return res.status(500).send('Error fetching inventory.');
        }
        const inventoryData = {};
        results.forEach(item => {
            inventoryData[item.blood_type] = item.units; // Adjust according to your table structure
        });
        res.json(inventoryData);
    });
});

// Route to update inventory
app.post('/update-inventory', (req, res) => {
    const { bloodType, units } = req.body;

    const query = 'UPDATE inventory SET units = ? WHERE blood_type = ?'; // Adjust based on your actual table structure
    db.query(query, [units, bloodType], (err, results) => {
        if (err) {
            console.error('Error updating inventory:', err);
            return res.status(500).send('Error updating inventory.');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Blood type not found.');
        }
        res.send('Inventory updated successfully!');
    });
});
// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

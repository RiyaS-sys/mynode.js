const bcrypt = require('bcrypt'); // Import bcrypt

const password = 'admin123'; // The plain-text password you want to hash
const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password with a salt factor of 10

console.log(`Hashed Password: ${hashedPassword}`); // Output the hashed password




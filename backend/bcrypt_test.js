const bcrypt = require('bcryptjs');

// The password you want to hash
const password = 'jnana@123';

// Generate a new hash
bcrypt.genSalt(10, (err, salt) => {
    if (err) {
        console.error('Error generating salt:', err);
        return;
    }

    bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return;
        }

        console.log('Generated bcrypt hash:', hash);

        // Simulate comparing the hashed password with the original password
        const hashedPasswordFromDB = hash;  // Simulate storing hash in DB

        bcrypt.compare(password, hashedPasswordFromDB, (err, result) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return;
            }

            console.log('Password match:', result);  // Should be true if passwords match
        });
    });
});

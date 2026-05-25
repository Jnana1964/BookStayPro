const bcrypt = require('bcrypt');

const password = 'jnana@123';
const hash = '$2b$10$tIEmG8kTO/SkPx9EO3tXcuKHZDAqO2AzY01ZTt3x0Z0z8TDD2Z6LS'
bcrypt.compare(password, hash, function(err, result) {
  console.log('Password match?', result); // should be true
});

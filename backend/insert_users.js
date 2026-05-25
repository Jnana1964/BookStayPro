const db = require('./db');
const bcrypt = require('bcrypt');

async function insertUsers() {
  const hashedAdmin = await bcrypt.hash('admin123', 10);
  const hashedUser = await bcrypt.hash('user123', 10);

  const query = `
    INSERT INTO users (name, email, password, isAdmin) VALUES
    ('Admin', 'admin@example.com', ?, true),
    ('Jnana', 'user@example.com', ?, false)
  `;

  db.query(query, [hashedAdmin, hashedUser], (err) => {
    if (err) throw err;
    console.log('Users inserted successfully.');
  });
}

insertUsers();

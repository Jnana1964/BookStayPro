const express = require('express');
const pool = require('../config/db');
const { isAuthenticated, isAdmin } = require('../middleware');

const router = express.Router();

// Get all hotels
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM hotels');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotels' });
  }
});

// Add new hotel (admin only)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  const { name, location, pricePerNight, imageUrl } = req.body;

  try {
    const [rows] = await pool.execute(
      'INSERT INTO hotels (name, location, pricePerNight, imageUrl) VALUES (?, ?, ?, ?)', 
      [name, location, pricePerNight, imageUrl]
    );
    res.status(201).json({ message: 'Hotel added' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding hotel' });
  }
});

module.exports = router;

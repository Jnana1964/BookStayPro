const express = require('express');
const pool = require('../db');
const { isAuthenticated } = require('../middleware');

const router = express.Router();

// Get all bookings for a logged-in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM bookings WHERE userId = ?', 
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Create a new booking
router.post('/', isAuthenticated, async (req, res) => {
  const { hotelId, checkIn, checkOut } = req.body;

  if (!hotelId || !checkIn || !checkOut) {
    return res.status(400).json({ message: 'Missing booking details' });
  }

  try {
    await pool.execute(
      'INSERT INTO bookings (userId, hotelId, checkInDate, checkOutDate) VALUES (?, ?, ?, ?)',
      [req.user.id, hotelId, checkIn, checkOut]
    );
    res.status(201).json({ message: 'Booking created successfully' });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

module.exports = router;

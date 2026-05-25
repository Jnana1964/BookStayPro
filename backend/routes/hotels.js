const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// Get all hotels
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM hotels");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching hotels:", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

// Add new hotel
router.post("/", async (req, res) => {
  const { name, address, city, image_url, description, rating, price } = req.body;

  try {
    await pool.execute(
      `INSERT INTO hotels 
      (name, address, city, image_url, description, rating, price) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, address, city, image_url, description, rating, price]
    );

    res.status(201).json({ message: "Hotel added successfully" });
  } catch (error) {
    console.error("Error adding hotel:", error);
    res.status(500).json({ message: "Error adding hotel" });
  }
});

module.exports = router;
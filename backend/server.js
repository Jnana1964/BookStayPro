const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const JWT_SECRET = "bookstaypro_secret_key";

app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bookstaypro",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

// Home route
app.get("/", (req, res) => {
  res.send("BookStayPro API running 🚀");
});

// Register route
app.post("/register", async (req, res) => {
  const { name, email, password, is_admin } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, email, hashedPassword, is_admin || 0], (err) => {
      if (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Registration failed" });
      }

      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("Login DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_admin: user.is_admin,
      },
    });
  });
});

// Get all hotels
app.get("/api/hotels", (req, res) => {
  db.query("SELECT * FROM hotels", (err, results) => {
    if (err) {
      console.error("Hotel fetch error:", err);
      return res.status(500).json({ message: "Error fetching hotels" });
    }

    res.json(results);
  });
});

// Add hotel
app.post("/api/hotels", (req, res) => {
  const { name, address, city, image_url, description, rating, price } = req.body;

  const sql = `
    INSERT INTO hotels (name, address, city, image_url, description, rating, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, address, city, image_url, description, rating, price],
    (err) => {
      if (err) {
        console.error("Hotel creation error:", err);
        return res.status(500).json({ message: "Hotel creation failed" });
      }

      res.status(201).json({ message: "Hotel added successfully" });
    }
  );
});

// Get all bookings with hotel and user details
app.get("/api/bookings", (req, res) => {
  const sql = `
    SELECT 
      bookings.id,
      bookings.check_in,
      bookings.check_out,
      bookings.status,
      users.name AS user_name,
      users.email AS user_email,
      hotels.name AS hotel_name,
      hotels.city,
      hotels.price
    FROM bookings
    LEFT JOIN users ON bookings.user_id = users.id
    LEFT JOIN hotels ON bookings.hotel_id = hotels.id
    ORDER BY bookings.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Booking fetch error:", err);
      return res.status(500).json({ message: "Error fetching bookings" });
    }

    res.json(results);
  });
});

// Create booking
app.post("/api/bookings", (req, res) => {
  const { user_id, hotel_id, check_in, check_out } = req.body;

  if (!user_id || !hotel_id || !check_in || !check_out) {
    return res.status(400).json({ message: "All booking fields are required" });
  }

  const sql = `
    INSERT INTO bookings (user_id, hotel_id, check_in, check_out, status)
    VALUES (?, ?, ?, ?, 'confirmed')
  `;

  db.query(sql, [user_id, hotel_id, check_in, check_out], (err) => {
    if (err) {
      console.error("Booking creation error:", err);
      return res.status(500).json({ message: "Booking failed" });
    }

    res.status(201).json({ message: "Booking successful" });
  });
});

// Cancel booking
app.delete("/api/bookings/:id", (req, res) => {
  const bookingId = req.params.id;

  db.query(
    "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
    [bookingId],
    (err) => {
      if (err) {
        console.error("Cancel booking error:", err);
        return res.status(500).json({ message: "Cancel failed" });
      }

      res.status(200).json({ message: "Booking cancelled successfully" });
    }
  );
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
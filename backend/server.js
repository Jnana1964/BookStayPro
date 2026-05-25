const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const JWT_SECRET = "your_jwt_secret_key"; // use a secure key in production

app.use(cors());
app.use(express.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // No password per your info
  database: "bookstaypro",
});

// ✅ Test MySQL connection
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});
// ✅ Home route (paste this)
app.get('/', (req, res) => {
  res.send("BookStayPro API running 🚀");
});

// ✅ Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(401).json({ message: "Invalid email" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token, role: user.role });
  });
});

// ✅ Get all hotels (for home page or filters)
app.get("/hotels", (req, res) => {
  db.query("SELECT * FROM hotels", (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching hotels" });
    res.json(results);
  });
});

// ✅ Create a hotel (for admin)
app.post("/hotels", (req, res) => {
  const { name, location, price, image_url, description, rating } = req.body;

  db.query(
    "INSERT INTO hotels (name, location, price, image_url, description, rating) VALUES (?, ?, ?, ?, ?, ?)",
    [name, location, price, image_url, description, rating],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Hotel creation failed" });
      res.status(201).json({ message: "Hotel added successfully" });
    }
  );
});

// ✅ Get all bookings (for admin/user dashboard)
app.get("/bookings", (req, res) => {
  db.query("SELECT * FROM bookings", (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching bookings" });
    res.json(results);
  });
});

// ✅ Create a new booking
app.post("/bookings", (req, res) => {
  const { hotel_id, user_email, user_name, check_in_date, check_out_date } = req.body;

  db.query(
    "INSERT INTO bookings (hotel_id, user_email, user_name, check_in_date, check_out_date) VALUES (?, ?, ?, ?, ?)",
    [hotel_id, user_email, user_name, check_in_date, check_out_date],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Booking failed" });
      res.status(201).json({ message: "Booking successful" });
    }
  );
});

// ✅ Cancel booking by ID
app.delete("/bookings/:id", (req, res) => {
  const bookingId = req.params.id;

  db.query("DELETE FROM bookings WHERE id = ?", [bookingId], (err, result) => {
    if (err) return res.status(500).json({ message: "Cancel failed" });
    res.status(200).json({ message: "Booking cancelled" });
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

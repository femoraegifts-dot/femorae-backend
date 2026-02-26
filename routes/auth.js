const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * SCHOOL LOGIN (PostgreSQL Version)
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password required",
      });
    }

    // PostgreSQL uses $1 instead of ?
    const result = await db.query(
      "SELECT id, name, username, password FROM schools WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const school = result.rows[0];

    // Plain text check (we secure later)
    if (school.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      message: "Login successful",
      school: {
        id: school.id,
        name: school.name,
        username: school.username,
      },
    });

  } catch (err) {
    console.error("AUTH LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
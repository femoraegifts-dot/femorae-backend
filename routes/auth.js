const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * SCHOOL LOGIN
 * POST /auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password required",
      });
    }

    const [rows] = await db.query(
      "SELECT id, name, username, password FROM schools WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const school = rows[0];

    // ⚠️ plain text check (OK for now, hash later)
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

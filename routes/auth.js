const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

/**
 * LOGIN API
 * POST /login
 * body: { username, password }
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const sql = "SELECT * FROM users WHERE username = ? AND active = 1";

  db.query(sql, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Login success
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        class: user.class,
        division: user.division,
        role: user.role,
      },
    });
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * Safe query with retry once
 */
async function safeQuery(sql, params) {
  try {
    return await db.query(sql, params);
  } catch (err) {
    console.log("⚠️ First DB query failed, retrying once...");
    return await db.query(sql, params);
  }
}

/**
 * SCHOOL LOGIN
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password required",
      });
    }

    const result = await safeQuery(
      "SELECT id, name, username, password FROM schools WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const school = result.rows[0];

    if (school.password !== password) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
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
    return res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * GET all classes with divisions and counts
 * Used for section selection screen
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        class,
        division,
        COUNT(*) AS total,
        SUM(photo_status='completed') AS completed
      FROM students
      GROUP BY class, division
      ORDER BY class, division
    `);

    res.json(rows);
  } catch (err) {
    console.error("Sections error:", err);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
});

module.exports = router;

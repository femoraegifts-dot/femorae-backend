const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/summary", (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS total_students,
      SUM(photo_status = 'completed') AS completed,
      SUM(photo_status != 'completed') AS pending
    FROM students
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(result[0]);
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * =====================================================
 * GET /dashboard/summary?school_id=1
 * =====================================================
 */
router.get("/summary", async (req, res) => {
  const { school_id } = req.query;

  if (!school_id) {
    return res.status(400).json({ error: "school_id required" });
  }

  try {
    const { rows } = await db.query(
      `
      SELECT
        COUNT(*) AS total_students,
        SUM(CASE WHEN approved_status = 'approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN approved_status <> 'approved' OR approved_status IS NULL THEN 1 ELSE 0 END) AS pending
      FROM students
      WHERE school_id = $1
        AND deleted_status = 0
      `,
      [school_id]
    );

    const row = rows[0];

    res.json({
      total_students: Number(row.total_students) || 0,
      approved: Number(row.approved) || 0,
      pending: Number(row.pending) || 0,
    });

  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.status(500).json({ error: "Dashboard failed" });
  }
});

module.exports = router;
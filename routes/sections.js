const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * GET classes & divisions by school
 * Used by:
 *  - ClassSelectionScreen
 *  - SectionSelectionScreen
 *
 * GET /classes/by-school/:schoolId
 */
router.get("/by-school/:schoolId", async (req, res) => {
  const { schoolId } = req.params;

  try {
    const result = await db.query(
  `
  SELECT
    s.class_id,
    c.class_name,
    s.division_id,
    d.division_name,
    COUNT(*) AS total,
    SUM(CASE WHEN s.photo_status = 'completed' THEN 1 ELSE 0 END) AS completed
  FROM students s
  JOIN classes c ON c.id = s.class_id
  JOIN divisions d ON d.id = s.division_id
  WHERE s.school_id = $1
    AND s.deleted_status = false
  GROUP BY s.class_id, c.class_name, s.division_id, d.division_name
  ORDER BY c.class_name, d.division_name
  `,
  [schoolId]
);

res.json(result.rows);
  } catch (err) {
    console.error("❌ CLASS / SECTION API ERROR:", err);
    res.status(500).json({ error: "Failed to load classes & sections" });
  }
});

module.exports = router;

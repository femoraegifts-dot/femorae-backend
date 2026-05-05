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
    c.id AS class_id,
    c.class_name,
    d.id AS division_id,
    d.division_name,

    COUNT(s.id) AS total,

    SUM(
      CASE
        WHEN s.photo_status = 'completed'
        THEN 1
        ELSE 0
      END
    ) AS completed

  FROM classes c

  JOIN divisions d
    ON d.class_id = c.id

  LEFT JOIN students s
    ON s.class_id = c.id
   AND s.division_id = d.id
   AND s.school_id = $1
   AND s.deleted_at IS NULL

  WHERE c.school_id = $1

  GROUP BY
    c.id,
    c.class_name,
    d.id,
    d.division_name

  ORDER BY
    c.class_name,
    d.division_name
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

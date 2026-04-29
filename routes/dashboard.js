// routes/dashboard.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* =====================================================
   GET /dashboard/summary?school_id=1
===================================================== */
router.get("/summary", async (req, res) => {
  const { school_id } = req.query;

  if (!school_id) {
    return res.status(400).json({
      error: "school_id required",
    });
  }

  try {
    const { rows } = await db.query(
      `
      SELECT
        COUNT(*) AS total_students,

        SUM(
          CASE
            WHEN approved_status = 'approved'
            THEN 1
            ELSE 0
          END
        ) AS approved,

        SUM(
          CASE
            WHEN approved_status IS NULL
              OR approved_status <> 'approved'
            THEN 1
            ELSE 0
          END
        ) AS pending

      FROM students
      WHERE school_id = $1
        AND deleted_at IS NULL
      `,
      [school_id]
    );

    const row = rows[0];

    return res.json({
      total_students:
          Number(
            row.total_students,
          ) ||
          0,
      approved:
          Number(
            row.approved,
          ) ||
          0,
      pending:
          Number(
            row.pending,
          ) ||
          0,
    });
  } catch (err) {
    console.error(
      "DASHBOARD SUMMARY ERROR:",
      err
    );

    return res.status(500).json({
      error:
          "Dashboard failed",
    });
  }
});

/* =====================================================
   GET /dashboard/classwise
   ?school_id=1&type=total

   type:
   total
   approved
   pending
===================================================== */
router.get(
  "/classwise",
  async (req, res) => {
    const {
      school_id,
      type,
    } = req.query;

    if (!school_id) {
      return res.status(400).json({
        error:
            "school_id required",
      });
    }

    const reportType =
        (
          type ||
          "total"
        ).toLowerCase();

    let condition = "";

    if (
      reportType ===
      "approved"
    ) {
      condition =
          "AND st.approved_status = 'approved'";
    }

    if (
      reportType ===
      "pending"
    ) {
      condition = `
        AND (
          st.approved_status IS NULL
          OR st.approved_status <> 'approved'
        )
      `;
    }

    try {
      const { rows } =
          await db.query(
        `
        SELECT
          c.class_name,
          d.division_name,
          COUNT(*) AS total

        FROM students st

        LEFT JOIN classes c
          ON c.id = st.class_id

        LEFT JOIN divisions d
          ON d.id = st.division_id

        WHERE st.school_id = $1
          AND st.deleted_at IS NULL
          ${condition}

        GROUP BY
          c.class_name,
          d.division_name

        ORDER BY
          c.class_name,
          d.division_name
        `,
        [school_id]
      );

      return res.json(
        rows.map((r) => ({
          class_name:
              r.class_name,
          division_name:
              r.division_name,
          total:
              Number(
                r.total,
              ) ||
              0,
        }))
      );
    } catch (err) {
      console.error(
        "CLASSWISE REPORT ERROR:",
        err
      );

      return res.status(500).json({
        error:
            "Failed to load classwise report",
      });
    }
  }
);

module.exports = router;
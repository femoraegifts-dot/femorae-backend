console.log("✅ STUDENTS ROUTE FILE LOADED");

const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* =====================================================
   GET STUDENT LIST
===================================================== */
router.get("/", async (req, res) => {
  try {
    const { school_id, class_id, division_id } = req.query;

    if (!school_id || !class_id || !division_id) {
      return res.status(400).json({
        error: "school_id, class_id, division_id required",
      });
    }

    const result = await db.query(
      `
      SELECT
        st.id,
        st.photo_status,
        st.photo_drive_id,
        st.approved_status,
        MAX(CASE WHEN sf.field_key = 'student_id' THEN sf.field_value END) AS student_id,
        MAX(CASE WHEN sf.field_key = 'name' THEN sf.field_value END) AS name
      FROM students st
      LEFT JOIN student_field_values sf
        ON sf.student_id = st.id
      WHERE st.school_id = $1
        AND st.class_id = $2
        AND st.division_id = $3
        AND COALESCE(st.deleted_status, false) = false
      GROUP BY st.id
      ORDER BY
        MAX(CASE WHEN sf.field_key = 'student_id' THEN sf.field_value END)
      `,
      [school_id, class_id, division_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("STUDENT LIST ERROR:", err);
    res.status(500).json({ error: "Failed to load students" });
  }
});


/* =====================================================
   STUDENT VIEW (FULL DATA)
===================================================== */
router.get("/view/:id", async (req, res) => {
  try {
    const studentRes = await db.query(
      `
      SELECT
        st.id,
        st.photo_status,
        st.photo_drive_id,
        st.approved_status,
        st.approved_at
      FROM students st
      WHERE st.id = $1
      `,
      [req.params.id]
    );

    if (studentRes.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const fieldsRes = await db.query(
      `
      SELECT field_key, field_value
      FROM student_field_values
      WHERE student_id = $1
      `,
      [req.params.id]
    );

    const fields = {};
    fieldsRes.rows.forEach(row => {
      fields[row.field_key] = row.field_value;
    });

    res.json({
      ...studentRes.rows[0],
      fields: fields
    });

  } catch (err) {
    console.error("STUDENT VIEW ERROR:", err);
    res.status(500).json({ error: "Failed to load student" });
  }
});


/* =====================================================
   APPROVE STUDENT
===================================================== */
router.post("/:id/approve", async (req, res) => {
  try {
    const result = await db.query(
      `
      UPDATE students
      SET approved_status = 'approved',
          approved_at = NOW()
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("APPROVAL ERROR:", err);
    res.status(500).json({ error: "Approval failed" });
  }
});

module.exports = router;
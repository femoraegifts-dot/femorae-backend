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
        v_id.field_value AS student_id,
        v_name.field_value AS name,
        st.photo_status,
        st.approved_status,
        st.photo_drive_id
      FROM students st
      LEFT JOIN student_field_values v_id
        ON v_id.student_id = st.id
        AND v_id.field_key = 'student_id'
      LEFT JOIN student_field_values v_name
        ON v_name.student_id = st.id
        AND v_name.field_key = 'name'
      WHERE st.school_id = $1
        AND st.class_id = $2
        AND st.division_id = $3
        AND COALESCE(st.deleted_status, false) = false
      ORDER BY v_id.field_value::int
      `,
      [school_id, class_id, division_id]
    );

    console.log("STUDENTS RETURNED:", result.rows.length);
    res.json(result.rows);

  } catch (err) {
    console.error("STUDENT LIST ERROR:", err);
    res.status(500).json({ error: "Failed to load students" });
  }
});

/* =====================================================
   STUDENT VIEW (FIXED)
===================================================== */
router.get("/view/:id", async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        st.id,
        st.school_id,
        st.class_id,
        st.division_id,
        st.photo_status,
        st.approved_at,
        st.approved_status,
        st.photo_drive_id,
        v_id.field_value AS student_id,
        v_name.field_value AS name
      FROM students st
      LEFT JOIN student_field_values v_id
        ON v_id.student_id = st.id
        AND v_id.field_key = 'student_id'
      LEFT JOIN student_field_values v_name
        ON v_name.student_id = st.id
        AND v_name.field_key = 'name'
      WHERE st.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      student: result.rows[0]
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
  const id = req.params.id;

  try {
    const result = await db.query(
      `
      UPDATE students
      SET approved_status = 'approved',
          approved_at = NOW()
      WHERE id = $1
      `,
      [id]
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

/* =====================================================
   DELETE STUDENT (SOFT DELETE)
===================================================== */
router.post("/:id/delete", async (req, res) => {
  const studentId = Number(req.params.id);
  const { name, mobile, reason } = req.body;

  if (!studentId || !name || !mobile || !reason) {
    return res.status(400).json({
      error: "Invalid delete request",
    });
  }

  try {
    const result = await db.query(
      `
      UPDATE students
      SET
        deleted_status = true,
        deleted_at = NOW(),
        deleted_by_name = $1,
        deleted_by_mobile = $2,
        deleted_reason = $3
      WHERE id = $4
      `,
      [name, mobile, reason, studentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
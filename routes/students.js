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
   ADD NEW STUDENT
===================================================== */
router.post("/", async (req, res) => {
  const { school_id, class_id, division_id, fields } = req.body;

  if (!school_id || !class_id || !division_id || !fields) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Insert student
    const studentInsert = await client.query(
      `
      INSERT INTO students (school_id, class_id, division_id)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [school_id, class_id, division_id]
    );

    const studentId = studentInsert.rows[0].id;

    // Insert dynamic fields
    for (const key of Object.keys(fields)) {
      await client.query(
        `
        INSERT INTO student_field_values
        (student_id, field_key, field_value)
        VALUES ($1, $2, $3)
        `,
        [studentId, key, fields[key]]
      );
    }

    await client.query("COMMIT");

    res.json({ success: true, student_id: studentId });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ADD STUDENT ERROR:", err);
    res.status(500).json({ error: "Add student failed" });
  } finally {
    client.release();
  }
});


/* =====================================================
   STUDENT VIEW
===================================================== */
router.get("/view/:id", async (req, res) => {
  try {
    const studentRes = await db.query(
      `
      SELECT
        id,
        school_id,
        class_id,
        division_id,
        photo_status,
        approved_at,
        approved_status,
        photo_drive_id
      FROM students
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (studentRes.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = studentRes.rows[0];

    const fieldsRes = await db.query(
      `
      SELECT field_key, field_value
      FROM student_field_values
      WHERE student_id = $1
      `,
      [student.id]
    );

    res.json({
      student,
      fields: fieldsRes.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load student" });
  }
});


/* =====================================================
   UPDATE STUDENT
===================================================== */
router.put("/:id", async (req, res) => {
  const { fields } = req.body;
  if (!fields) return res.status(400).json({ error: "fields required" });

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `DELETE FROM student_field_values WHERE student_id = $1`,
      [req.params.id]
    );

    for (const key of Object.keys(fields)) {
      await client.query(
        `
        INSERT INTO student_field_values
        (student_id, field_key, field_value)
        VALUES ($1, $2, $3)
        `,
        [req.params.id, key, fields[key]]
      );
    }

    await client.query("COMMIT");

    res.json({ success: true });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  } finally {
    client.release();
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


/* =====================================================
   APPROVE STUDENT
===================================================== */
router.post("/:id/approve", async (req, res) => {
  const { approved_by, approved_role, approved_mobile } = req.body;
  const id = req.params.id;

  if (!approved_by || !approved_role || !approved_mobile) {
    return res.status(400).json({ error: "Approver details required" });
  }

  try {
    const result = await db.query(
      `
      UPDATE students
      SET approved_status = 'approved',
          approved_at = NOW(),
          approved_by = $1,
          approved_role = $2,
          approved_mobile = $3
      WHERE id = $4
      `,
      [approved_by, approved_role, approved_mobile, id]
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
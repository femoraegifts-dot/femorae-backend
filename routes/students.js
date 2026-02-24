console.log("✅ STUDENTS ROUTE FILE LOADED");
console.log("🔥 DELETE ROUTE REGISTERED");
const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* =====================================================
   GET STUDENT FORM FIELDS
===================================================== */
router.get("/form-fields/:schoolId", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT field_key, field_label, required
      FROM school_student_schema
      WHERE school_id = ?
        AND active = 1
      ORDER BY field_order
      `,
      [req.params.schoolId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load form fields" });
  }
});

/* =====================================================
   GET STUDENT LIST
===================================================== */
router.get("/", async (req, res) => {
  const { school_id, class_id, division_id } = req.query;

  if (!school_id || !class_id || !division_id) {
    return res.status(400).json({
      error: "school_id, class_id, division_id required",
    });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT
        s.id,
        MAX(CASE WHEN v.field_key='student_id' THEN v.field_value END) AS student_id,
        MAX(CASE WHEN v.field_key='student_name' THEN v.field_value END) AS name,
        s.photo_status,
        s.approved_status
      FROM students s
      LEFT JOIN student_field_values v ON v.student_id = s.id
      WHERE s.school_id = ?
        AND s.class_id = ?
        AND s.division_id = ?
        AND s.deleted_status = 0
      GROUP BY s.id
      ORDER BY name
      `,
      [school_id, class_id, division_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load students" });
  }
});

/* =====================================================
   ADD NEW STUDENT
   POST /students
===================================================== */
router.post("/", async (req, res) => {
  const { school_id, class_id, division_id, fields } = req.body;

  if (!school_id || !class_id || !division_id || !fields) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣ Load schema to validate required fields
    const [schema] = await conn.query(
      `
      SELECT field_key, required
      FROM school_student_schema
      WHERE school_id = ?
        AND active = 1
      `,
      [school_id]
    );

    const missing = schema
      .filter(f => f.required === 1 && !fields[f.field_key])
      .map(f => f.field_key);

    if (missing.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        error: "Missing required fields",
        missing,
      });
    }

    // 2️⃣ Insert into students table
    const [result] = await conn.query(
      `
      INSERT INTO students (school_id, class_id, division_id)
      VALUES (?, ?, ?)
      `,
      [school_id, class_id, division_id]
    );

    const studentId = result.insertId;

    // 3️⃣ Insert dynamic fields
    for (const key of Object.keys(fields)) {
      await conn.query(
        `
        INSERT INTO student_field_values
        (student_id, field_key, field_value)
        VALUES (?, ?, ?)
        `,
        [studentId, key, fields[key]]
      );
    }

    await conn.commit();
    res.json({ success: true, student_id: studentId });
  } catch (err) {
    await conn.rollback();
    console.error("ADD STUDENT ERROR:", err);
    res.status(500).json({ error: "Add student failed" });
  } finally {
    conn.release();
  }
});


/* =====================================================
   STUDENT VIEW (🔥 FIXED PHOTO URL)
===================================================== */
router.get("/view/:id", async (req, res) => {
  try {
    const [[student]] = await db.query(
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
      WHERE id = ?
      `,
      [req.params.id]
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const photo_url = student.photo_drive_id
  ? `https://drive.google.com/uc?export=view&id=${student.photo_drive_id}`
  : null;


    const [fields] = await db.query(
      `
      SELECT sc.field_key, sc.field_label, v.field_value
      FROM school_student_schema sc
      LEFT JOIN student_field_values v
        ON v.field_key = sc.field_key
       AND v.student_id = ?
      WHERE sc.school_id = ?
        AND sc.active = 1
      ORDER BY sc.field_order
      `,
      [student.id, student.school_id]
    );

    res.json({
      student: {
        ...student,
        photo_url,
      },
      fields,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load student" });
  }
});

const { google } = require("googleapis");
const { authorize } = require("../services/googleAuth"); // SAME auth used before

router.get("/photo/:id", async (req, res) => {
  try {
    const [[student]] = await db.query(
      `SELECT photo_drive_id FROM students WHERE id = ?`,
      [req.params.id]
    );

    if (!student || !student.photo_drive_id) {
      return res.status(404).end();
    }

    const auth = await authorize();
    const drive = google.drive({ version: "v3", auth });

    const driveRes = await drive.files.get(
      { fileId: student.photo_drive_id, alt: "media" },
      { responseType: "stream" }
    );

    res.setHeader("Content-Type", "image/jpeg");
    driveRes.data.pipe(res);
  } catch (err) {
    console.error("PHOTO STREAM ERROR:", err);
    res.status(500).end();
  }
});


/* =====================================================
   UPDATE STUDENT
===================================================== */
router.put("/:id", async (req, res) => {
  const { fields } = req.body;
  if (!fields) return res.status(400).json({ error: "fields required" });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `DELETE FROM student_field_values WHERE student_id=?`,
      [req.params.id]
    );

    for (const key of Object.keys(fields)) {
      await conn.query(
        `
        INSERT INTO student_field_values
        (student_id, field_key, field_value)
        VALUES (?, ?, ?)
        `,
        [req.params.id, key, fields[key]]
      );
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  } finally {
    conn.release();
  }
});

/* =====================================================
   APPROVE STUDENT (LOCKED)
===================================================== */
router.post("/:id/approve", async (req, res) => {
  const { approved_by, approved_role, approved_mobile } = req.body;
  const id = req.params.id;

  if (!approved_by || !approved_role || !approved_mobile) {
    return res.status(400).json({ error: "Approver details required" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[student]] = await conn.query(
      `SELECT approved_at, photo_status FROM students WHERE id=?`,
      [id]
    );

    if (!student) {
      await conn.rollback();
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.approved_at) {
      await conn.rollback();
      return res.status(400).json({ error: "Already approved" });
    }

    if (student.photo_status !== "completed") {
      await conn.rollback();
      return res.status(400).json({ error: "Photo missing" });
    }

    const [fields] = await conn.query(
      `SELECT field_value FROM student_field_values WHERE student_id=?`,
      [id]
    );

    const hasEmpty = fields.some(
      f => !f.field_value || f.field_value.trim() === ""
    );

    if (hasEmpty) {
      await conn.rollback();
      return res.status(400).json({ error: "Incomplete data" });
    }

    await conn.query(
      `
      UPDATE students
      SET approved_status='approved',
          approved_at=NOW(),
          approved_by=?,
          approved_role=?,
          approved_mobile=?
      WHERE id=?
      `,
      [approved_by, approved_role, approved_mobile, id]
    );

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Approval failed" });
  } finally {
    conn.release();
  }
});

/* =====================================================
   DELETE STUDENT (SOFT DELETE + AUDIT)
===================================================== */
/* =====================================================
   DELETE STUDENT (SOFT DELETE + AUDIT)
===================================================== */
router.post("/:id/delete", async (req, res) => {
  console.log("🔥 DELETE ROUTE HIT");

  const studentId = Number(req.params.id);
  const { name, mobile, reason } = req.body;

  console.log("➡️ Params:", studentId);
  console.log("➡️ Body:", req.body);

  if (!studentId || isNaN(studentId)) {
    return res.status(400).json({ error: "Invalid student ID" });
  }

  if (!name || !mobile || !reason) {
    return res.status(400).json({
      error: "Name, mobile number and reason are required",
    });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Check student existence
    const [[student]] = await conn.query(
      `
      SELECT approved_status, deleted_status
      FROM students
      WHERE id = ?
      `,
      [studentId]
    );

    if (!student) {
      await conn.rollback();
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.deleted_status === 1) {
      await conn.rollback();
      return res.status(400).json({ error: "Student already deleted" });
    }

    if (student.approved_status === "approved") {
      await conn.rollback();
      return res.status(400).json({
        error: "Approved student cannot be deleted",
      });
    }

    // 2️⃣ Perform soft delete
    const [updateResult] = await conn.query(
      `
      UPDATE students
      SET
        deleted_status = 1,
        deleted_at = NOW(),
        deleted_by_name = ?,
        deleted_by_mobile = ?,
        deleted_reason = ?
      WHERE id = ?
      `,
      [name, mobile, reason, studentId]
    );

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      return res.status(500).json({ error: "Delete failed - no rows updated" });
    }

    await conn.commit();

    console.log("✅ Student soft deleted:", studentId);

    res.json({
      success: true,
      student_id: studentId,
    });

  } catch (err) {
    await conn.rollback();
    console.error("❌ DELETE STUDENT ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  } finally {
    conn.release();
  }
});

module.exports = router;

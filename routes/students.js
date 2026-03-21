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
        AND st.deleted_at IS NULL
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
        st.school_id,
        st.class_id,
        st.division_id,
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

    const schemaRes = await db.query(
      `
      SELECT field_key, field_label, required
      FROM school_student_schema
      WHERE school_id = (
        SELECT school_id FROM students WHERE id = $1
      )
      AND active = true
      ORDER BY field_order
      `,
      [req.params.id]
    );

    const valueMap = {};
    fieldsRes.rows.forEach(row => {
      valueMap[row.field_key] = row.field_value;
    });

    const fields = schemaRes.rows.map(schemaField => ({
      field_key: schemaField.field_key,
      field_label: schemaField.field_label,
      required: schemaField.required,
      field_value: valueMap[schemaField.field_key] || ""
    }));

    res.json({
      student: studentRes.rows[0],
      fields: fields
    });

  } catch (err) {
    console.error("STUDENT VIEW ERROR:", err);
    res.status(500).json({ error: "Failed to load student" });
  }
});


/* =====================================================
   UPDATE STUDENT (FIXED 🔥)
===================================================== */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { class_id, division_id, fields } = req.body;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 🔒 Prevent editing approved student
    const check = await client.query(
      `SELECT approved_status FROM students WHERE id = $1`,
      [id]
    );

    if (check.rows[0]?.approved_status === "approved") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Approved student cannot be edited",
      });
    }

    // 1️⃣ Update class & division
    await client.query(
      `
      UPDATE students
      SET class_id = $1,
          division_id = $2
      WHERE id = $3
      `,
      [class_id, division_id, id]
    );

    // 2️⃣ Update fields
    for (const key in fields) {
      const existing = await client.query(
        `
        SELECT id FROM student_field_values
        WHERE student_id = $1 AND field_key = $2
        `,
        [id, key]
      );

      if (existing.rows.length > 0) {
        await client.query(
          `
          UPDATE student_field_values
          SET field_value = $1
          WHERE student_id = $2 AND field_key = $3
          `,
          [fields[key], id, key]
        );
      } else {
        await client.query(
          `
          INSERT INTO student_field_values (student_id, field_key, field_value)
          VALUES ($1, $2, $3)
          `,
          [id, key, fields[key]]
        );
      }
    }

    await client.query("COMMIT");

    res.json({ success: true });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("UPDATE STUDENT ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  } finally {
    client.release();
  }
});


/* =====================================================
   APPROVE STUDENT
===================================================== */
router.put("/approve/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      `
      UPDATE students
      SET approved_status = 'approved',
          approved_at = NOW()
      WHERE id = $1
      `,
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({ error: "Approve failed" });
  }
});


/* =====================================================
   DELETE STUDENT (SOFT DELETE)
===================================================== */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, role, mobile } = req.body;

  try {
    await db.query(
      `
      UPDATE students
      SET deleted_at = NOW(),
          deleted_by_name = $1,
          deleted_by_role = $2,
          deleted_by_mobile = $3
      WHERE id = $4
      `,
      [name, role, mobile, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});


/* =====================================================
   FORM FIELDS
===================================================== */
router.get("/form-fields/:school_id", async (req, res) => {
  try {
    const { school_id } = req.params;

    const result = await db.query(
      `
      SELECT field_key, field_label, required
      FROM school_student_schema
      WHERE school_id = $1
      AND active = true
      ORDER BY field_order
      `,
      [school_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("FORM FIELDS ERROR:", err);
    res.status(500).json({ error: "Failed to load form fields" });
  }
});

/* =====================================================
   EXPORT STUDENTS TO EXCEL
===================================================== */
const ExcelJS = require("exceljs");

router.get("/export/excel", async (req, res) => {
  console.log("📌 EXPORT EXCEL HIT");
  try {
    const { school_id, class_id, division_id } = req.query;

    const result = await db.query(
      `
      SELECT
        st.id,
        st.photo_status,
        st.approved_status,
        sf.field_key,
        sf.field_value
      FROM students st
      LEFT JOIN student_field_values sf
        ON sf.student_id = st.id
      WHERE st.school_id = $1
        AND st.class_id = $2
        AND st.division_id = $3
        AND st.deleted_at IS NULL
      ORDER BY st.id
      `,
      [school_id, class_id, division_id]
    );

    // 🔥 Transform data
    const studentsMap = {};

    result.rows.forEach(row => {
      if (!studentsMap[row.id]) {
        studentsMap[row.id] = {
          id: row.id,
          photo_status: row.photo_status,
          approved_status: row.approved_status,
        };
      }

      studentsMap[row.id][row.field_key] = row.field_value;
    });

    const students = Object.values(studentsMap);

    // 🔥 Create Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Students");

    // Headers
    const headers = Object.keys(students[0] || {});
    sheet.addRow(headers);

    // Data
    students.forEach(student => {
      sheet.addRow(headers.map(h => student[h] || ""));
    });

    // Response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=students.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("EXPORT ERROR:", err);
    res.status(500).json({ error: "Export failed" });
  }
});

module.exports = router;
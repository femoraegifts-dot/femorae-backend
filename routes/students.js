// ===============================
// routes/students.js
// FINAL V2 PRODUCTION VERSION
// ===============================

console.log("✅ STUDENTS ROUTE FILE LOADED");

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const ExcelJS = require("exceljs");

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
        MAX(CASE WHEN sf.field_key='student_id' THEN sf.field_value END) AS student_id,
        MAX(CASE WHEN sf.field_key='name' THEN sf.field_value END) AS name
      FROM students st
      LEFT JOIN student_field_values sf
        ON sf.student_id = st.id
      WHERE st.school_id = $1
        AND st.class_id = $2
        AND st.division_id = $3
        AND st.deleted_at IS NULL
      GROUP BY st.id
      ORDER BY
        MAX(CASE WHEN sf.field_key='student_id' THEN sf.field_value END)
      `,
      [school_id, class_id, division_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("STUDENT LIST ERROR:", err);
    res.status(500).json({
      error: "Failed to load students",
    });
  }
});

/* =====================================================
   GET FORM FIELDS
===================================================== */
router.get("/form-fields/:schoolId", async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        field_key,
        field_label,
        required,
        field_order
      FROM school_student_schema
      WHERE school_id = $1
        AND active = true
      ORDER BY field_order
      `,
      [req.params.schoolId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("FORM FIELDS ERROR:", err);
    res.status(500).json({
      error: "Failed to load form fields",
    });
  }
});

/* =====================================================
   STUDENT PROFILE VIEW
===================================================== */
router.get("/view/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    const studentRes = await db.query(
      `
      SELECT
        st.*,
        s.name AS school_name,
        c.class_name,
        d.division_name
      FROM students st
      LEFT JOIN schools s ON s.id = st.school_id
      LEFT JOIN classes c ON c.id = st.class_id
      LEFT JOIN divisions d ON d.id = st.division_id
      WHERE st.id = $1
      `,
      [studentId]
    );

    if (studentRes.rows.length === 0) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    const fieldsRes = await db.query(
      `
      SELECT DISTINCT ON (field_key)
        field_key,
        field_value
      FROM student_field_values
      WHERE student_id = $1
      ORDER BY field_key, id DESC
      `,
      [studentId]
    );

    const fields = fieldsRes.rows.map((row) => ({
      field_key: row.field_key,
      field_label: row.field_key,
      required: false,
      field_value: row.field_value,
    }));

    res.json({
      student: studentRes.rows[0],
      fields,
    });
  } catch (err) {
    console.error("STUDENT VIEW ERROR:", err);
    res.status(500).json({
      error: "Failed to load student",
    });
  }
});

/* =====================================================
   ADD STUDENT
===================================================== */
router.post("/", async (req, res) => {
  try {
    const {
      school_id,
      class_id,
      division_id,
      fields,
    } = req.body;

    if (
      !school_id ||
      !class_id ||
      !division_id ||
      !fields
    ) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }

    const studentRes = await db.query(
      `
      INSERT INTO students
      (
        school_id,
        class_id,
        division_id,
        created_at
      )
      VALUES ($1,$2,$3,NOW())
      RETURNING id
      `,
      [school_id, class_id, division_id]
    );

    const studentId = studentRes.rows[0].id;

    for (const key of Object.keys(fields)) {
      await db.query(
        `
        INSERT INTO student_field_values
        (student_id, field_key, field_value)
        VALUES ($1,$2,$3)
        `,
        [studentId, key, fields[key]]
      );
    }

    res.json({
      success: true,
      student_id: studentId,
    });
  } catch (err) {
    console.error("ADD STUDENT ERROR:", err);
    res.status(500).json({
      error: "Failed to add student",
    });
  }
});

/* =====================================================
   UPDATE STUDENT
   NOW SUPPORTS CLASS + DIVISION CHANGE
===================================================== */
router.put("/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    const {
      class_id,
      division_id,
      fields,
    } = req.body;

    // lock approved students
    const lock = await db.query(
      `
      SELECT approved_status
      FROM students
      WHERE id = $1
      `,
      [studentId]
    );

    if (
      lock.rows.length &&
      lock.rows[0].approved_status === "approved"
    ) {
      return res.status(403).json({
        error:
          "Approved student cannot be edited",
      });
    }

    if (!fields || typeof fields !== "object") {
      return res.status(400).json({
        error: "Invalid fields payload",
      });
    }

    // update class/division if sent
    if (class_id && division_id) {
      await db.query(
        `
        UPDATE students
        SET class_id = $1,
            division_id = $2
        WHERE id = $3
        `,
        [
          class_id,
          division_id,
          studentId,
        ]
      );
    }

    // update dynamic fields
    for (const key of Object.keys(fields)) {
      const value = fields[key];

      const check = await db.query(
        `
        SELECT id
        FROM student_field_values
        WHERE student_id = $1
          AND field_key = $2
        LIMIT 1
        `,
        [studentId, key]
      );

      if (check.rows.length > 0) {
        await db.query(
          `
          UPDATE student_field_values
          SET field_value = $1
          WHERE student_id = $2
            AND field_key = $3
          `,
          [value, studentId, key]
        );
      } else {
        await db.query(
          `
          INSERT INTO student_field_values
          (student_id, field_key, field_value)
          VALUES ($1,$2,$3)
          `,
          [studentId, key, value]
        );
      }
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({
      error: "Failed to update student",
    });
  }
});

/* =====================================================
   APPROVE STUDENT
===================================================== */
router.put("/approve/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    const st = await db.query(
      `SELECT * FROM students WHERE id = $1`,
      [studentId]
    );

    if (st.rows.length === 0) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    const student = st.rows[0];

    if (!student.photo_drive_id) {
      return res.status(400).json({
        error:
          "Upload photo before approval",
      });
    }

    const reqFields = await db.query(
      `
      SELECT field_key
      FROM school_student_schema
      WHERE school_id = $1
      AND active = true
      AND required = true
      `,
      [student.school_id]
    );

    for (const row of reqFields.rows) {
      const val = await db.query(
        `
        SELECT field_value
        FROM student_field_values
        WHERE student_id = $1
        AND field_key = $2
        LIMIT 1
        `,
        [studentId, row.field_key]
      );

      if (
        val.rows.length === 0 ||
        !val.rows[0].field_value ||
        val.rows[0].field_value.trim() === ""
      ) {
        return res.status(400).json({
          error:
            row.field_key +
            " is required",
        });
      }
    }

    await db.query(
      `
      UPDATE students
      SET approved_status='approved',
          approved_at=NOW()
      WHERE id = $1
      `,
      [studentId]
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({
      error: "Approval failed",
    });
  }
});

/* =====================================================
   DELETE STUDENT
===================================================== */
router.delete("/:id", async (req, res) => {
  try {
    await db.query(
      `
      UPDATE students
      SET deleted_at = NOW()
      WHERE id = $1
      `,
      [req.params.id]
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({
      error: "Delete failed",
    });
  }
});

/* =====================================================
   EXPORT EXCEL
===================================================== */
router.get("/export/excel", async (req, res) => {
  try {
    const {
      school_id,
      class_id,
      division_id,
    } = req.query;

    const result = await db.query(
      `
      SELECT st.id, sf.field_key, sf.field_value
      FROM students st
      LEFT JOIN student_field_values sf
        ON sf.student_id = st.id
      WHERE st.school_id = $1
        AND st.class_id = $2
        AND st.division_id = $3
        AND st.deleted_at IS NULL
      ORDER BY st.id
      `,
      [
        school_id,
        class_id,
        division_id,
      ]
    );

    const workbook =
      new ExcelJS.Workbook();

    const sheet =
      workbook.addWorksheet(
        "Students"
      );

    const map = {};

    result.rows.forEach((row) => {
      if (!map[row.id]) map[row.id] = {};
      map[row.id][row.field_key] =
        row.field_value;
    });

    const rows =
      Object.values(map);

    if (rows.length > 0) {
      sheet.columns =
        Object.keys(rows[0]).map(
          (k) => ({
            header:
              k.toUpperCase(),
            key: k,
            width: 22,
          })
        );

      rows.forEach((r) =>
        sheet.addRow(r)
      );
    }

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
    res.status(500).json({
      error: "Export failed",
    });
  }
});

/* =====================================================
   REMOVE APPROVAL
===================================================== */
router.put("/unapprove/:id", async (req, res) => {
  try {
    await db.query(
      `
      UPDATE students
      SET approved_status = NULL,
          approved_at = NULL
      WHERE id = $1
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Approval removed",
    });
  } catch (err) {
    console.error("UNAPPROVE ERROR:", err);

    res.status(500).json({
      error: "Failed to remove approval",
    });
  }
});

module.exports = router;
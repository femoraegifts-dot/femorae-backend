const express = require("express");
const router = express.Router();

const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const XLSX = require("xlsx");

const db = require("../config/db");

const upload = multer({ dest: "uploads/" });

router.post("/students", upload.single("file"), async (req, res) => {
  try {
    const { school_id } = req.body;

    if (!school_id || !req.file) {
      return res.status(400).json({ error: "Missing school or file" });
    }

    const filePath = req.file.path;
    const ext = req.file.originalname.split(".").pop().toLowerCase();

    let students = [];

    // ================= CSV =================
    if (ext === "csv") {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => students.push(row))   // ✅ FIXED
        .on("end", async () => {
          try {
            const inserted = await insertStudents(students, school_id);
            fs.unlinkSync(filePath);

            return res.json({
              success: true,
              inserted,
            });

          } catch (err) {
            fs.unlinkSync(filePath);
            return res.status(500).json({
              error: err.message,
            });
          }
        });
    }

    // ================= EXCEL =================
    else if (ext === "xlsx") {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      students = XLSX.utils.sheet_to_json(sheet);

      const inserted = await insertStudents(students, school_id);
      fs.unlinkSync(filePath);

      return res.json({
        success: true,
        inserted,
      });
    }

    else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Invalid file format" });
    }

  } catch (err) {
    console.error("❌ Import error:", err);
    return res.status(500).json({ error: "Import failed" });
  }
});


// ======================================================
// INSERT STUDENTS FUNCTION
// ======================================================

async function insertStudents(rows, school_id) {

  let successCount = 0;

  for (const originalRow of rows) {

    // Normalize headers (case insensitive)
    const r = {};
    for (const key of Object.keys(originalRow)) {
      r[key.trim().toLowerCase()] = originalRow[key];
    }

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // ===== Get Class =====
      const classRes = await client.query(
        `SELECT id FROM classes
         WHERE school_id = $1
         AND LOWER(class_name) = LOWER($2)`,
        [school_id, r.class]
      );

      if (classRes.rows.length === 0) {
        throw new Error(`Class not found: ${r.class}`);
      }

      const class_id = classRes.rows[0].id;

      // ===== Get Division =====
      const divisionRes = await client.query(
        `SELECT id FROM divisions
         WHERE class_id = $1
         AND LOWER(division_name) = LOWER($2)`,
        [class_id, r.division]
      );

      if (divisionRes.rows.length === 0) {
        throw new Error(`Division not found: ${r.division}`);
      }

      const division_id = divisionRes.rows[0].id;

      // ===== Insert student =====
      const studentInsert = await client.query(
        `INSERT INTO students (school_id, class_id, division_id)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [school_id, class_id, division_id]
      );

      const studentDbId = studentInsert.rows[0].id;

      // ===== Insert dynamic fields =====
      for (const key of Object.keys(r)) {

        if (key === "class" || key === "division") continue;

        await client.query(
          `INSERT INTO student_field_values
           (student_id, field_key, field_value)
           VALUES ($1, $2, $3)`,
          [studentDbId, key, r[key]]
        );
      }

      await client.query("COMMIT");
      successCount++;

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Import error:", err.message);
    } finally {
      client.release();
    }
  }

  return successCount;
}

module.exports = router;
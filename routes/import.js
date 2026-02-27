const express = require("express");
const router = express.Router();

const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const XLSX = require("xlsx");

const db = require("../config/db");

const upload = multer({ dest: "uploads/" });

// ✅ IMPORTANT: multer middleware MUST be here
router.post(
  "/students",
  upload.single("file"),
  async (req, res) => {
    try {
      const { school_id } = req.body;

      if (!school_id || !req.file) {
        return res.status(400).json({ error: "Missing school or file" });
      }

      const filePath = req.file.path;
      const ext = req.file.originalname.split(".").pop().toLowerCase();

      let students = [];

      // ---------- CSV ----------
      if (ext === "csv") {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => students.push(row))
          .on("end", async () => {
            await insertStudents(students, school_id);
            fs.unlinkSync(filePath);
            return res.json({
              success: true,
              inserted: students.length,
            });
          });
      }

      // ---------- EXCEL ----------
      else if (ext === "xlsx") {
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        students = XLSX.utils.sheet_to_json(sheet);

        await insertStudents(students, school_id);
        fs.unlinkSync(filePath);
        return res.json({
          success: true,
          inserted: students.length,
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
  }
);

// helper function
async function insertStudents(rows, school_id) {

  for (const originalRow of rows) {

    // 🔹 Normalize keys to lowercase
    const r = {};
    for (const key of Object.keys(originalRow)) {
      r[key.trim().toLowerCase()] = originalRow[key];
    }

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // 🔹 1️⃣ Get class_id
      const classRes = await client.query(
        `SELECT id FROM classes 
         WHERE school_id = $1`,
        [school_id, r.class]
      );

      if (classRes.rows.length === 0) {
        throw new Error(`Class not found: ${r.class}`);
      }

      const class_id = classRes.rows[0].id;

      // 🔹 2️⃣ Get division_id
      const divisionRes = await client.query(
        `SELECT id FROM divisions 
         WHERE class_id = $1 AND LOWER(division_name) = LOWER($2)`,
        [class_id, r.division]
      );

      if (divisionRes.rows.length === 0) {
        throw new Error(`Division not found: ${r.division}`);
      }

      const division_id = divisionRes.rows[0].id;

      // 🔹 3️⃣ Insert into students
      const studentInsert = await client.query(
        `
        INSERT INTO students (school_id, class_id, division_id)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [school_id, class_id, division_id]
      );

      const studentDbId = studentInsert.rows[0].id;

      // 🔹 4️⃣ Insert dynamic fields (excluding class & division)
      for (const key of Object.keys(r)) {

        if (key === "class" || key === "division") continue;

        await client.query(
          `
          INSERT INTO student_field_values
          (student_id, field_key, field_value)
          VALUES ($1, $2, $3)
          `,
          [studentDbId, key, r[key]]
        );
      }

      await client.query("COMMIT");

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Import error:", err.message);
    } finally {
      client.release();
    }
  }
}

module.exports = router;

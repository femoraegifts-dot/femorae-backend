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
  for (const r of rows) {
    await db.query(
      `INSERT IGNORE INTO students
       (student_id, name, class, division, house, place, post, pin, mobile, school_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        r.student_id,
        r.name,
        r.class,
        r.division,
        r.house,
        r.place,
        r.post,
        r.pin,
        r.mobile,
        school_id,
      ]
    );
  }
}

module.exports = router;

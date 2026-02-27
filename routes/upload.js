const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const db = require("../config/db");
const { uploadToDrive } = require("../services/googleDrive");

const upload = multer({ dest: "uploads/" });

/* =====================================================
   POST /api/upload/student-photo
===================================================== */
router.post("/student-photo", upload.single("photo"), async (req, res) => {
  try {
    const studentCode = req.body.student_id;

    if (!studentCode || !req.file) {
      return res.status(400).json({
        error: "student_id and photo required",
      });
    }

    /* =====================================================
       1️⃣ FIND STUDENT (PostgreSQL style)
    ===================================================== */
    const result = await db.query(
      `
      SELECT
        st.id                AS student_id,
        s.name               AS school_name,
        c.class_name         AS class_name,
        d.division_name      AS division_name
      FROM students st
      JOIN schools s   ON s.id = st.school_id
      JOIN classes c   ON c.id = st.class_id
      JOIN divisions d ON d.id = st.division_id
      JOIN student_field_values v
        ON v.student_id = st.id
      WHERE v.field_key = 'student_id'
        AND v.field_value = $1
      LIMIT 1
      `,
      [studentCode]
    );

    const student = result.rows[0];

    if (!student) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Student not found" });
    }

    /* =====================================================
   2️⃣ BUILD FILE INFO
===================================================== */
const fileName = `${studentCode}.jpg`;

const schoolName = student.school_name;
const className = `Class ${student.class_name}`;
const divisionName = student.division_name;

/* 🔍 DEBUG */
console.log("TEMP FILE PATH:", req.file.path);
console.log("FILE EXISTS:", fs.existsSync(req.file.path));

    /* =====================================================
       3️⃣ UPLOAD TO GOOGLE DRIVE
    ===================================================== */
    const driveResult = await uploadToDrive({
      filePath: req.file.path,
      fileName,
      schoolName,
      className,
      divisionName,
    });
    
    if (!driveResult || !driveResult.id) {
      throw new Error("Drive upload failed (no file ID)");
    }

    console.log(
      `☁️ Drive upload success → ${schoolName}/${className}/${divisionName}/${fileName}`
    );

    /* =====================================================
       4️⃣ UPDATE STUDENT (PostgreSQL style)
    ===================================================== */
    await db.query(
      `
      UPDATE students
      SET
        photo_status = 'completed',
        photo_drive_id = $1
      WHERE id = $2
      `,
      [driveResult.id, student.student_id]
    );

    /* =====================================================
       5️⃣ CLEANUP TEMP FILE
    ===================================================== */
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.json({
      success: true,
      drive_file_id: driveResult.id,
    });

  } catch (err) {
    console.error("❌ FULL Upload error:", JSON.stringify(err, null, 2));

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      error: "Upload failed",
    });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const db = require("../config/db");
const { uploadToDrive } = require("../services/googleDrive");

/* =====================================================
   MULTER CONFIG
===================================================== */
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
       1️⃣ FIND STUDENT + SCHOOL + CLASS + DIVISION
    ===================================================== */
    const [[student]] = await db.query(
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
        AND v.field_value = ?
      LIMIT 1
      `,
      [studentCode]
    );

    if (!student) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Student not found" });
    }

    /* =====================================================
       2️⃣ BUILD FILE + FOLDER DATA
    ===================================================== */
    const fileName = `${studentCode}.jpg`;

    const schoolName = student.school_name;
    const className = `Class ${student.class_name}`;
    const divisionName = student.division_name;

    /* =====================================================
       3️⃣ UPLOAD TO GOOGLE DRIVE
       ID Card / School / Class / Division / file.jpg
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
       4️⃣ UPDATE DATABASE
    ===================================================== */
    await db.query(
      `
      UPDATE students
      SET
        photo_status = 'completed',
        photo_drive_id = ?
      WHERE id = ?
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
    console.error("❌ Upload error:", err);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      error: "Upload failed",
    });
  }
});

module.exports = router;

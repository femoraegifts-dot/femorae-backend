const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const db = require("../config/db");

// ✅ Import BOTH upload + drive
const { uploadToDrive, drive } = require("../services/googleDrive");

// Multer config
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

    /* =========================
       1️⃣ FIND STUDENT
    ========================= */
    const result = await db.query(
      `
      SELECT
        st.id AS student_id,
        s.name AS school_name,
        c.class_name,
        d.division_name
      FROM students st
      JOIN schools s ON s.id = st.school_id
      JOIN classes c ON c.id = st.class_id
      JOIN divisions d ON d.id = st.division_id
      JOIN student_field_values v ON v.student_id = st.id
      WHERE v.field_key = 'student_id'
        AND v.field_value = $1
      LIMIT 1
      `,
      [studentCode]
    );

    const student = result.rows[0];

    if (!student) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: "Student not found" });
    }

    const fileName = `${studentCode}.jpg`;

    console.log("📤 Uploading file:", req.file.path);
    console.log("📁 File exists:", fs.existsSync(req.file.path));

    /* =========================
       2️⃣ GET OLD PHOTO ID
    ========================= */
    const oldPhotoRes = await db.query(
      `SELECT photo_drive_id FROM students WHERE id = $1`,
      [student.student_id]
    );

    const oldPhotoId = oldPhotoRes.rows[0]?.photo_drive_id;

    /* =========================
       3️⃣ UPLOAD NEW PHOTO FIRST
    ========================= */
    const driveResult = await uploadToDrive({
      filePath: req.file.path,
      fileName,
      schoolName: student.school_name,
      className: `Class ${student.class_name}`,
      divisionName: student.division_name,
    });

    if (!driveResult || !driveResult.id) {
      throw new Error("Drive upload failed (no file ID)");
    }

    console.log("☁️ Upload success:", driveResult.id);

    /* =========================
       4️⃣ UPDATE DATABASE
    ========================= */
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

    /* =========================
       5️⃣ DELETE OLD PHOTO (AFTER SUCCESS)
    ========================= */
    if (oldPhotoId) {
      try {
        await drive.files.delete({
          fileId: oldPhotoId,
        });
        console.log("🗑 Old photo deleted:", oldPhotoId);
      } catch (err) {
        console.log("⚠️ Failed to delete old photo:", err.message);
      }
    }

    /* =========================
       6️⃣ CLEANUP TEMP FILE
    ========================= */
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.json({
      success: true,
      drive_file_id: driveResult.id,
    });

  } catch (err) {
    console.error("❌ Upload error message:", err.message);
    console.error("❌ Upload error full:", err);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      error: "Upload failed",
    });
  }
});

module.exports = router;
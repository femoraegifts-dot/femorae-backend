const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const { uploadToDrive } = require("../services/googleDrive");

// temp upload folder
const upload = multer({ dest: "uploads/" });

// POST /api/upload/student-photo
router.post("/student-photo", upload.single("photo"), async (req, res) => {
  console.log("🔥 Upload endpoint HIT");

  try {
    const { student_id } = req.body;

    if (!student_id || !req.file) {
      return res.status(400).json({ message: "Missing data" });
    }

    const tempFilePath = req.file.path;
    const fileName = `${student_id}.jpg`;

    // ✅ Upload to Google Drive (optional but kept)
    try {
      await uploadToDrive(
        tempFilePath,
        fileName,
        process.env.DRIVE_FOLDER_ID
      );
      console.log(`☁️ Uploaded to Drive: ${fileName}`);
    } catch (e) {
      console.warn("⚠️ Drive upload skipped / failed", e.message);
    }

    // ✅ UPDATE DATABASE (THIS WAS MISSING)
    await db.query(
      "UPDATE students SET photo_name=?, photo_status='completed' WHERE student_id=?",
      [fileName, student_id]
    );

    // ✅ Cleanup temp file
    fs.unlinkSync(tempFilePath);

    res.json({ success: true, fileName });
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;

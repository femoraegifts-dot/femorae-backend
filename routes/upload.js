const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const db = require("../config/db");

// Cloudinary upload
const {
  uploadToCloudinary,
} = require("../services/cloudinary");

// Multer temp upload
const upload = multer({
  dest: "uploads/",
});

/* =====================================================
   POST /api/upload/student-photo
   FINAL VERSION (USES DB ID)
===================================================== */
router.post(
  "/student-photo",
  upload.single("photo"),
  async (req, res) => {
    try {
      const studentDbId =
        req.body.student_db_id;

      if (
        !studentDbId ||
        !req.file
      ) {
        return res
          .status(400)
          .json({
            error:
              "student_db_id and photo required",
          });
      }

      /* ===================================
         1. FIND STUDENT DIRECTLY
      =================================== */
      const result =
        await db.query(
          `
        SELECT
          st.id AS db_id,
          st.approved_status,
          sf.field_value AS student_code,
          s.name AS school_name,
          c.class_name,
          d.division_name

        FROM students st

        JOIN schools s
          ON s.id = st.school_id

        JOIN classes c
          ON c.id = st.class_id

        JOIN divisions d
          ON d.id = st.division_id

        LEFT JOIN student_field_values sf
          ON sf.student_id = st.id
         AND sf.field_key = 'student_id'

        WHERE st.id = $1
        LIMIT 1
      `,
          [studentDbId]
        );

      const student =
        result.rows[0];

      if (!student) {
        if (
          fs.existsSync(
            req.file.path
          )
        ) {
          fs.unlinkSync(
            req.file.path
          );
        }

        return res
          .status(404)
          .json({
            error:
              "Student not found",
          });
      }

      console.log(
        "📤 Uploading file:",
        req.file.path
      );

      /* ===================================
         2. APPROVAL LOCK
      =================================== */
      if (
        student.approved_status ===
        "approved"
      ) {
        if (
          fs.existsSync(
            req.file.path
          )
        ) {
          fs.unlinkSync(
            req.file.path
          );
        }

        return res
          .status(403)
          .json({
            error:
              "Approved student photo locked",
          });
      }

      /* ===================================
         3. CLEAN TEXT
      =================================== */
      const clean = (
        text
      ) =>
        text
          ?.toString()
          .toLowerCase()
          .trim()
          .replace(
            /\s+/g,
            "_"
          )
          .replace(
            /[^a-z0-9_]/g,
            ""
          ) ||
        "unknown";

      const schoolName =
        clean(
          student.school_name
        );

      const className =
        clean(
          student.class_name
        );

      const divisionName =
        clean(
          student.division_name
        );

      const studentCode =
        student.student_code ||
        student.db_id;

      /* ===================================
         4. CLOUDINARY FOLDER
      =================================== */
      const folderPath =
          "femorae/" +
          schoolName +
          "/" +
          className +
          "/" +
          divisionName;

      console.log(
        "📁 Cloudinary folder:",
        folderPath
      );

      /* ===================================
         5. UPLOAD
      =================================== */
      const cloudinaryResult =
        await uploadToCloudinary(
          req.file.path,
          studentCode.toString() + "_" + Date.now(),
          folderPath
        );

      if (
        !cloudinaryResult ||
        !cloudinaryResult.public_id
      ) {
        throw new Error(
          "Cloudinary upload failed"
        );
      }

      console.log(
        "☁️ Cloudinary upload success:",
        cloudinaryResult.url
      );

      /* ===================================
         6. UPDATE DATABASE
      =================================== */
      await db.query(
        `
        UPDATE students
        SET
          photo_status = 'completed',
          photo_drive_id = $1,
          updated_at = NOW()
        WHERE id = $2
      `,
        [
          cloudinaryResult.public_id,
          student.db_id,
        ]
      );

      console.log(
        "✅ DB Updated:",
        student.db_id
      );

      /* ===================================
         7. CLEANUP
      =================================== */
      if (
        fs.existsSync(
          req.file.path
        )
      ) {
        fs.unlinkSync(
          req.file.path
        );
      }

      return res.json({
        success: true,
        image_url:
          cloudinaryResult.url,
        public_id:
          cloudinaryResult.public_id,
      });
    } catch (err) {
      console.error(
        "❌ Upload error:",
        err
      );

      if (
        req.file?.path &&
        fs.existsSync(
          req.file.path
        )
      ) {
        fs.unlinkSync(
          req.file.path
        );
      }

      return res
        .status(500)
        .json({
          error:
            "Upload failed",
        });
    }
  }
);

module.exports = router;
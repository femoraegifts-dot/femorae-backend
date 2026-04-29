const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const db = require("../config/db");

// Cloudinary
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,
  api_key:
    process.env.CLOUDINARY_API_KEY,
  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

// Temp upload folder
const upload = multer({
  dest: "uploads/",
});

/* =====================================================
   POST /api/upload/student-photo
   FINAL CLEAN VERSION
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

      /* =====================================
         FIND STUDENT
      ===================================== */
      const result =
        await db.query(
          `
          SELECT
            st.id,
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

      /* =====================================
         LOCK APPROVED
      ===================================== */
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

      /* =====================================
         CLEAN TEXT
      ===================================== */
      const clean = (
        text
      ) =>
        text
          ?.toString()
          .trim()
          .toLowerCase()
          .replace(
            /\s+/g,
            "_"
          )
          .replace(
            /[^a-z0-9_]/g,
            ""
          ) || "unknown";

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
        clean(
          student.student_code ||
            student.id
        );

      const folderPath =
        `femorae/${schoolName}/${className}/${divisionName}`;

      /* =====================================
         UPLOAD TO CLOUDINARY
         SAME NAME / REPLACE OLD FILE
      ===================================== */
      const uploaded =
        await cloudinary.uploader.upload(
          req.file.path,
          {
            folder:
              folderPath,
            public_id:
              studentCode,
            overwrite: true,
            invalidate: true,
            resource_type:
              "image",
          }
        );

      /* =====================================
         UPDATE DATABASE
      ===================================== */
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
          uploaded.public_id,
          student.id,
        ]
      );

      /* =====================================
         DELETE TEMP FILE
      ===================================== */
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
        public_id:
          uploaded.public_id,
        secure_url:
          uploaded.secure_url,
        version:
          uploaded.version,
      });
    } catch (err) {
      console.error(
        "UPLOAD ERROR:",
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
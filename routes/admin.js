/**
 * ============================================
 *  ADMIN ROUTES — FEMORAE ID SYSTEM
 *  FINAL CLEAN VERSION (POSTGRESQL)
 * ============================================
 */

const express = require("express");
const router = express.Router();
const db = require("../config/db");

console.log("✅ admin.js loaded");

/* ============================================
   AUTH MIDDLEWARE
============================================ */
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin === true) {
    return next();
  }

  return res.redirect("/admin/login");
}

/* ============================================
   LOGIN
============================================ */
router.get("/login", (req, res) => {
  res.render("admin/login", {
    error: null,
  });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.admin = true;
    return res.redirect("/admin/dashboard");
  }

  res.render("admin/login", {
    error: "Invalid credentials",
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy(() =>
    res.redirect("/admin/login")
  );
});

/* ============================================
   DASHBOARD
============================================ */
router.get(
  "/dashboard",
  requireAdmin,
  async (req, res) => {
    try {
      const schoolsResult =
        await db.query(
          `
        SELECT COUNT(*) AS total_schools
        FROM schools
      `
        );

      const studentsResult =
        await db.query(
          `
        SELECT COUNT(*) AS total_students
        FROM students
      `
        );

      res.render(
        "admin/dashboard",
        {
          metrics: {
            totalSchools:
              schoolsResult.rows[0]
                .total_schools,
            totalStudents:
              studentsResult.rows[0]
                .total_students,
          },
        }
      );
    } catch (err) {
      console.error(
        "DASHBOARD ERROR:",
        err
      );

      res.status(500).send(
        "Server error"
      );
    }
  }
);

/* ============================================
   LIST SCHOOLS
============================================ */
router.get(
  "/schools",
  requireAdmin,
  async (req, res) => {
    try {
      const result =
        await db.query(`
        SELECT
          s.id,
          s.name,
          s.username,
          COUNT(st.id) AS total_students
        FROM schools s
        LEFT JOIN students st
          ON st.school_id = s.id
        GROUP BY
          s.id,
          s.name,
          s.username
        ORDER BY s.id DESC
      `);

      res.render(
        "admin/schools_list",
        {
          schools:
            result.rows,
        }
      );
    } catch (err) {
      console.error(
        "LIST SCHOOLS ERROR:",
        err
      );

      res.status(500).send(
        "Server error"
      );
    }
  }
);

/* ============================================
   ADD SCHOOL
============================================ */
router.get(
  "/schools/add",
  requireAdmin,
  (req, res) => {
    res.render(
      "admin/add_school",
      {
        error: null,
        success: null,
      }
    );
  }
);

router.post(
  "/schools/add",
  requireAdmin,
  async (req, res) => {
    const {
      name,
      username,
      password,
    } = req.body;

    if (
      !name ||
      !username ||
      !password
    ) {
      return res.render(
        "admin/add_school",
        {
          error:
            "All fields required",
          success: null,
        }
      );
    }

    try {
      await db.query(
        `
        INSERT INTO schools
        (name, username, password)
        VALUES ($1,$2,$3)
      `,
        [
          name,
          username,
          password,
        ]
      );

      res.render(
        "admin/add_school",
        {
          error: null,
          success:
            "School added successfully",
        }
      );
    } catch (err) {
      console.error(
        "ADD SCHOOL ERROR:",
        err
      );

      res.render(
        "admin/add_school",
        {
          error:
            "Username already exists",
          success: null,
        }
      );
    }
  }
);

/* ============================================
   IMPORT PAGE
============================================ */
router.get(
  "/students/import",
  requireAdmin,
  async (req, res) => {
    try {
      const result =
        await db.query(`
        SELECT id, name
        FROM schools
        ORDER BY name
      `);

      res.render(
        "admin/import_students",
        {
          schools:
            result.rows,
        }
      );
    } catch (err) {
      console.error(
        "IMPORT PAGE ERROR:",
        err
      );

      res.status(500).send(
        "Server error"
      );
    }
  }
);

/* ============================================
   EXPORT PAGE
============================================ */
router.get(
  "/exports",
  requireAdmin,
  async (req, res) => {
    try {
      const schools =
        await db.query(`
        SELECT id, name
        FROM schools
        ORDER BY name
      `);

      res.render(
        "admin/exports",
        {
          schools:
            schools.rows,
        }
      );
    } catch (err) {
      console.error(
        "EXPORT PAGE ERROR:",
        err
      );

      res.status(500).send(
        "Server error"
      );
    }
  }
);

/* ============================================
   STUDENT REGISTER
   Excel-like register with school / class /
   division / search / status filters.
   100 rows per page. Soft-deleted excluded.
============================================ */
router.get(
  "/register",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        school_id,
        class_id,
        division_id,
        q,
        photo_status,
        approved_status,
      } = req.query;

      let page = parseInt(
        req.query.page,
        10
      );

      if (
        !Number.isFinite(page) ||
        page < 1
      ) {
        page = 1;
      }

      const LIMIT = 100;

      const conditions = [
        "st.deleted_at IS NULL",
      ];
      const params = [];

      if (school_id) {
        params.push(school_id);
        conditions.push(
          `st.school_id = $${params.length}`
        );
      }

      if (class_id) {
        params.push(class_id);
        conditions.push(
          `st.class_id = $${params.length}`
        );
      }

      if (division_id) {
        params.push(division_id);
        conditions.push(
          `st.division_id = $${params.length}`
        );
      }

      if (
        photo_status ===
          "pending" ||
        photo_status ===
          "completed"
      ) {
        params.push(photo_status);
        conditions.push(
          `st.photo_status = $${params.length}`
        );
      }

      if (
        approved_status ===
        "approved"
      ) {
        conditions.push(
          `st.approved_status = 'approved'`
        );
      } else if (
        approved_status ===
        "pending"
      ) {
        conditions.push(
          `(st.approved_status IS NULL OR st.approved_status <> 'approved')`
        );
      }

      const searchText = (q || "")
        .toString()
        .trim();

      if (searchText !== "") {
        params.push(
          `%${searchText}%`
        );
        conditions.push(
          `EXISTS (
            SELECT 1
            FROM student_field_values sfq
            WHERE sfq.student_id = st.id
              AND sfq.field_key IN ('student_id', 'name')
              AND sfq.field_value ILIKE $${params.length}
          )`
        );
      }

      const where =
        `WHERE ${conditions.join(" AND ")}`;

      /* Filtered total (same conditions as rows) */
      const countRes =
        await db.query(
          `
          SELECT COUNT(DISTINCT st.id) AS total
          FROM students st
          ${where}
          `,
          params
        );

      const total =
        parseInt(
          countRes.rows[0].total,
          10
        ) || 0;

      /* Summary cards share the exact filter
         conditions (no pagination). Counting rules:
         approved = approved_status 'approved';
         pending = every other active student. */
      const summaryRes =
        await db.query(
          `
          SELECT
            COUNT(DISTINCT st.id) AS total,
            COUNT(
              DISTINCT CASE
                WHEN st.approved_status = 'approved'
                THEN st.id
              END
            ) AS approved
          FROM students st
          ${where}
          `,
          params
        );

      const summaryTotal =
        parseInt(
          summaryRes.rows[0].total,
          10
        ) || 0;

      const summaryApproved =
        parseInt(
          summaryRes.rows[0].approved,
          10
        ) || 0;

      const summary = {
        total: summaryTotal,
        approved: summaryApproved,
        pending: Math.max(
          0,
          summaryTotal - summaryApproved
        ),
      };

      const totalPages = Math.max(
        1,
        Math.ceil(total / LIMIT)
      );

      const safePage = Math.min(
        page,
        totalPages
      );

      const safeOffset =
        (safePage - 1) * LIMIT;

      /* Page rows. EAV join restricted to the two
         display keys + MAX aggregation, so rows
         can never multiply. */
      const rowsRes =
        await db.query(
          `
          SELECT
            st.id,
            st.photo_status,
            st.photo_drive_id,
            st.photo_version,
            st.approved_status,
            st.updated_at,
            s.name AS school_name,
            c.class_name,
            d.division_name,
            MAX(
              CASE
                WHEN sf.field_key = 'student_id'
                THEN sf.field_value
              END
            ) AS admission_no,
            MAX(
              CASE
                WHEN sf.field_key = 'name'
                THEN sf.field_value
              END
            ) AS student_name
          FROM students st
          LEFT JOIN schools s
            ON s.id = st.school_id
          LEFT JOIN classes c
            ON c.id = st.class_id
          LEFT JOIN divisions d
            ON d.id = st.division_id
          LEFT JOIN student_field_values sf
            ON sf.student_id = st.id
            AND sf.field_key IN ('student_id', 'name')
          ${where}
          GROUP BY
            st.id,
            s.name,
            c.class_name,
            d.division_name,
            st.photo_status,
            st.photo_drive_id,
            st.photo_version,
            st.approved_status,
            st.updated_at
          ORDER BY st.id
          LIMIT ${LIMIT} OFFSET ${safeOffset}
          `,
          params
        );

      /* Photo thumbnails from stored parts */
      const cloudName =
        process.env.CLOUDINARY_CLOUD_NAME ||
        "";

      const students =
        rowsRes.rows.map((r) => {
          let photoUrl = null;

          if (
            cloudName &&
            r.photo_drive_id
          ) {
            photoUrl = r.photo_version
              ? `https://res.cloudinary.com/${cloudName}/image/upload/w_100,q_auto/v${r.photo_version}/${r.photo_drive_id}.jpg`
              : `https://res.cloudinary.com/${cloudName}/image/upload/w_100,q_auto/${r.photo_drive_id}.jpg`;
          }

          return {
            ...r,
            photo_url: photoUrl,
          };
        });

      /* Filter dropdown data */
      const schoolsRes =
        await db.query(`
          SELECT id, name
          FROM schools
          ORDER BY name
        `);

      let classes = [];
      let divisions = [];

      if (school_id) {
        const classesRes =
          await db.query(
            `
            SELECT id, class_name
            FROM classes
            WHERE school_id = $1
            ORDER BY class_name
            `,
            [school_id]
          );
        classes = classesRes.rows;
      }

      if (class_id) {
        const divisionsRes =
          await db.query(
            `
            SELECT id, division_name
            FROM divisions
            WHERE class_id = $1
            ORDER BY division_name
            `,
            [class_id]
          );
        divisions =
          divisionsRes.rows;
      }

      /* Preserve filters in page links */
      const kept = [];

      if (school_id)
        kept.push(
          `school_id=${encodeURIComponent(school_id)}`
        );
      if (class_id)
        kept.push(
          `class_id=${encodeURIComponent(class_id)}`
        );
      if (division_id)
        kept.push(
          `division_id=${encodeURIComponent(division_id)}`
        );
      if (searchText !== "")
        kept.push(
          `q=${encodeURIComponent(searchText)}`
        );
      if (
        photo_status ===
          "pending" ||
        photo_status === "completed"
      )
        kept.push(
          `photo_status=${photo_status}`
        );
      if (
        approved_status ===
          "approved" ||
        approved_status === "pending"
      )
        kept.push(
          `approved_status=${approved_status}`
        );

      const queryBase =
        kept.length > 0
          ? kept.join("&") + "&"
          : "";

      res.render(
        "admin/register",
        {
          students,
          schools: schoolsRes.rows,
          classes,
          divisions,
          filters: {
            school_id: school_id || "",
            class_id: class_id || "",
            division_id:
              division_id || "",
            q: searchText,
            photo_status:
              photo_status === "pending" ||
              photo_status === "completed"
                ? photo_status
                : "",
            approved_status:
              approved_status ===
                "approved" ||
              approved_status === "pending"
                ? approved_status
                : "",
          },
          total,
          summary,
          page: safePage,
          totalPages,
          queryBase,
        }
      );
    } catch (err) {
      console.error(
        "REGISTER ERROR:",
        err
      );

      res.status(500).send(
        "Server error"
      );
    }
  }
);

/* ============================================
   STUDENT DETAIL (read-only)
   Single-student view for the register.
   No edit / approve / delete actions.
============================================ */
router.get(
  "/student/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const studentRes =
        await db.query(
          `
          SELECT
            st.id,
            st.school_id,
            st.class_id,
            st.division_id,
            st.photo_status,
            st.photo_drive_id,
            st.photo_version,
            st.approved_status,
            st.approved_at,
            st.created_at,
            st.updated_at,
            s.name AS school_name,
            c.class_name,
            d.division_name
          FROM students st
          LEFT JOIN schools s
            ON s.id = st.school_id
          LEFT JOIN classes c
            ON c.id = st.class_id
          LEFT JOIN divisions d
            ON d.id = st.division_id
          WHERE st.id = $1
            AND st.deleted_at IS NULL
          `,
          [req.params.id]
        );

      if (
        studentRes.rows.length === 0
      ) {
        return res.status(404).send(
          "Student not found"
        );
      }

      const student =
        studentRes.rows[0];

      const fieldsRes =
        await db.query(
          `
          SELECT DISTINCT ON (field_key)
            field_key,
            field_value
          FROM student_field_values
          WHERE student_id = $1
          ORDER BY field_key, id DESC
          `,
          [req.params.id]
        );

      const fieldMap = {};
      fieldsRes.rows.forEach((f) => {
        fieldMap[f.field_key] = f.field_value;
      });

      student.admission_no =
        fieldMap["student_id"] || null;
      student.student_name =
        fieldMap["name"] || null;

      const cloudName =
        process.env.CLOUDINARY_CLOUD_NAME ||
        "";

      let photoUrl = null;

      if (
        cloudName &&
        student.photo_drive_id
      ) {
        photoUrl = student.photo_version
          ? `https://res.cloudinary.com/${cloudName}/image/upload/w_400,q_auto/v${student.photo_version}/${student.photo_drive_id}.jpg`
          : `https://res.cloudinary.com/${cloudName}/image/upload/w_400,q_auto/${student.photo_drive_id}.jpg`;
      }

      res.render(
        "admin/student_detail",
        {
          student,
          fields: fieldsRes.rows,
          photoUrl,
        }
      );
    } catch (err) {
      console.error(
        "STUDENT DETAIL ERROR:",
        err
      );

      res.status(500).send(
        "Server error"
      );
    }
  }
);

/* ============================================
   API CLASSES
============================================ */
router.get(
  "/api/classes/:school_id",
  async (req, res) => {
    try {
      const result =
        await db.query(
          `
        SELECT id, class_name
        FROM classes
        WHERE school_id = $1
        ORDER BY class_name
      `,
          [
            req.params
              .school_id,
          ]
        );

      res.json(
        result.rows
      );
    } catch (err) {
      res.status(500).json({
        error:
          "Failed to load classes",
      });
    }
  }
);

/* ============================================
   API DIVISIONS
============================================ */
router.get(
  "/api/divisions/:class_id",
  async (req, res) => {
    try {
      const result =
        await db.query(
          `
        SELECT id, division_name
        FROM divisions
        WHERE class_id = $1
        ORDER BY division_name
      `,
          [
            req.params
              .class_id,
          ]
        );

      res.json(
        result.rows
      );
    } catch (err) {
      res.status(500).json({
        error:
          "Failed to load divisions",
      });
    }
  }
);

/* ============================================
   SCHOOL VIEW PAGE
============================================ */
router.get(
  "/school/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const id =
        req.params.id;

      const school =
        await db.query(
          `
        SELECT *
        FROM schools
        WHERE id = $1
      `,
          [id]
        );

      const students =
        await db.query(
          `
        SELECT
          st.id,
          st.approved_status,
          MAX(CASE
            WHEN sf.field_key='student_id'
            THEN sf.field_value
          END) AS student_code,

          MAX(CASE
            WHEN sf.field_key='name'
            THEN sf.field_value
          END) AS name

        FROM students st
        LEFT JOIN student_field_values sf
          ON sf.student_id = st.id

        WHERE st.school_id = $1

        GROUP BY
          st.id,
          st.approved_status

        ORDER BY st.id DESC
      `,
          [id]
        );

        const structure =
  await db.query(
    `
    SELECT
      c.id AS class_id,
      c.class_name,

      d.id AS division_id,
      d.division_name,

      COUNT(st.id) AS total_students

    FROM classes c

    LEFT JOIN divisions d
      ON d.class_id = c.id

    LEFT JOIN students st
      ON st.class_id = c.id
     AND st.division_id = d.id
     AND st.deleted_at IS NULL

    WHERE c.school_id = $1

    GROUP BY
      c.id,
      c.class_name,
      d.id,
      d.division_name

    ORDER BY
      c.class_name,
      d.division_name
  `,
    [id]
  );

      res.render(
  "admin/school_view",
  {
    school:
      school.rows[0],

    students:
      students.rows,

    structure:
      structure.rows,
  }
);
    } catch (err) {
      console.error(
        "SCHOOL VIEW ERROR:",
        err
      );

      res.status(500).send(
        "Error"
      );
    }
  }
);

/* ============================================
   DELETE SCHOOL
============================================ */
router.get(
  "/delete-school/:id",
  requireAdmin,
  async (req, res) => {
    const client =
      await db.connect();

    try {
      const id =
        req.params.id;

      await client.query(
        "BEGIN"
      );

      await client.query(
        `
        DELETE FROM student_field_values
        WHERE student_id IN (
          SELECT id
          FROM students
          WHERE school_id = $1
        )
      `,
        [id]
      );

      await client.query(
        `
        DELETE FROM students
        WHERE school_id = $1
      `,
        [id]
      );

      await client.query(
        `
        DELETE FROM school_student_schema
        WHERE school_id = $1
      `,
        [id]
      );

      await client.query(
        `
        DELETE FROM classes
        WHERE school_id = $1
      `,
        [id]
      );

      await client.query(
        `
        DELETE FROM schools
        WHERE id = $1
      `,
        [id]
      );

      await client.query(
        "COMMIT"
      );

      res.redirect(
        "/admin/schools"
      );
    } catch (err) {
      await client.query(
        "ROLLBACK"
      );

      console.error(
        "DELETE SCHOOL ERROR:",
        err
      );

      res.send(
        "Delete failed"
      );
    } finally {
      client.release();
    }
  }
);

/* ============================================
   REMOVE APPROVAL
============================================ */
router.get("/unapprove/:id", requireAdmin, async (req, res) => {
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

    res.redirect(
      req.get("Referrer") ||
      "/admin/schools"
    );

  } catch (err) {
    console.error("UNAPPROVE ERROR:", err);
    res.send("Failed");
  }
});

/* ==========================================
   ADD CLASS
========================================== */
router.post(
  "/school/:schoolId/add-class",
  async (req, res) => {
    try {
      const { schoolId } = req.params;
      const { class_name } = req.body;

      const normalized = (class_name || "")
        .toString()
        .trim();

      if (normalized === "") {
        return res.redirect(
          `/admin/school/${schoolId}`
        );
      }

      /* Friendly duplicate check, consistent
         with imports (case-insensitive). */
      const existing =
        await db.query(
          `
          SELECT id
          FROM classes
          WHERE school_id = $1
            AND LOWER(TRIM(class_name)) = LOWER(TRIM($2))
          `,
          [schoolId, normalized]
        );

      if (existing.rows.length > 0) {
        return res.redirect(
          `/admin/school/${schoolId}`
        );
      }

      await db.query(
        `
        INSERT INTO classes
        (
          school_id,
          class_name
        )
        VALUES
        (
          $1,
          $2
        )
        `,
        [
          schoolId,
          normalized,
        ]
      );

      res.redirect(
        `/admin/school/${schoolId}`
      );

    } catch (err) {
      /* Concurrent duplicate race: unique
         constraint backstop, no internals leaked. */
      if (err && err.code === "23505") {
        return res.redirect(
          `/admin/school/${req.params.schoolId}`
        );
      }

      console.error(
        "ADD CLASS ERROR:",
        err
      );

      res.send(
        "Failed to add class"
      );
    }
  }
);

/* ============================================
   ADD DIVISION
============================================ */
router.post(
  "/school/:id/add-division",
  requireAdmin,
  async (req, res) => {
    try {
      const schoolId =
        req.params.id;

      const {
        class_id,
        division_name,
      } = req.body;

      if (
        !class_id ||
        !division_name
      ) {
        return res.redirect(
          `/admin/school/${schoolId}`
        );
      }

      // prevent duplicate
      const existing =
        await db.query(
          `
          SELECT id
          FROM divisions
          WHERE class_id = $1
            AND LOWER(division_name) = LOWER($2)
        `,
          [
            class_id,
            division_name,
          ]
        );

      if (
        existing.rows.length >
        0
      ) {
        return res.redirect(
          `/admin/school/${schoolId}`
        );
      }

      await db.query(
        `
        INSERT INTO divisions
        (class_id, division_name)
        VALUES ($1, $2)
      `,
        [
          class_id,
          division_name,
        ]
      );

      res.redirect(
        `/admin/school/${schoolId}`
      );
    } catch (err) {
      console.error(
        "ADD DIVISION ERROR:",
        err
      );

      res.send(
        "Failed to add division"
      );
    }
  }
);

module.exports = router;
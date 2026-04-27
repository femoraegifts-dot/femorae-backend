/**
 * ============================================
 *  ADMIN ROUTES — FEMORAE ID SYSTEM
 *  (UPDATED FOR POSTGRESQL)
 * ============================================
 */

const express = require("express");
const router = express.Router();
const db = require("../config/db");

console.log("✅ admin.js loaded");

/**
 * ============================================
 *  AUTH MIDDLEWARE
 * ============================================
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin === true) return next();
  return res.redirect("/admin/login");
}

/**
 * ============================================
 *  AUTHENTICATION
 * ============================================
 */
router.get("/login", (req, res) => {
  res.render("admin/login", { error: null });
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

  res.render("admin/login", { error: "Invalid credentials" });
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

/**
 * ============================================
 *  DASHBOARD
 * ============================================
 */
router.get("/dashboard", requireAdmin, async (req, res) => {
  try {
    // 🔥 UPDATED: pg returns { rows } instead of [[result]]
    const schoolsResult = await db.query(
      "SELECT COUNT(*) AS total_schools FROM schools"
    );

    const studentsResult = await db.query(
      "SELECT COUNT(*) AS total_students FROM students"
    );

    res.render("admin/dashboard", {
      metrics: {
        totalSchools: schoolsResult.rows[0].total_schools,
        totalStudents: studentsResult.rows[0].total_students,
      },
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).send("Server error");
  }
});

/**
 * ============================================
 *  SCHOOLS MANAGEMENT
 * ============================================
 */

// List schools
router.get("/schools", requireAdmin, async (req, res) => {
  console.log("📌 /admin/schools HIT");

  try {
    // 🔥 UPDATED: pg result handling
    const result = await db.query(`
      SELECT 
        s.id,
        s.name,
        s.username,
        COUNT(st.id) AS total_students
      FROM schools s
      LEFT JOIN students st ON st.school_id = s.id
      GROUP BY s.id
      ORDER BY s.id DESC
    `);

    res.render("admin/schools_list", { schools: result.rows });
  } catch (err) {
    console.error("LIST SCHOOLS ERROR:", err);
    res.status(500).send("Server error");
  }
});

// Show add school form
router.get("/schools/add", requireAdmin, (req, res) => {
  res.render("admin/add_school", { error: null, success: null });
});

// Handle add school
router.post("/schools/add", requireAdmin, async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.render("admin/add_school", {
      error: "Name, username and password are required",
      success: null,
    });
  }

  try {
    // 🔥 UPDATED: ? → $1, $2, $3
    await db.query(
      `INSERT INTO schools (name, username, password)
       VALUES ($1, $2, $3)`,
      [name, username, password]
    );

    res.render("admin/add_school", {
      error: null,
      success: "School added successfully",
    });
  } catch (err) {
    console.error("ADD SCHOOL ERROR:", err);

    res.render("admin/add_school", {
      error: "Username already exists",
      success: null,
    });
  }
});

/**
 * ============================================
 *  STUDENT IMPORT (CSV / EXCEL)
 * ============================================
 */

// Show import page
router.get("/students/import", requireAdmin, async (req, res) => {
  console.log("📌 /admin/students/import HIT");

  try {
    // 🔥 UPDATED: pg result handling
    const result = await db.query(
      "SELECT id, name FROM schools ORDER BY name"
    );

    res.render("admin/import_students", { schools: result.rows });
  } catch (err) {
    console.error("IMPORT PAGE ERROR:", err);
    res.status(500).send("Server error");
  }
});

/**
 * ============================================
 *  EXPORT PAGE (UI)
 * ============================================
 */
router.get("/api/classes/:school_id", async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT id, class_name
      FROM classes
      WHERE school_id = $1
      ORDER BY class_name
      `,
      [req.params.school_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load classes" });
  }
});

router.get("/api/divisions/:class_id", async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT id, division_name
      FROM divisions
      WHERE class_id = $1
      ORDER BY division_name
      `,
      [req.params.class_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load divisions" });
  }
});

router.get("/exports", requireAdmin, async (req, res) => {
  console.log("📌 /admin/exports HIT");

  try {
    const schools = await db.query(
      "SELECT id, name FROM schools ORDER BY name"
    );

    res.render("admin/exports", {
      schools: schools.rows,
    });

  } catch (err) {
    console.error("EXPORT PAGE ERROR:", err);
    res.status(500).send("Server error");
  }
});

/* =====================================================
   DELETE SCHOOL FULL DATA
===================================================== */
router.delete("/delete-school/:id", async (req, res) => {
  const client = await db.connect();

  try {
    const schoolId = req.params.id;

    await client.query("BEGIN");

    await client.query(
      `
      DELETE FROM student_field_values
      WHERE student_id IN (
        SELECT id FROM students
        WHERE school_id = $1
      )
      `,
      [schoolId]
    );

    await client.query(
      `
      DELETE FROM students
      WHERE school_id = $1
      `,
      [schoolId]
    );

    await client.query(
      `
      DELETE FROM school_student_schema
      WHERE school_id = $1
      `,
      [schoolId]
    );

    await client.query(
      `
      DELETE FROM classes
      WHERE school_id = $1
      `,
      [schoolId]
    );

    await client.query(
      `
      DELETE FROM schools
      WHERE id = $1
      `,
      [schoolId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "School deleted fully",
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error(
      "DELETE SCHOOL ERROR:",
      err
    );

    res.status(500).json({
      error: "Failed to delete school",
    });
  } finally {
    client.release();
  }
});

module.exports = router;
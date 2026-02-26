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
 *  EXPORT ROUTER
 * ============================================
 */
module.exports = router;
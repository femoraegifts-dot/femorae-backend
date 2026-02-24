/**
 * ============================================
 *  ADMIN ROUTES — FEMORAE ID SYSTEM
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
  const [[schools]] = await db.query(
    "SELECT COUNT(*) AS totalSchools FROM schools"
  );
  const [[students]] = await db.query(
    "SELECT COUNT(*) AS totalStudents FROM students"
  );

  res.render("admin/dashboard", {
    metrics: {
      totalSchools: schools.totalSchools,
      totalStudents: students.totalStudents,
    },
  });
});

/**
 * ============================================
 *  SCHOOLS MANAGEMENT
 * ============================================
 */

// List schools
router.get("/schools", requireAdmin, async (req, res) => {
  console.log("📌 /admin/schools HIT");

  const [schools] = await db.query(`
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

  res.render("admin/schools_list", { schools });
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
    await db.query(
      `INSERT INTO schools (name, username, password)
       VALUES (?, ?, ?)`,
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

  const [schools] = await db.query(
    "SELECT id, name FROM schools ORDER BY name"
  );

  res.render("admin/import_students", { schools });
});

/**
 * ============================================
 *  EXPORT ROUTER
 * ============================================
 */
module.exports = router;

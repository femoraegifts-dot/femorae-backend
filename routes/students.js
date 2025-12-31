const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * GET students
 * Filter by class & division (section)
 * Example:
 * /students?class=LKG&division=A
 */
router.get("/", async (req, res) => {
  const { class: className, division } = req.query;

  try {
    let sql = "SELECT * FROM students WHERE 1=1";
    const params = [];

    if (className) {
      sql += " AND class = ?";
      params.push(className);
    }

    if (division) {
      sql += " AND division = ?";
      params.push(division);
    }

    sql += " ORDER BY name ASC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
  console.error("🔥 GET students error FULL:", err);
  res.status(500).json({
    error: "Failed to fetch students",
    details: err.message, });
  }
});

/**
 * GET single student by student_id
 * /students/PPTMY001
 */
router.get("/:student_id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM students WHERE student_id = ?",
      [req.params.student_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("GET student error:", err);
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

/**
 * POST add new student
 */
router.post("/", async (req, res) => {
  const {
    student_id,
    name,
    class: className,
    division,
    house,
    place,
    post,
    pin,
    mobile,
  } = req.body;

  try {
    await db.query(
      `INSERT INTO students 
      (student_id, name, class, division, house, place, post, pin, mobile, photo_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        student_id,
        name,
        className,
        division,
        house,
        place,
        post,
        pin,
        mobile,
      ]
    );

    res.json({ success: true, message: "Student added successfully" });
  } catch (err) {
    console.error("POST student error:", err);
    res.status(500).json({ error: "Failed to add student" });
  }
});

/**
 * PUT update photo status
 * Used after camera / upload
 */
router.put("/:student_id/photo-status", async (req, res) => {
  const { photo_status, photo_name } = req.body;

  try {
    await db.query(
      "UPDATE students SET photo_status=?, photo_name=? WHERE student_id=?",
      [photo_status, photo_name, req.params.student_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE photo status error:", err);
    res.status(500).json({ error: "Failed to update photo status" });
  }
});

/**
 * DELETE student (optional, admin only)
 */
router.delete("/:student_id", async (req, res) => {
  try {
    await db.query("DELETE FROM students WHERE student_id = ?", [
      req.params.student_id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE student error:", err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

module.exports = router;

/* =====================================================
   GET STUDENT LIST
===================================================== */
router.get("/", async (req, res) => {
  try {
    const { school_id, class_id, division_id } = req.query;

    if (!school_id || !class_id || !division_id) {
      return res.status(400).json({
        error: "school_id, class_id, division_id required",
      });
    }

    const result = await db.query(
      `
      SELECT
        st.id,
        st.photo_status,
        st.photo_drive_id,
        st.approved_status,
        MAX(CASE WHEN sf.field_key = 'student_id' THEN sf.field_value END) AS student_id,
        MAX(CASE WHEN sf.field_key = 'name' THEN sf.field_value END) AS name
      FROM students st
      LEFT JOIN student_field_values sf
        ON sf.student_id = st.id
      WHERE st.school_id = $1
        AND st.class_id = $2
        AND st.division_id = $3
        AND st.deleted_at IS NULL
      GROUP BY st.id
      ORDER BY
        MAX(CASE WHEN sf.field_key = 'student_id' THEN sf.field_value END)
      `,
      [school_id, class_id, division_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("STUDENT LIST ERROR:", err);
    res.status(500).json({ error: "Failed to load students" });
  }
});
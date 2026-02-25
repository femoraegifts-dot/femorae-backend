require("dotenv").config();
console.log("🔥 INDEX.JS RUNNING");

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

const app = express();

/* =========================
   DATABASE (LOAD ONCE)
========================= */
//const db = require("./config/db");

/* =========================
   MIDDLEWARES
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "femorae_admin_secret",
    resave: false,
    saveUninitialized: false,
  })
);

/* =========================
   VIEW ENGINE (ADMIN PANEL)
========================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* =========================
   ROUTES
========================= */
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const sectionRoutes = require("./routes/sections");
const uploadRoutes = require("./routes/upload");
const dashboardRoutes = require("./routes/dashboard");
const importRoutes = require("./routes/import");


// Admin (web)
app.use("/admin", adminRoutes);

// School app APIs
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
//app.use("/students-v2", studentV2Routes);
app.use("/classes", sectionRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/import", importRoutes);

// Uploads
app.use("/api/upload", uploadRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Femorae Backend Running 🚀");
});
app.get("/test", (req, res) => {
  res.json({ status: "backend alive" });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server started on port ${PORT}`);
});

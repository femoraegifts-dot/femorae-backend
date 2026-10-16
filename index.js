require("dotenv").config();

/* Session secret is mandatory. Fail before serving
   anything rather than falling back to a default. */
if (
  !process.env.SESSION_SECRET ||
  process.env.SESSION_SECRET.trim() === ""
) {
  console.error(
    "FATAL: SESSION_SECRET is not set. Refusing to start."
  );
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const pgSession = require("connect-pg-simple")(session);
const db = require("./config/db");

const app = express();

/* Render terminates TLS at its edge proxy and forwards
   plain HTTP to this service (single hop). Trust exactly
   that hop so Secure cookies work behind the proxy. */
app.set("trust proxy", 1);

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
    store: new pgSession({
      pool: db,
      tableName: "session",
      createTableIfMissing: false,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    },
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
app.use("/admin", require("./routes/admin"));

// School app APIs
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
//app.use("/students", require("./routes/students"));
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

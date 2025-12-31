console.log("🔥 INDEX.JS RUNNING");

const express = require("express");
const cors = require("cors");

const app = express();

// DB
require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const sectionRoutes = require("./routes/sections");
const uploadRoutes = require("./routes/upload");
const dashboardRoutes = require("./routes/dashboard");

// Middlewares
app.use(cors());
app.use(express.json());

// Route registration
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/classes", sectionRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Femorae ID Backend is running 🚀");
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});

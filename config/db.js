const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // ✅ Always use SSL for Render / cloud DB
  ssl: {
    rejectUnauthorized: false,
  },

  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// 🔥 Debug logs
pool.on("connect", () => {
  console.log("✅ DB Connected");
});

pool.on("error", (err) => {
  console.error("❌ DB Error:", err);
});

module.exports = pool;
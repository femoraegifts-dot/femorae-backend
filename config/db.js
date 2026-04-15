const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },

  idleTimeoutMillis: 30000,        // 🔥 close idle connections safely
  connectionTimeoutMillis: 5000,   // 🔥 wait before failing
});

pool.on("connect", () => {
  console.log("✅ DB Connected");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected DB error:", err);
});

module.exports = pool;
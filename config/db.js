const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log("✅ DB Connected");
});

pool.on("error", (err) => {
  console.error("❌ DB Error:", err);
});

module.exports = pool;
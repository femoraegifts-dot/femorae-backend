const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render PostgreSQL (incl. internal URLs) enforces SSL; rejectUnauthorized:false
  // is required because Render presents a self-signed chain to the driver.
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL Connected");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL Error:", err);
});

module.exports = pool;
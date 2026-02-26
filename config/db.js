const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Render internal DB does NOT need SSL
});

console.log("✅ PostgreSQL connected (Render)");

module.exports = pool;
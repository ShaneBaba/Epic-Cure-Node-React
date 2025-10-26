const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Azure PG (dev)
});
module.exports = { query: (q, p) => pool.query(q, p), pool };

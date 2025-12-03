require("dotenv").config();            

const { Pool } = require("pg");

console.log("DATABASE_URL =", process.env.DATABASE_URL); 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Azure PG
});

// HARDCODED COONNECTION TO AZURE
/*(const pool = new Pool({
  host: "pg-epiccure-devs.postgres.database.azure.com",
  port: 5432,
  user: "pgadmin",            // <-- NOT pgadmin@pg-epiccure-devs
  password: "EpicCureDB!",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});
*/
module.exports = { query: (q, p) => pool.query(q, p), pool };

const bcrypt = require('bcryptjs');
const db = require('../db');


function mapRowToUser(row) {
  if (!row) return null;
  return {
    id: row.user_id,
    username: row.username,
    email: row.email,
    role: row.role,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

async function findByUsername(username) {
  const result = await db.query(
    `
      SELECT user_id, username, email, role, password_hash, created_at
      FROM users
      WHERE LOWER(username) = LOWER($1)
      LIMIT 1
    `,
    [String(username)]
  );

  return mapRowToUser(result.rows[0]);
}

async function createUser({ username, password, email, role = 'GrantWriter' }) {
  const existing = await findByUsername(username);
  if (existing) {
    throw new Error('USERNAME_TAKEN');
  }

  if (!email) {
    email = `${username}@dummy.local`;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await db.query(
    `
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, username, email, role, password_hash, created_at
    `,
    [username, email, passwordHash, role]
  );

  return mapRowToUser(result.rows[0]);
}

function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

module.exports = {
  findByUsername,
  createUser,
  publicUser,
};

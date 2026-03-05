const bcrypt = require('bcryptjs');
const db = require('../db');
const crypto = require('crypto');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeUsername(username) {
  return String(username || '').trim();
}

function mapRowToUser(row) {
  if (!row) return null;
  return {
    id: row.user_id,
    username: row.username,
    email: row.email,
    role: row.role,
    status: row.status,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

async function findByUsername(username) {
  const u = normalizeUsername(username);
  if (!u) return null;

  const result = await db.query(
    `
      SELECT user_id, username, email, role, status, password_hash, created_at
      FROM users
      WHERE LOWER(username) = LOWER($1)
      LIMIT 1
    `,
    [u]
  );

  return mapRowToUser(result.rows[0]);
}

async function findByEmail(email) {
  const e = normalizeEmail(email);
  if (!e) return null;

  const result = await db.query(
    `
      SELECT user_id, username, email, role, status, password_hash, created_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [e]
  );

  return mapRowToUser(result.rows[0]);
}

async function createUser({ username, password, email, role = 'GRANT_WRITER' }) {
  const e = normalizeEmail(email);
  const u = normalizeUsername(username);

  if (!e) {
    throw new Error('EMAIL_REQUIRED');
  }

  // Enforce unique email
  const existingByEmail = await findByEmail(e);
  if (existingByEmail) {
    throw new Error('EMAIL_TAKEN');
  }

  // Optional: enforce unique username only if provided
  if (u) {
    const existingByUsername = await findByUsername(u);
    if (existingByUsername) {
      throw new Error('USERNAME_TAKEN');
    }
  }

  if (!password) {
    throw new Error('PASSWORD_REQUIRED');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await db.query(
    `
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, username, email, role, status, password_hash, created_at
    `,
    [u || null, e, passwordHash, role]
  );

  return mapRowToUser(result.rows[0]);
}

//For invites: always create with a dummy username (username is NOT NULL in the DB)
async function createInvitedUser({ email, role = 'GRANT_WRITER' }) {
  const e = normalizeEmail(email);
  if (!e) throw new Error('EMAIL_REQUIRED');

  // Enforce unique email
  const existingByEmail = await findByEmail(e);
  if (existingByEmail) throw new Error('EMAIL_TAKEN');

  // Dummy username to satisfy NOT NULL constraint
  let dummyUsername = `invited-${crypto.randomBytes(6).toString('hex')}`;

  for (let i = 0; i < 5; i++) {
    const existing = await findByUsername(dummyUsername);
    if (!existing) break;
    dummyUsername = `invited-${crypto.randomBytes(6).toString('hex')}`;
    if (i === 4) throw new Error('USERNAME_TAKEN');
  }

  // Placeholder password (required by schema). Will be replaced on accept-invite.
  const placeholderPassword = crypto.randomBytes(32).toString('hex');
  const passwordHash = await bcrypt.hash(placeholderPassword, 10);

  const result = await db.query(
    `
      INSERT INTO users (username, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, 'INVITED')
      RETURNING user_id, username, email, role, status, password_hash, created_at
    `,
    [dummyUsername, e, passwordHash, role]
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
  findByEmail,
  createUser,
  createInvitedUser,
  publicUser,
};
const crypto = require("crypto");
const db = require("../db");

function sha256(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

function generate6DigitCode() {
  const n = crypto.randomInt(0, 1000000);
  return String(n).padStart(6, "0");
}

async function createVerificationCode({ userId, ttlMinutes = 10, purpose = "PASSWORD_RESET" }) {
  const code = generate6DigitCode();
  const codeHash = sha256(code);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await db.query("BEGIN");
  try {
    await db.query(
      `
      UPDATE password_resets
      SET used_at = NOW()
      WHERE user_id = $1
        AND purpose = $2
        AND used_at IS NULL
        AND expires_at > NOW()
      `,
      [userId, purpose]
    );

    await db.query(
      `
      INSERT INTO password_resets (user_id, code_hash, expires_at, purpose)
      VALUES ($1, $2, $3, $4)
      `,
      [userId, codeHash, expiresAt, purpose]
    );

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }

  return { code, expiresAt };
}

async function findValidByUserAndCode({ userId, code, purpose = "PASSWORD_RESET" }) {
  const codeHash = sha256(String(code).trim());

  const result = await db.query(
    `
    SELECT reset_id, user_id, expires_at, used_at, purpose
    FROM password_resets
    WHERE user_id = $1
      AND code_hash = $2
      AND purpose = $3
    ORDER BY reset_id DESC
    LIMIT 1
    `,
    [userId, codeHash, purpose]
  );

  const row = result.rows[0];
  if (!row) return null;
  if (row.used_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;

  return row;
}

async function markUsed(resetId) {
  await db.query(`UPDATE password_resets SET used_at = NOW() WHERE reset_id = $1`, [resetId]);
}

module.exports = { createVerificationCode, findValidByUserAndCode, markUsed };
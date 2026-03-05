const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { sendEmail } = require("../services/emailService");
const {
  createVerificationCode,
  findValidByUserAndCode,
  markUsed,
} = require("../models/passwordResetModel");
const {
  findByEmail,
  findByUsername,
  publicUser,
  createInvitedUser,
} = require("../models/loginModels");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

// Expiry requirements
const PASSWORD_RESET_TTL_MINUTES = 10;
const INVITE_TTL_MINUTES = 60 * 8;

function normalizeRole(role) {
  if (!role) return null;
  const r = String(role).trim().toUpperCase();
  if (r === "GRANTWRITER") return "GRANT_WRITER";
  if (r === "GRANT_WRITER") return "GRANT_WRITER";
  if (r === "ADMIN") return "ADMIN";
  return null;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeUsername(username) {
  return String(username || "").trim();
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const e = normalizeEmail(email);

    const user = await findByEmail(e);
    if (!user) return res.status(401).json({ message: "invalid credentials" });

    // Block disabled + invited users
    const status = user.status ? String(user.status).toUpperCase() : "ACTIVE";
    if (status !== "ACTIVE") {
      return res
        .status(403)
        .json({ message: "account not active, contact an administrator" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "invalid credentials" });

    const role = normalizeRole(user.role);
    if (!role) {
      return res.status(500).json({
        message: "account role not configured, contact an administrator",
      });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        username: user.username,
        role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      token,
      user: publicUser(user),
      role,
    });
  } catch (e) {
    console.error("[login]", e);
    return res.status(500).json({ message: "internal error" });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};
    const e = normalizeEmail(email);

    const generic = {
      message: "If an account exists, we emailed you a 6-digit code.",
    };
    if (!e) return res.status(200).json(generic);

    const user = await findByEmail(e);
    if (!user) return res.status(200).json(generic);

    const { code } = await createVerificationCode({
      userId: user.id,
      ttlMinutes: PASSWORD_RESET_TTL_MINUTES,
      purpose: "PASSWORD_RESET",
    });

    const FRONTEND = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetPage = `${FRONTEND}/reset-password`;

    await sendEmail({
      to: user.email,
      subject: "Epic Cure Password Reset Code",
      text:
        `Your password reset code is: ${code}\n\n` +
        `This code expires in ${PASSWORD_RESET_TTL_MINUTES} minutes.\n\n` +
        `If you did not request this, you can ignore this email.`,
      html: `
        <p>Your <strong>Epic Cure</strong> password reset code is:</p>
        <p style="font-size:20px; font-weight:700; letter-spacing:2px; margin:12px 0;">${code}</p>
        <p>This code expires in <strong>${PASSWORD_RESET_TTL_MINUTES} minutes</strong>.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });

    return res.status(200).json(generic);
  } catch (e) {
    console.error("[forgotPassword]", e);
    return res.status(500).json({ message: "internal error" });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, code, password } = req.body || {};
    const e = normalizeEmail(email);

    if (!e || !code || !password) {
      return res
        .status(400)
        .json({ message: "email, code, and password are required" });
    }

    const user = await findByEmail(e);
    if (!user) {
      return res.status(400).json({ message: "invalid or expired code" });
    }

    const row = await findValidByUserAndCode({
      userId: user.id,
      code,
      purpose: "PASSWORD_RESET",
    });

    if (!row) {
      return res.status(400).json({ message: "invalid or expired code" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query("BEGIN");
    try {
      await db.query(`UPDATE users SET password_hash = $1 WHERE user_id = $2`, [
        passwordHash,
        user.id,
      ]);

      await markUsed(row.reset_id);

      await db.query("COMMIT");
    } catch (txErr) {
      await db.query("ROLLBACK");
      throw txErr;
    }

    return res.status(200).json({ message: "password updated" });
  } catch (e) {
    console.error("[resetPassword]", e);
    return res.status(500).json({ message: "internal error" });
  }
}

async function inviteUser(req, res) {
  try {
    const { email, role } = req.body || {};
    const e = normalizeEmail(email);
    if (!e) return res.status(400).json({ message: "email is required" });

    const normalizedRole = normalizeRole(role) || "GRANT_WRITER";

    const FRONTEND = process.env.FRONTEND_URL || "http://localhost:3000";
    const acceptLink = `${FRONTEND}/accept-invite`;

    const existing = await findByEmail(e);
    if (existing) {
      const status = String(existing.status || "ACTIVE").toUpperCase();

      if (status === "ACTIVE") {
        return res
          .status(409)
          .json({ message: "User already exists and is active." });
      }

      await db.query(
        `UPDATE users SET role = $1, status = 'INVITED' WHERE user_id = $2`,
        [normalizedRole, existing.id]
      );

      const { code } = await createVerificationCode({
        userId: existing.id,
        ttlMinutes: INVITE_TTL_MINUTES,
        purpose: "INVITE",
      });

      await sendEmail({
        to: e,
        subject: "You're invited to Epic Cure",
        text:
          `You've been invited to Epic Cure.\n\n` +
          `Invite Code: ${code}\n\n` +
          `Activate your account here:\n${acceptLink}\n\n` +
          `Enter your email address and the invite code to activate your account.\n\n` +
          `This code expires in 8 hours.`,
        html: `
          <p>You’ve been invited to <strong>Epic Cure</strong>.</p>
          <p><strong>Invite Code:</strong></p>
          <p style="font-size:20px; font-weight:700; letter-spacing:2px; margin:12px 0;">${code}</p>
          <p>
            Activate your account here:<br/>
            <a href="${acceptLink}" style="color:#2563eb; font-weight:600;">Accept your invitation</a>
          </p>
          <p>Enter your email address and the invite code above to activate your account.</p>
          <p>This code expires in <strong>8 hours</strong>.</p>
          <p>If you did not expect this invitation, you can ignore this email.</p>
        `,
      });

      return res.status(200).json({ message: "Invite sent." });
    }

    const user = await createInvitedUser({
      email: e,
      role: normalizedRole,
    });

    const { code } = await createVerificationCode({
      userId: user.id,
      ttlMinutes: INVITE_TTL_MINUTES,
      purpose: "INVITE",
    });

    await sendEmail({
      to: e,
      subject: "You're invited to Epic Cure",
      text:
        `You've been invited to Epic Cure.\n\n` +
        `Invite Code: ${code}\n\n` +
        `Activate your account here:\n${acceptLink}\n\n` +
        `Enter your email address and the invite code to activate your account.\n\n` +
        `This code expires in 8 hours.`,
      html: `
        <p>You’ve been invited to <strong>Epic Cure</strong>.</p>
        <p><strong>Invite Code:</strong></p>
        <p style="font-size:20px; font-weight:700; letter-spacing:2px; margin:12px 0;">${code}</p>
        <p>
          Activate your account here:<br/>
          <a href="${acceptLink}" style="color:#2563eb; font-weight:600;">Accept your invitation</a>
        </p>
        <p>Enter your email address and the invite code above to activate your account.</p>
        <p>This code expires in <strong>8 hours</strong>.</p>
        <p>If you did not expect this invitation, you can ignore this email.</p>
      `,
    });

    return res.status(200).json({ message: "Invite sent." });
  } catch (e) {
    console.error("[inviteUser]", e);

    if (e.message === "EMAIL_TAKEN")
      return res.status(409).json({ message: "Email already in use." });
    if (e.message === "EMAIL_REQUIRED")
      return res.status(400).json({ message: "Email is required." });

    return res.status(500).json({ message: "internal error" });
  }
}

async function acceptInvite(req, res) {
  try {
    const { email, code, password, username } = req.body || {};

    const e = normalizeEmail(email);
    const u = normalizeUsername(username);

    if (!e || !code || !password || !u) {
      return res
        .status(400)
        .json({ message: "email, code, username, and password are required" });
    }

    const user = await findByEmail(e);
    if (!user) return res.status(400).json({ message: "invalid or expired code" });

    const status = String(user.status || "").toUpperCase();
    if (status !== "INVITED") {
      return res
        .status(400)
        .json({ message: "This account is not in an invited state." });
    }

    const row = await findValidByUserAndCode({
      userId: user.id,
      code,
      purpose: "INVITE",
    });

    if (!row) {
      return res.status(400).json({ message: "invalid or expired code" });
    }

    const existingUser = await findByUsername(u);
    if (existingUser && existingUser.id !== user.id) {
      return res.status(409).json({ message: "Username already taken." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query("BEGIN");
    try {
      await db.query(
        `UPDATE users
         SET username = $1, password_hash = $2, status = 'ACTIVE'
         WHERE user_id = $3`,
        [u, passwordHash, user.id]
      );

      await markUsed(row.reset_id);

      await db.query("COMMIT");
    } catch (txErr) {
      await db.query("ROLLBACK");
      throw txErr;
    }

    return res
      .status(200)
      .json({ message: "Invitation accepted. You can now log in." });
  } catch (e) {
    console.error("[acceptInvite]", e);
    return res.status(500).json({ message: "internal error" });
  }
}

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  inviteUser,
  acceptInvite,
};
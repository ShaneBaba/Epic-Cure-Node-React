const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findByUsername, createUser, publicUser } = require('../models/loginModels');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

function normalizeRole(role) {
  if (!role) return null;
  const r = String(role).trim().toUpperCase();
  if (r === 'GRANTWRITER') return 'GRANT_WRITER';
  if (r === 'GRANT_WRITER') return 'GRANT_WRITER';
  if (r === 'ADMIN') return 'ADMIN';
  return null;
}

async function login(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    const user = await findByUsername(username);
    if (!user) return res.status(401).json({ message: 'invalid credentials' });

    // Optional but recommended: block disabled users
    const status = user.status ? String(user.status).toUpperCase() : 'ACTIVE';
    if (status !== 'ACTIVE') {
      return res.status(403).json({ message: 'account disabled, contact an administrator' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'invalid credentials' });

    const role = normalizeRole(user.role);
    if (!role) {
      return res.status(500).json({
        message: 'account role not configured, contact an administrator'
      });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
        role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: publicUser(user),
      role
    });
  } catch (e) {
    console.error('[login]', e);
    res.status(500).json({ message: 'internal error' });
  }
}
module.exports = { login };

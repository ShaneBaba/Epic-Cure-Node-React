// controllers/loginController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findByUsername, createUser, publicUser } = require('../models/loginModels');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';


async function login(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'username and password are required' });

    const user = await findByUsername(username);
    if (!user) return res.status(401).json({ message: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'invalid credentials' });

    const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    console.error('[login]', e);
    res.status(500).json({ message: 'internal error' });
  }
}

async function register(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'username and password are required' });

    const user = await createUser({ username, password });
    const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (e) {
    if (e.message === 'USERNAME_TAKEN') return res.status(409).json({ message: 'username already exists' });
    console.error('[register]', e);
    res.status(500).json({ message: 'internal error' });
  }
}

module.exports = { login, register };

const bcrypt = require('bcryptjs');

const users = [];

async function findByUsername(username) {
  return users.find(u => u.username.toLowerCase() === String(username).toLowerCase()) || null;
}

async function createUser({ username, password}) {
  const exists = await findByUsername(username);
  if (exists) throw new Error('USERNAME_TAKEN');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: String(users.length + 1),
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
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
  _users: users,
};
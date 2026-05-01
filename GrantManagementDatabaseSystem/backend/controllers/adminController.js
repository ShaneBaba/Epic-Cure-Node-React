const db = require('../db');

const ALLOWED_ROLES = ['ADMIN', 'GRANT_WRITER'];
const ALLOWED_STATUSES = ['ACTIVE', 'DISABLED'];

async function getAllUsers(req, res) {
  try {
    const result = await db.query(`
      SELECT user_id, username, email, created_at, role, status
      FROM users
      ORDER BY created_at DESC
    `);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ message: 'Failed to fetch users.' });
  }
}

async function updateUserRole(req, res) {
  const targetUserId = Number(req.params.id);
  const { role } = req.body;
  const currentUserId = Number(req.user.id);

  try {
    if (!targetUserId || Number.isNaN(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const userResult = await db.query(
      `
      SELECT user_id, username, email, role, status
      FROM users
      WHERE user_id = $1
      `,
      [targetUserId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const targetUser = userResult.rows[0];

    if (
      Number(targetUser.user_id) === currentUserId &&
      targetUser.role === 'ADMIN' &&
      role !== 'ADMIN'
    ) {
      return res.status(400).json({
        message: 'You cannot remove your own admin role.',
      });
    }

    const updateResult = await db.query(
      `
      UPDATE users
      SET role = $1
      WHERE user_id = $2
      RETURNING user_id, username, email, created_at, role, status
      `,
      [role, targetUserId]
    );

    return res.status(200).json({
      message: 'User role updated successfully.',
      user: updateResult.rows[0],
    });
  } catch (error) {
    console.error('updateUserRole error:', error);
    return res.status(500).json({ message: 'Failed to update user role.' });
  }
}

async function updateUserStatus(req, res) {
  const targetUserId = Number(req.params.id);
  const { status } = req.body;
  const currentUserId = Number(req.user.id);

  try {
    if (!targetUserId || Number.isNaN(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const userResult = await db.query(
      `
      SELECT user_id, username, email, role, status
      FROM users
      WHERE user_id = $1
      `,
      [targetUserId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const targetUser = userResult.rows[0];

    if (Number(targetUser.user_id) === currentUserId && status === 'DISABLED') {
      return res.status(400).json({
        message: 'You cannot disable your own account.',
      });
    }

    const updateResult = await db.query(
      `
      UPDATE users
      SET status = $1
      WHERE user_id = $2
      RETURNING user_id, username, email, created_at, role, status
      `,
      [status, targetUserId]
    );

    return res.status(200).json({
      message: 'User status updated successfully.',
      user: updateResult.rows[0],
    });
  } catch (error) {
    console.error('updateUserStatus error:', error);
    return res.status(500).json({ message: 'Failed to update user status.' });
  }
}

async function deleteInvitedUser(req, res) {
  const targetUserId = Number(req.params.id);

  try {
    if (!targetUserId || Number.isNaN(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    const result = await db.query(
      `
      DELETE FROM users
      WHERE user_id = $1
        AND status = 'INVITED'
      RETURNING user_id, username, email, created_at, role, status
      `,
      [targetUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found or user is not an invited user.',
      });
    }

    return res.status(200).json({
      message: 'Invited user deleted successfully.',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('deleteInvitedUser error:', error);
    return res.status(500).json({
      message: 'Failed to delete invited user.',
    });
  }
}

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteInvitedUser,
};
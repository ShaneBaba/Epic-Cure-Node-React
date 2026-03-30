const bcrypt = require('bcrypt');
const db = require('../db');

async function getMyAccount(req, res) {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `
      SELECT user_id, username, email, role, status, created_at
      FROM users
      WHERE user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('getMyAccount error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

async function changeMyPassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        message: 'All password fields are required.',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        message: 'New password and confirm password do not match.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters long.',
      });
    }

    const userResult = await db.query(
      `
      SELECT user_id, password_hash
      FROM users
      WHERE user_id = $1
      `,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = userResult.rows[0];

    const validPassword = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        message: 'Current password is incorrect.',
      });
    }

    const sameAsCurrent = await bcrypt.compare(
      newPassword,
      user.password_hash
    );

    if (sameAsCurrent) {
      return res.status(400).json({
        message: 'New password must be different from your current password.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      `
      UPDATE users
      SET password_hash = $1
      WHERE user_id = $2
      `,
      [hashedPassword, userId]
    );

    return res.status(200).json({
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('changeMyPassword error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = {
  getMyAccount,
  changeMyPassword,
};
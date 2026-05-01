const express = require('express');
const router = express.Router();

const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteInvitedUser,
} = require('../controllers/adminController');

router.get('/test', (req, res) => {
  res.json({ message: 'admin route works' });
});

router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.patch('/users/:id/role', requireAuth, requireAdmin, updateUserRole);
router.patch('/users/:id/status', requireAuth, requireAdmin, updateUserStatus);
router.delete('/users/:id', requireAuth, requireAdmin, deleteInvitedUser);

module.exports = router;
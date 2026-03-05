const express = require('express');
const router  = express.Router();

const { login, forgotPassword, resetPassword, inviteUser, acceptInvite } =
  require('../controllers/loginController');

const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.post('/admin/invite', requireAuth, requireAdmin, inviteUser);

router.post('/accept-invite', acceptInvite);

module.exports = router;
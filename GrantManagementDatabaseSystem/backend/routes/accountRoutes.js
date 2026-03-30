const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const {
  getMyAccount,
  changeMyPassword,
} = require('../controllers/accountController');

router.get('/me', requireAuth, getMyAccount);
router.patch('/change-password', requireAuth, changeMyPassword);

module.exports = router;
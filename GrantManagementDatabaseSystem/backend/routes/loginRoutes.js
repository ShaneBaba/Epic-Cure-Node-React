const express = require('express');
const router  = express.Router();
const { login } = require('../controllers/loginController');
const { register } = require('../controllers/loginController');

router.post('/login', login);

router.post('/register', register)

module.exports = router;
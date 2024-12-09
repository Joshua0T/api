const express = require('express');
const { register, login, getUsers } = require('../controllers/controllers.js');
const authenticateToken = require('../middleware/middleware.js');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', authenticateToken, getUsers);

module.exports = router;

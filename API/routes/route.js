const express = require('express');
const { register, login, getUsers, updateUser, deleteUser, recoverPassword, resetPassword } = require('../controllers/controllers.js');
const authenticateToken = require('../middleware/middleware.js');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', authenticateToken, getUsers);
router.put('/users/:id',authenticateToken,updateUser)
router.delete('/users/:id',authenticateToken,deleteUser)

router.post('/recover-password',recoverPassword)
router.post('/reset-password/:token', resetPassword)

module.exports = router;

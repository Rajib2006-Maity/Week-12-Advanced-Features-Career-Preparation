const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');
const { registerRules, loginRules, handleValidation } = require('../utils/validators');

const router = express.Router();

router.post('/register', authLimiter, registerRules, handleValidation, register);
router.post('/login', authLimiter, loginRules, handleValidation, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;

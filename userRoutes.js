const express = require('express');
const { getProfile, toggleFollow } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:username', protect, getProfile);
router.put('/:id/follow', protect, toggleFollow);

module.exports = router;

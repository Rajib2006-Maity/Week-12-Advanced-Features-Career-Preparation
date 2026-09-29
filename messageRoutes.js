const express = require('express');
const { getHistory } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:otherUserId', protect, getHistory);

module.exports = router;

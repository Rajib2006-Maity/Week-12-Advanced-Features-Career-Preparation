const express = require('express');
const { uploadMedia } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', protect, upload.single('media'), uploadMedia);

module.exports = router;

const express = require('express');
const {
  getFeed,
  createPost,
  deletePost,
  toggleLike,
  addComment
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { postRules, commentRules, handleValidation } = require('../utils/validators');

const router = express.Router();

router.get('/', protect, getFeed);
router.post('/', protect, postRules, handleValidation, createPost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, commentRules, handleValidation, addComment);

module.exports = router;

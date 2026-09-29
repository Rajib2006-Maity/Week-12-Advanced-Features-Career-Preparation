const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array().map((e) => e.msg) });
  }
  next();
};

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  body('username')
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9_.]{3,30}$/)
    .withMessage('Username must be 3-30 chars: letters, numbers, "_" or "."'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number')
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const postRules = [
  body('text').optional().isLength({ max: 2000 }).withMessage('Post text is too long (max 2000 chars)')
];

const commentRules = [
  body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters')
];

module.exports = { handleValidation, registerRules, loginRules, postRules, commentRules };

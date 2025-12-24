// backend/src/middleware/validators.js
const { body, validationResult } = require('express-validator');

// Middleware untuk cek hasil validasi
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: "Validation Error", 
      errors: errors.array() 
    });
  }
  next();
};

exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  validate
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];
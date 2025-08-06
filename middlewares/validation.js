const { check, validationResult } = require('express-validator');

const signupValidation = [
  check('name').notEmpty().withMessage('Name is required').trim(),
  check('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginValidation = [
  check('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  check('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidation = [
  check('oldPassword').notEmpty().withMessage('Old password is required'),
  check('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

const sendOTPValidation = [
  check('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const verifyOTPValidation = [
  check('userId').isMongoId().withMessage('Valid userId is required'),
  check('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').isNumeric(),
];

const resetPasswordValidation = [
  check('userId').isMongoId().withMessage('Valid userId is required'),
  check('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  check('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  signupValidation,
  loginValidation,
  changePasswordValidation,
  sendOTPValidation,
  verifyOTPValidation,
  resetPasswordValidation,
  validate,
};
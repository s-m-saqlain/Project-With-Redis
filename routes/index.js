const express = require('express');
const router = express.Router();

router.use('/signup', require('./auth/Signup'));
router.use('/login', require('./auth/Login'));
// router.use('/change-password', require('./auth/ChangePassword'));
router.use('/send-otp', require('./auth/SendOTP'));
router.use('/verify-otp', require('./auth/VerifyOTP'));
router.use('/reset', require('./auth/Reset'));

module.exports = router;
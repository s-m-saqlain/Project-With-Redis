const express = require('express');
const router = express.Router();
const { verifyOTPValidation, validate } = require('../../middlewares/validation');
const verifyOTP = require('../../controllers/verifyOTP');

router.post('/', verifyOTPValidation, validate, verifyOTP);

module.exports = router;
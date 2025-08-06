const express = require('express');
const router = express.Router();
const { signupValidation, validate } = require('../../middlewares/validation');
const registerUser = require('../../controllers/signup');

router.post('/', signupValidation, validate, registerUser);

module.exports = router;
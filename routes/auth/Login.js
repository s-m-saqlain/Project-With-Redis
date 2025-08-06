const express = require('express');
const router = express.Router();
const { loginValidation, validate } = require('../../middlewares/validation');
const loginUser = require('../../controllers/login');

router.post('/', loginValidation, validate, loginUser);

module.exports = router;
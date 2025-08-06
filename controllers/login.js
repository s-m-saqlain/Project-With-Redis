const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Token = require('../models/Token');
const keys = require('../config/keys');

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user._id, role: 'user' };
    const token = jwt.sign(payload, keys.USER_SECRET); // No expiresIn

    // Store token in MongoDB
    await Token.create({ userId: user._id, token, role: 'user' });

    res.json({ token });
  } catch (err) {
    next(err);
  }
};

module.exports = loginUser;
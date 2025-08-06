const bcrypt = require('bcryptjs');
const User = require('../models/User');

const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  try {
    if (req.tokenEntry.role !== 'user' || req.user.id.toString() !== req.tokenEntry.userId.toString()) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = changePassword;
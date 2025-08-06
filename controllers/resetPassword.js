const bcrypt = require('bcryptjs');
const User = require('../models/User');
const redis = require('../config/redis');

const resetPassword = async (req, res, next) => {
  const { userId, newPassword, confirmPassword } = req.body;
  try {
    if (!userId || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'userId, newPassword, and confirmPassword are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verifiedKey = `otp_verified:${userId}:user`;
    const isVerified = await redis.get(verifiedKey);
    if (!isVerified) {
      return res.status(400).json({ message: 'OTP not verified' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Delete OTP Set and verification flag from Redis
    await redis.del(`otp_set:${userId}:user`);
    await redis.del(verifiedKey);

    res.json({
      status: true,
      message: 'Password reset successfully',
      data: { userId: user._id },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = resetPassword;
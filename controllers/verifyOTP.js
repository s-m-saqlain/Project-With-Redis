// controllers/verifyOTP.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const redis = require('../config/redis');

const verifyOTP = async (req, res, next) => {
  const { userId, otp } = req.body;
  try {
    // Validate user existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Redis keys
    const otpKey = `otp:${userId}`;
    const attemptsKey = `otp_attempts:${userId}:user`;
    const verifiedKey = `otp_verified:${userId}:user`;

    // Retrieve OTP hash from Redis
    const storedOtpHash = await redis.get(otpKey);
    if (!storedOtpHash) {
      return res.status(400).json({
        message: 'OTP has expired or does not exist',
      });
    }

    // Get current attempts
    let attempts = parseInt(await redis.get(attemptsKey) || '0');

    // Check if maximum attempts already exceeded
    // if (attempts >= 3) {
    //   await redis.del(otpKey);
    //   await redis.del(attemptsKey);
    //   return res.status(400).json({
    //     message: 'Your OTP is invalid, please send OTP again',
    //   });
    // }

    // Compare provided OTP with stored hash
    const isValid = await bcrypt.compare(otp, storedOtpHash);
    if (!isValid) {
      // Increment attempts on failure
      attempts += 1;
      await redis.setex(attemptsKey, 300, attempts);

      // Check if this failure exceeds the limit
      if (attempts >= 3) {
        await redis.del(otpKey);
        await redis.del(attemptsKey);
        return res.status(400).json({
          message: 'Your OTP is invalid, please send OTP again',
        });
      }

      // Calculate remaining attempts
      const remaining = 3 - attempts;

      return res.status(400).json({
        message: `You have entered wrong OTP and you have ${remaining} attempt${remaining > 1 ? 's' : ''} left`,
      });
    }

    // If valid, mark as verified and clean up
    await redis.setex(verifiedKey, 120, 'true');
    await redis.del(otpKey); // Remove OTP hash after verification
    await redis.del(attemptsKey); // Clear attempts after successful verification

    res.json({
      message: 'OTP verified successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = verifyOTP;
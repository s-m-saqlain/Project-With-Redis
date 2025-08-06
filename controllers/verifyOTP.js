const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Token = require('../models/Token'); // Added for debugging
const redis = require('../config/redis');

const verifyOTP = async (req, res, next) => {
  const { userId, otp } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Debug: Check tokens before OTP verification
    const tokensBefore = await Token.find({ userId });
    console.log(`Tokens before verifyOTP for user ${userId}:`, tokensBefore.length);

    const otpSetKey = `otp_set:${userId}:user`;
    const otpHash = await hashOTP(otp);
    const debugInfo = { key: otpSetKey, value: otpHash };

    // Check if OTP hash exists in the Redis Set
    const isMember = await redis.sismember(otpSetKey, otpHash);
    if (!isMember) {
      const attemptsKey = `otp_attempts:${userId}:user`;
      const attempts = parseInt(await redis.get(attemptsKey) || '0') + 1;
      await redis.setex(attemptsKey, 300, attempts);

      if (attempts >= 3) {
        await redis.del(otpSetKey);
        await redis.del(attemptsKey);
        return res.status(400).json({
          message: 'Maximum OTP attempts exceeded',
          redis_debug: { key: otpSetKey, value: null, attemptsKey, attempts },
        });
      }
      return res.status(400).json({
        message: 'Invalid OTP or OTP has expired',
        redis_debug: { key: otpSetKey, value: otpHash, attemptsKey, attempts },
      });
    }

    // Mark OTP as verified by setting a flag in Redis
    await redis.setex(`otp_verified:${userId}:user`, 300, 'true');
    await redis.del(otpSetKey); // Remove OTP Set after verification

    // Debug: Check tokens after OTP verification
    const tokensAfter = await Token.find({ userId });
    console.log(`Tokens after verifyOTP for user ${userId}:`, tokensAfter.length);

    res.json({
      message: 'OTP verified successfully',
      redis_debug: debugInfo,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = verifyOTP;
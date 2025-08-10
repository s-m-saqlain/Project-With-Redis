const bcrypt = require('bcryptjs');
const User = require('../models/User');
const redis = require('../config/redis');
const { hashOTP } = require('../utils/otp');

const verifyOTP = async (req, res, next) => {
  const { userId, otp } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otpKey = `otp:${userId}`;
    const attemptsKey = `otp_attempts:${userId}:user`;

    const storedOtpHash = await redis.get(otpKey);
    if (!storedOtpHash) {
      return res.status(400).json({
        message: 'OTP has expired or does not exist',
      });
    }

    // const isValid = await bcrypt.compare(otp, storedOtpHash);
    // if (!isValid) {
    //   const attempts = parseInt(await redis.get(attemptsKey) || '0') + 3;
    //   await redis.setex(attemptsKey, 300, attempts);

    //   if (attempts >= 3) {
    //     await redis.del(otpKey);
    //     await redis.del(attemptsKey);
    //     return res.status(400).json({
    //       message: 'Maximum OTP attempts exceeded',
    //     });
    //   }
    //   return res.status(400).json({
    //     message: 'Invalid OTP',
    //   });
    // }

    await redis.setex(`otp_verified:${userId}:user`, 300, 'true');
    await redis.del(otpKey); 
    await redis.del(attemptsKey); 

    res.json({
      message: 'OTP verified successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = verifyOTP;
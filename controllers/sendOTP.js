const { sendOTPEmail } = require('../utils/email');
const { generateOTP, hashOTP } = require('../utils/otp');
const User = require('../models/User');
const Token = require('../models/Token'); // Added for debugging
const redis = require('../config/redis');

const sendOTP = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cooldownKey = `otp_cooldown:${user._id}`;
    const otpKey = `otp:${user._id}`;
    const otpLimitKey = `otp_limit:${user._id}`; // for 3/hr rate limit

    // Check if user is in cooldown
    const isCooldown = await redis.exists(cooldownKey);
    if (isCooldown) {
      return res.status(429).json({ message: 'Please wait 30 seconds before requesting another OTP.' });
    }

    // ✅ Check hourly limit (max 3 per hour)
    const requestCount = await redis.get(otpLimitKey);
    if (requestCount && parseInt(requestCount) >= 3) {
      return res.status(429).json({ message: 'You have reached the maximum OTP requests allowed per hour' });
    }

    const actual_otp = generateOTP();
    const otpHash = await hashOTP(actual_otp);
    // const otpKey = `otp:${user._id}`;

    // Store OTP hash in Redis Set with 5-minute TTL
    await redis.set(otpKey, otpHash, 'EX', 300); // 300 = 5 minutes

    // Set 30-second cooldown
    await redis.set(cooldownKey, '1', 'EX', 30);

    // ✅ Track request count (increment or set with 1-hour TTL)
    if (requestCount) {
      await redis.incr(otpLimitKey); // increase existing count
    } else {
      await redis.set(otpLimitKey, 1, 'EX', 3600); // set count = 1 with 1-hour expiry
    }

    await sendOTPEmail(email, actual_otp);

    res.json({
      status: true,
      message: 'OTP sent to email',
      data: { 
        user_id: user._id 
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = sendOTP;
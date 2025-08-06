const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
});

const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Ecommerce App" <${process.env.EMAIL_HOST_USER}>`,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}. It expires in 5 minutes.`,
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });
    console.log(`✅ OTP ${otp} sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send OTP to ${email}:`, error.message);
    throw new Error('Failed to send OTP');
  }
};

module.exports = { sendOTPEmail };
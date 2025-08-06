const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Token = require('../models/Token');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'AuthUser',
    });
    console.log('MongoDB connected');
    await User.init();
    console.log('Collections initialized');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
const Token = require('../models/Token');

const validateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const tokenDoc = await Token.findOne({ token });
    if (!tokenDoc) {
      return res.status(403).json({ message: 'Token is invalid' });
    }
    req.tokenEntry = { userId: tokenDoc.userId, role: tokenDoc.role };
    next();
  } catch (err) {
    console.error('Token validation error:', err.message);
    return res.status(500).json({ message: 'Server error during token validation' });
  }
};

module.exports = validateToken;
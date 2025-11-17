const jwt = require('jsonwebtoken');
const SECRET_KEY = 'safelink_secret_key_2024'; // Change in production

function authenticateToken(req, res, next) {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
}

function isAdmin(req, res, next) {
  if (req.user && req.user.email === 'admin@safelink.com') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
}

module.exports = { authenticateToken, isAdmin, SECRET_KEY };
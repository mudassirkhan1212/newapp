// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authenticated. Please sign in.' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ req.user:", req.user); // ✅ add this
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
const jwt = require('jsonwebtoken');

// Checks that the user is logged in
exports.protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Login required' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Checks that the user is an admin
exports.adminOnly = (req, res, next) =>
  req.user.role === 'admin'
    ? next()
    : res.status(403).json({ message: 'Admins only' });
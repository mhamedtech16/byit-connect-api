const jwt = require('jsonwebtoken');
console.log('✅ authMiddleware وصل له طلب');
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401); // Unauthorized

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.sendStatus(401); // Forbidden
  }
};


module.exports = authMiddleware;

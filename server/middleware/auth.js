const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config');

const authMiddleware = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const [scheme, token] = authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
      audience: 'mychart-web',
      issuer: 'mychart-api',
    });
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role || 'patient';
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

module.exports = authMiddleware;

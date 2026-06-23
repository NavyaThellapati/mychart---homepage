function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const role = req.userRole || 'patient';
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
}

module.exports = { authorizeRoles };

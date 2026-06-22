const { rateLimit } = require('express-rate-limit');

function createLimiter({ max, message }) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    handler: (_req, res) => {
      res.status(429).json({ success: false, message });
    },
  });
}

const registerLimiter = createLimiter({
  max: 5,
  message: 'Too many registration attempts. Please try again later.',
});

const loginLimiter = createLimiter({
  max: 10,
  message: 'Too many login attempts. Please try again later.',
});

const passwordResetLimiter = createLimiter({
  max: 5,
  message: 'Too many password reset attempts. Please try again later.',
});

module.exports = {
  loginLimiter,
  passwordResetLimiter,
  registerLimiter,
};

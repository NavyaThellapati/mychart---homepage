const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config');
const authMiddleware = require('../middleware/auth');
const {
  loginLimiter,
  passwordResetLimiter,
  registerLimiter,
} = require('../middleware/rateLimits');
const { pool } = require('../db');
const { sendPasswordResetEmail: defaultSendPasswordResetEmail } = require('../utils/mailer');
const {
  cleanText,
  normalizeEmail,
  normalizePhone,
  validatePassword,
} = require('../utils/validation');

const CLIENT_URL = process.env.CLIENT_URL || 'http://127.0.0.1:5173';
const GENERIC_RESET_MESSAGE =
  'If an account exists for that email, a password reset link has been sent.';

function userResponse(row) {
  return {
    id: String(row.id),
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    username: row.username,
  };
}

function createToken(user) {
  return jwt.sign(
    { userId: String(user.id), email: user.email },
    getJwtSecret(),
    {
      algorithm: 'HS256',
      audience: 'mychart-web',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      issuer: 'mychart-api',
    }
  );
}

function createAuthRouter({
  generateResetToken = () => crypto.randomBytes(32).toString('hex'),
  sendPasswordResetEmail = defaultSendPasswordResetEmail,
} = {}) {
  const router = express.Router();

  router.post('/register', registerLimiter, async (req, res, next) => {
    try {
      const firstName = cleanText(req.body.firstName, { max: 100 });
      const lastName = cleanText(req.body.lastName, { max: 100 });
      const email = normalizeEmail(req.body.email);
      const phone = normalizePhone(req.body.phone);
      const { password, confirmPassword } = req.body;

      if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'Please provide valid values for all fields' });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
      }
      const passwordError = validatePassword(password);
      if (passwordError) {
        return res.status(400).json({ success: false, message: passwordError });
      }

      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows[0]) {
        return res.status(409).json({ success: false, message: 'User with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const result = await pool.query(
        `INSERT INTO users (first_name, last_name, email, phone, username, password_hash)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [firstName, lastName, email, phone, email, passwordHash]
      );
      const user = result.rows[0];
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token: createToken(user),
        user: userResponse(user),
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'User with this email already exists' });
      }
      next(error);
    }
  });

  router.post('/login', loginLimiter, async (req, res, next) => {
    try {
      const login = cleanText(req.body.username, { max: 254 });
      const password = typeof req.body.password === 'string' ? req.body.password : null;
      if (!login || !password) {
        return res.status(400).json({ success: false, message: 'Email or username and password are required' });
      }
      const result = await pool.query(
        'SELECT * FROM users WHERE LOWER(username) = $1 OR email = $1',
        [login.toLowerCase()]
      );
      const user = result.rows[0];
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ success: false, message: 'Invalid email/username or password' });
      }
      res.json({
        success: true,
        message: 'Login successful',
        token: createToken(user),
        user: userResponse(user),
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/verify', authMiddleware, async (req, res, next) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
      if (!result.rows[0]) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user: userResponse(result.rows[0]) });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/profile', authMiddleware, async (req, res, next) => {
    try {
      const current = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
      if (!current.rows[0]) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const previous = current.rows[0];
      const firstName = cleanText(req.body.firstName ?? previous.first_name, { max: 100 });
      const lastName = cleanText(req.body.lastName ?? previous.last_name, { max: 100 });
      const email = normalizeEmail(req.body.email ?? previous.email);
      const phone = normalizePhone(req.body.phone ?? previous.phone);
      if (!firstName || !lastName || !email || !phone) {
        return res.status(400).json({ success: false, message: 'Please provide valid profile values' });
      }
      const result = await pool.query(
        `UPDATE users SET
           first_name = $1, last_name = $2, email = $3, phone = $4, updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [firstName, lastName, email, phone, req.userId]
      );
      res.json({ success: true, message: 'Profile updated', user: userResponse(result.rows[0]) });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'Email is already in use' });
      }
      next(error);
    }
  });

  router.patch('/password', authMiddleware, async (req, res, next) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'All password fields are required' });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'New passwords do not match' });
      }
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        return res.status(400).json({ success: false, message: passwordError });
      }
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
      const user = result.rows[0];
      if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }
      const passwordHash = await bcrypt.hash(newPassword, 12);
      await pool.query(
        `UPDATE users SET password_hash = $1, password_reset_token = NULL,
         password_reset_expires = NULL, updated_at = NOW() WHERE id = $2`,
        [passwordHash, req.userId]
      );
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  });

  router.post('/forgot-password', passwordResetLimiter, async (req, res, next) => {
    try {
      const email = normalizeEmail(req.body.email);
      if (email) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (user) {
          const resetToken = generateResetToken();
          const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
          await pool.query(
            `UPDATE users
             SET password_reset_token = $1, password_reset_expires = NOW() + INTERVAL '1 hour', updated_at = NOW()
             WHERE id = $2`,
            [hashedToken, user.id]
          );
          const resetUrl = `${CLIENT_URL}/forgot-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
          try {
            await sendPasswordResetEmail({ to: user.email, name: user.first_name, resetUrl });
          } catch (mailError) {
            console.error('Unable to send password reset email:', mailError.message);
          }
        }
      }
      res.json({ success: true, message: GENERIC_RESET_MESSAGE });
    } catch (error) {
      next(error);
    }
  });

  router.post('/reset-password', passwordResetLimiter, async (req, res, next) => {
    try {
      const email = normalizeEmail(req.body.email);
      const { resetToken, newPassword, confirmPassword } = req.body;
      if (!email || typeof resetToken !== 'string' || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'Password reset link is invalid or has expired' });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
      }
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        return res.status(400).json({ success: false, message: passwordError });
      }
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const passwordHash = await bcrypt.hash(newPassword, 12);
      const result = await pool.query(
        `UPDATE users SET
           password_hash = $1, password_reset_token = NULL,
           password_reset_expires = NULL, updated_at = NOW()
         WHERE email = $2 AND password_reset_token = $3 AND password_reset_expires > NOW()
         RETURNING id`,
        [passwordHash, email, hashedToken]
      );
      if (!result.rows[0]) {
        return res.status(400).json({ success: false, message: 'Password reset link is invalid or has expired' });
      }
      res.json({ success: true, message: 'Password updated successfully. Please log in.' });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createAuthRouter, createToken, GENERIC_RESET_MESSAGE };

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const { pool } = require('../db');
const { sendPasswordResetEmail } = require('../utils/mailer');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-me';
const CLIENT_URL = process.env.CLIENT_URL || 'http://127.0.0.1:5173';

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
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } = req.body;
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [normalizedEmail, normalizedEmail.split('@')[0]]
    );
    if (existing.rows[0]) {
      return res.status(409).json({ success: false, message: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, username, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [firstName.trim(), lastName.trim(), normalizedEmail, phone.trim(), normalizedEmail.split('@')[0], passwordHash]
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
      return res.status(409).json({ success: false, message: 'Email or username already exists' });
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username.toLowerCase().trim()]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
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
    const email = (req.body.email ?? previous.email).toLowerCase().trim();
    const result = await pool.query(
      `UPDATE users SET
         first_name = $1,
         last_name = $2,
         email = $3,
         phone = $4,
         updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        (req.body.firstName ?? previous.first_name).trim(),
        (req.body.lastName ?? previous.last_name).trim(),
        email,
        (req.body.phone ?? previous.phone).trim(),
        req.userId,
      ]
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
    if (newPassword.length < 6 || newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords must match and contain at least 6 characters' });
    }
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, req.userId]
    );
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    await pool.query(
      `UPDATE users
       SET password_reset_token = $1, password_reset_expires = NOW() + INTERVAL '1 hour', updated_at = NOW()
       WHERE id = $2`,
      [hashedToken, user.id]
    );

    const resetUrl = `${CLIENT_URL}/forgot-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
    const mailResult = await sendPasswordResetEmail({ to: user.email, name: user.first_name, resetUrl });
    res.json({
      success: true,
      emailSent: mailResult.sent,
      message: mailResult.sent ? 'Password reset email sent. Please check your inbox.' : mailResult.message,
      resetToken: !mailResult.sent && process.env.NODE_ENV === 'development' ? resetToken : undefined,
      resetUrl: !mailResult.sent && process.env.NODE_ENV === 'development' ? resetUrl : undefined,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;
    if (!email || !resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password reset fields are required' });
    }
    if (newPassword.length < 6 || newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords must match and contain at least 6 characters' });
    }
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const result = await pool.query(
      `UPDATE users SET
         password_hash = $1,
         password_reset_token = NULL,
         password_reset_expires = NULL,
         updated_at = NOW()
       WHERE email = $2
         AND password_reset_token = $3
         AND password_reset_expires > NOW()
       RETURNING id`,
      [passwordHash, email.toLowerCase().trim(), hashedToken]
    );
    if (!result.rows[0]) {
      return res.status(400).json({ success: false, message: 'Password reset link is invalid or has expired' });
    }
    res.json({ success: true, message: 'Password updated successfully. Please log in.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

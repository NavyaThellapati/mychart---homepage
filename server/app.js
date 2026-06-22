const cors = require('cors');
const express = require('express');
const { pool } = require('./db');
const { createAuthRouter } = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');

function createApp({ authDependencies } = {}) {
  const app = express();
  const allowedOrigins = (
    process.env.CLIENT_URLS ||
    process.env.CLIENT_URL ||
    'http://127.0.0.1:5173,http://localhost:5173'
  )
    .split(',')
    .map((origin) => origin.trim());

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.set({
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    });
    next();
  });
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin is not allowed by CORS'));
    },
  }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', async (_req, res, next) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'OK', database: 'connected', message: 'MyChart API is running' });
    } catch (error) {
      next(error);
    }
  });

  app.use('/api/auth', createAuthRouter(authDependencies));
  app.use('/api/appointments', appointmentRoutes);

  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    const isBadJson = error instanceof SyntaxError && error.status === 400 && 'body' in error;
    res.status(isBadJson ? 400 : 500).json({
      success: false,
      message: isBadJson ? 'Request body contains invalid JSON' : 'Something went wrong',
    });
  });

  return app;
}

module.exports = { createApp };

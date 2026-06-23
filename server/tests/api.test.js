const assert = require('node:assert/strict');
const { after, before, beforeEach, test } = require('node:test');
require('dotenv').config();

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/mychart_test';
process.env.CLIENT_URL = 'http://localhost:5173';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required to run backend tests');
}

const { createApp } = require('../app');
const { initializeDatabase, pool } = require('../db');

const resetToken = 'deterministic-reset-token-for-integration-tests';
const otp = '123456';
const mfaToken = 'deterministic-mfa-token-for-integration-tests';
let deliveredResetEmails = [];
let deliveredOtpEmails = [];
const app = createApp({
  authDependencies: {
    generateResetToken: () => resetToken,
    generateOtp: () => otp,
    generateMfaToken: () => mfaToken,
    sendLoginOtpEmail: async (message) => {
      deliveredOtpEmails.push(message);
      return { sent: true };
    },
    sendPasswordResetEmail: async (message) => {
      deliveredResetEmails.push(message);
      return { sent: true };
    },
  },
});
let server;
let apiOrigin;

class RequestBuilder {
  constructor(method, path) {
    this.method = method;
    this.path = path;
    this.headers = {};
  }

  set(name, value) {
    this.headers[name] = value;
    return this;
  }

  send(body) {
    this.body = body;
    return this;
  }

  async execute() {
    const response = await fetch(`${apiOrigin}${this.path}`, {
      method: this.method,
      headers: {
        ...(this.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...this.headers,
      },
      body: this.body === undefined ? undefined : JSON.stringify(this.body),
    });
    return { status: response.status, body: await response.json() };
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

function request() {
  return {
    delete: (path) => new RequestBuilder('DELETE', path),
    get: (path) => new RequestBuilder('GET', path),
    patch: (path) => new RequestBuilder('PATCH', path),
    post: (path) => new RequestBuilder('POST', path),
  };
}

const userPayload = {
  firstName: 'Navya',
  lastName: 'Thellapati',
  email: 'navya@example.com',
  phone: '813-555-0100',
  password: 'Portfolio123',
  confirmPassword: 'Portfolio123',
};

async function registerUser(overrides = {}) {
  return request(app).post('/api/auth/register').send({ ...userPayload, ...overrides });
}

async function registerAndGetToken(overrides = {}) {
  const response = await registerUser(overrides);
  assert.equal(response.status, 201);
  return response.body.token;
}

function futureDate(days = 1, minutes = 0) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000 + minutes * 60 * 1000).toISOString();
}

function appointmentPayload(overrides = {}) {
  return {
    type: 'Annual physical',
    departmentDoctor: 'Primary Care - Dr. Smith',
    reason: 'Annual wellness visit',
    notes: 'Morning preferred',
    startsAt: futureDate(),
    ...overrides,
  };
}

before(async () => {
  await initializeDatabase();
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  apiOrigin = `http://127.0.0.1:${address.port}`;
});

beforeEach(async () => {
  deliveredResetEmails = [];
  deliveredOtpEmails = [];
  await pool.query('TRUNCATE appointments, users RESTART IDENTITY CASCADE');
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await pool.end();
});

test('registers a user with a collision-safe email username', async () => {
  const response = await registerUser();
  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.user.username, userPayload.email);
  assert.ok(response.body.token);
});

test('rejects duplicate email registration', async () => {
  await registerUser();
  const response = await registerUser();
  assert.equal(response.status, 409);
  assert.equal(response.body.success, false);
});

test('allows different emails that share the same local prefix', async () => {
  const first = await registerUser({ email: 'shared@example.com' });
  const second = await registerUser({ email: 'shared@another.example' });
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.notEqual(first.body.user.username, second.body.user.username);
});

test('logs in with email and verifies the JWT', async () => {
  await registerUser();
  const login = await request(app).post('/api/auth/login').send({
    username: userPayload.email,
    password: userPayload.password,
  });
  assert.equal(login.status, 200);
  assert.ok(login.body.token);

  const verification = await request(app)
    .get('/api/auth/verify')
    .set('Authorization', `Bearer ${login.body.token}`);
  assert.equal(verification.status, 200);
  assert.equal(verification.body.user.email, userPayload.email);
  assert.equal(verification.body.user.role, 'patient');
});

test('rejects a wrong password without exposing account details', async () => {
  await registerUser();
  const response = await request(app).post('/api/auth/login').send({
    username: userPayload.email,
    password: 'DefinitelyWrong123',
  });
  assert.equal(response.status, 401);
  assert.match(response.body.message, /invalid/i);
});

test('returns the same forgot-password response for existing and unknown emails', async () => {
  await registerUser();
  const existing = await request(app)
    .post('/api/auth/forgot-password')
    .send({ email: userPayload.email });
  const missing = await request(app)
    .post('/api/auth/forgot-password')
    .send({ email: 'missing@example.com' });

  assert.equal(existing.status, 200);
  assert.equal(missing.status, 200);
  assert.deepEqual(existing.body, missing.body);
  assert.equal(deliveredResetEmails.length, 1);
  assert.equal(existing.body.resetToken, undefined);
});

test('completes a password reset and invalidates the one-time token', async () => {
  await registerUser();
  await request(app).post('/api/auth/forgot-password').send({ email: userPayload.email });

  const reset = await request(app).post('/api/auth/reset-password').send({
    email: userPayload.email,
    resetToken,
    newPassword: 'UpdatedPass456',
    confirmPassword: 'UpdatedPass456',
  });
  assert.equal(reset.status, 200);

  const reuse = await request(app).post('/api/auth/reset-password').send({
    email: userPayload.email,
    resetToken,
    newPassword: 'AnotherPass789',
    confirmPassword: 'AnotherPass789',
  });
  assert.equal(reuse.status, 400);

  const login = await request(app).post('/api/auth/login').send({
    username: userPayload.email,
    password: 'UpdatedPass456',
  });
  assert.equal(login.status, 200);
});

test('requires and verifies email OTP when MFA is enabled', async () => {
  await registerUser();
  await pool.query('UPDATE users SET mfa_enabled = true WHERE email = $1', [userPayload.email]);

  const login = await request(app).post('/api/auth/login').send({
    username: userPayload.email,
    password: userPayload.password,
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.mfaRequired, true);
  assert.equal(login.body.token, undefined);
  assert.equal(login.body.mfaToken, mfaToken);
  assert.equal(deliveredOtpEmails.length, 1);

  const rejected = await request(app).post('/api/auth/verify-otp').send({
    mfaToken,
    otp: '000000',
  });
  assert.equal(rejected.status, 400);

  const verified = await request(app).post('/api/auth/verify-otp').send({
    mfaToken,
    otp,
  });
  assert.equal(verified.status, 200);
  assert.ok(verified.body.token);
});

test('changes a password and records an audit event', async () => {
  const token = await registerAndGetToken();
  const response = await request(app)
    .patch('/api/auth/password')
    .set('Authorization', `Bearer ${token}`)
    .send({
      currentPassword: userPayload.password,
      newPassword: 'ChangedPass123',
      confirmPassword: 'ChangedPass123',
    });
  assert.equal(response.status, 200);

  const audit = await pool.query(
    "SELECT action FROM audit_logs WHERE action = 'password_change'"
  );
  assert.equal(audit.rowCount, 1);
});

test('creates, lists, updates, and cancels an appointment', async () => {
  const token = await registerAndGetToken();
  const created = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${token}`)
    .send(appointmentPayload());
  assert.equal(created.status, 201);

  const listed = await request(app)
    .get('/api/appointments')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(listed.status, 200);
  assert.equal(listed.body.appointments.length, 1);

  const updated = await request(app)
    .patch(`/api/appointments/${created.body.appointment.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ reason: 'Updated annual wellness visit', startsAt: futureDate(2) });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.appointment.reason, 'Updated annual wellness visit');

  const cancelled = await request(app)
    .delete(`/api/appointments/${created.body.appointment.id}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.body.appointment.status, 'Cancelled');

  const audit = await pool.query(
    `SELECT action FROM audit_logs
     WHERE action IN ('appointment_create', 'appointment_update', 'appointment_cancel')
     ORDER BY id`
  );
  assert.deepEqual(
    audit.rows.map((row) => row.action),
    ['appointment_create', 'appointment_update', 'appointment_cancel']
  );
});

test('rejects past and overlapping appointments', async () => {
  const token = await registerAndGetToken();
  const past = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${token}`)
    .send(appointmentPayload({ startsAt: new Date(Date.now() - 60_000).toISOString() }));
  assert.equal(past.status, 400);

  const startsAt = futureDate(3);
  const first = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${token}`)
    .send(appointmentPayload({ startsAt }));
  assert.equal(first.status, 201);

  const overlapping = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${token}`)
    .send(appointmentPayload({ startsAt: futureDate(3, 15) }));
  assert.equal(overlapping.status, 409);
});

test('prevents one user from reading, updating, or cancelling another user appointment', async () => {
  const ownerToken = await registerAndGetToken();
  const otherToken = await registerAndGetToken({
    email: 'other@example.com',
    phone: '813-555-0101',
  });
  const created = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send(appointmentPayload());
  const id = created.body.appointment.id;

  const read = await request(app)
    .get(`/api/appointments/${id}`)
    .set('Authorization', `Bearer ${otherToken}`);
  const update = await request(app)
    .patch(`/api/appointments/${id}`)
    .set('Authorization', `Bearer ${otherToken}`)
    .send({ reason: 'Unauthorized update' });
  const cancel = await request(app)
    .delete(`/api/appointments/${id}`)
    .set('Authorization', `Bearer ${otherToken}`);

  assert.equal(read.status, 404);
  assert.equal(update.status, 404);
  assert.equal(cancel.status, 404);
});

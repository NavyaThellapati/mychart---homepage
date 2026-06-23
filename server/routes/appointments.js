const crypto = require('crypto');
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const { pool } = require('../db');
const { logAudit } = require('../utils/auditLogger');
const { cleanText } = require('../utils/validation');

const router = express.Router();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.use(authMiddleware);
router.use(authorizeRoles('patient', 'doctor', 'admin'));
router.param('id', (req, res, next, id) => {
  if (!UUID_PATTERN.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
  }
  next();
});

function splitDepartmentDoctor(value = '') {
  const parts = value.replace('—', '–').split(/–|-/);
  if (parts.length < 2) {
    return { specialty: '', doctor: value.trim() };
  }
  return {
    specialty: parts[0].trim(),
    doctor: parts.slice(1).join('-').trim(),
  };
}

function serializeAppointment(row) {
  return {
    id: row.id,
    userId: String(row.user_id),
    type: row.appointment_type,
    departmentDoctor: row.department_doctor,
    doctor: row.doctor,
    specialty: row.specialty,
    reason: row.reason,
    notes: row.notes,
    datetime: row.starts_at,
    startISO: row.starts_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateStartTime(value, { requireFuture = true } = {}) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { error: 'Invalid appointment time' };
  const earliest = Date.now() + 5 * 60 * 1000;
  const latest = Date.now() + 2 * 365 * 24 * 60 * 60 * 1000;
  if (requireFuture && date.getTime() < earliest) {
    return { error: 'Appointment time must be at least 5 minutes in the future' };
  }
  if (date.getTime() > latest) {
    return { error: 'Appointment time cannot be more than 2 years in the future' };
  }
  return { date };
}

async function hasOverlappingAppointment(userId, startDate, excludedId = null) {
  const result = await pool.query(
    `SELECT id FROM appointments
     WHERE user_id = $1
       AND status = 'Upcoming'
       AND ($3::uuid IS NULL OR id <> $3::uuid)
       AND ABS(EXTRACT(EPOCH FROM (starts_at - $2::timestamptz))) < 1800
     LIMIT 1`,
    [userId, startDate.toISOString(), excludedId]
  );
  return Boolean(result.rows[0]);
}

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM appointments
       WHERE user_id = $1
       ORDER BY starts_at ASC`,
      [req.userId]
    );
    res.json({ success: true, appointments: result.rows.map(serializeAppointment) });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM appointments WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, appointment: serializeAppointment(result.rows[0]) });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const type = cleanText(req.body.type, { max: 150 });
    const departmentDoctor = cleanText(req.body.departmentDoctor, { max: 255 });
    const reason = cleanText(req.body.reason, { max: 2000, multiline: true });
    const notes = cleanText(req.body.notes ?? '', { min: 0, max: 5000, multiline: true });
    const { startsAt } = req.body;
    if (!type || !departmentDoctor || !reason || !startsAt) {
      return res.status(400).json({
        success: false,
        message: 'Type, doctor, reason, and appointment time are required',
      });
    }

    const startValidation = validateStartTime(startsAt);
    if (startValidation.error) {
      return res.status(400).json({ success: false, message: startValidation.error });
    }
    if (await hasOverlappingAppointment(req.userId, startValidation.date)) {
      return res.status(409).json({
        success: false,
        message: 'You already have an appointment within 30 minutes of this time',
      });
    }

    const { specialty, doctor } = splitDepartmentDoctor(departmentDoctor);
    const result = await pool.query(
      `INSERT INTO appointments
        (id, user_id, appointment_type, department_doctor, doctor, specialty, reason, notes, starts_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        crypto.randomUUID(),
        req.userId,
        type,
        departmentDoctor,
        doctor,
        specialty,
        reason,
        notes,
        startValidation.date.toISOString(),
      ]
    );
    await logAudit({
      userId: req.userId,
      action: 'appointment_create',
      metadata: {
        appointmentId: result.rows[0].id,
        startsAt: result.rows[0].starts_at,
        type,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Appointment created',
      appointment: serializeAppointment(result.rows[0]),
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const current = await pool.query(
      'SELECT * FROM appointments WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!current.rows[0]) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const previous = current.rows[0];
    const type = cleanText(req.body.type ?? previous.appointment_type, { max: 150 });
    const departmentDoctor = cleanText(req.body.departmentDoctor ?? previous.department_doctor, { max: 255 });
    const reason = cleanText(req.body.reason ?? previous.reason, { max: 2000, multiline: true });
    const notes = cleanText(req.body.notes ?? previous.notes, { min: 0, max: 5000, multiline: true });
    const startsAt = req.body.startsAt ?? previous.starts_at;
    const validStatuses = ['Upcoming', 'Attended', 'Did not show up', 'Cancelled'];
    const status = req.body.status ?? previous.status;

    if (!type || !departmentDoctor || !reason || notes === null || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment update' });
    }
    const parsed = splitDepartmentDoctor(departmentDoctor);
    const startValidation = validateStartTime(startsAt, { requireFuture: status === 'Upcoming' });
    if (startValidation.error) {
      return res.status(400).json({ success: false, message: startValidation.error });
    }
    if (
      status === 'Upcoming' &&
      await hasOverlappingAppointment(req.userId, startValidation.date, req.params.id)
    ) {
      return res.status(409).json({
        success: false,
        message: 'You already have an appointment within 30 minutes of this time',
      });
    }

    const result = await pool.query(
      `UPDATE appointments SET
         appointment_type = $1,
         department_doctor = $2,
         doctor = $3,
         specialty = $4,
         reason = $5,
         notes = $6,
         starts_at = $7,
         status = $8,
         updated_at = NOW()
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [
        type,
        departmentDoctor,
        parsed.doctor,
        parsed.specialty,
        reason,
        notes,
        startValidation.date.toISOString(),
        status,
        req.params.id,
        req.userId,
      ]
    );
    await logAudit({
      userId: req.userId,
      action: 'appointment_update',
      metadata: {
        appointmentId: result.rows[0].id,
        status: result.rows[0].status,
        startsAt: result.rows[0].starts_at,
      },
    });

    res.json({
      success: true,
      message: 'Appointment updated',
      appointment: serializeAppointment(result.rows[0]),
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE appointments
       SET status = 'Cancelled', updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.userId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    await logAudit({
      userId: req.userId,
      action: 'appointment_cancel',
      metadata: { appointmentId: result.rows[0].id },
    });
    res.json({
      success: true,
      message: 'Appointment cancelled',
      appointment: serializeAppointment(result.rows[0]),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

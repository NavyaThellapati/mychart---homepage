const crypto = require('crypto');
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { pool } = require('../db');

const router = express.Router();

router.use(authMiddleware);

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
    const { type, departmentDoctor, reason, notes = '', startsAt } = req.body;
    if (!type || !departmentDoctor || !reason || !startsAt) {
      return res.status(400).json({
        success: false,
        message: 'Type, doctor, reason, and appointment time are required',
      });
    }

    const startDate = new Date(startsAt);
    if (Number.isNaN(startDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid appointment time' });
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
        startDate.toISOString(),
      ]
    );

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
    const departmentDoctor = req.body.departmentDoctor ?? previous.department_doctor;
    const parsed = splitDepartmentDoctor(departmentDoctor);
    const startsAt = req.body.startsAt ?? previous.starts_at;
    const validStatuses = ['Upcoming', 'Attended', 'Did not show up', 'Cancelled'];
    const status = req.body.status ?? previous.status;

    if (!validStatuses.includes(status) || Number.isNaN(new Date(startsAt).getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid appointment update' });
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
        req.body.type ?? previous.appointment_type,
        departmentDoctor,
        parsed.doctor,
        parsed.specialty,
        req.body.reason ?? previous.reason,
        req.body.notes ?? previous.notes,
        new Date(startsAt).toISOString(),
        status,
        req.params.id,
        req.userId,
      ]
    );

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

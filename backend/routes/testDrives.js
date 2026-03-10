const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { sendTestDriveConfirmationToUser, sendTestDriveNotificationToPortal } = require('../services/email');

// POST /api/test-drives - Book a test drive
router.post('/', authenticateToken, async (req, res) => {
    const { car_id, booking_date, booking_time, preferred_location, notes } = req.body;
    if (!car_id || !booking_date || !booking_time) {
        return res.status(400).json({ success: false, message: 'Car, date and time are required' });
    }
    try {
        // Check for duplicate booking on same date/time for same user+car
        const dup = await pool.query(
            'SELECT id FROM test_drives WHERE user_id=$1 AND car_id=$2 AND booking_date=$3 AND status != $4',
            [req.user.id, car_id, booking_date, 'cancelled']
        );
        if (dup.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'You already have a test drive booked for this car on this date' });
        }
        const result = await pool.query(
            `INSERT INTO test_drives (user_id, car_id, booking_date, booking_time, preferred_location, notes)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [req.user.id, car_id, booking_date, booking_time, preferred_location, notes]
        );

        // Fetch user and car details for email
        const [userRow, carRow] = await Promise.all([
            pool.query('SELECT name, email, phone FROM users WHERE id = $1', [req.user.id]),
            pool.query('SELECT name, model FROM cars WHERE id = $1', [car_id]),
        ]);
        const user = userRow.rows[0];
        const car  = carRow.rows[0];

        // Send emails fire-and-forget (never block or fail the booking response)
        const emailData = {
            userName: user.name, userEmail: user.email, userPhone: user.phone,
            carName: car.name, carModel: car.model,
            bookingDate: booking_date, bookingTime: booking_time,
            location: preferred_location, notes,
        };
        Promise.all([
            sendTestDriveConfirmationToUser(emailData),
            sendTestDriveNotificationToPortal(emailData),
        ]).catch(err => console.error('Email send error (test drive):', err.message));

        res.status(201).json({ success: true, message: 'Test drive booked successfully', booking: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// GET /api/test-drives/my - Get user's own bookings
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT td.*, c.name AS car_name, c.model AS car_model, c.image_url
             FROM test_drives td
             JOIN cars c ON td.car_id = c.id
             WHERE td.user_id = $1 ORDER BY td.booking_date DESC`,
            [req.user.id]
        );
        res.json({ success: true, bookings: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// GET /api/test-drives - Get all bookings (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT td.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
             c.name AS car_name, c.model AS car_model
             FROM test_drives td
             JOIN users u ON td.user_id = u.id
             JOIN cars c ON td.car_id = c.id
             ORDER BY td.booking_date DESC`
        );
        res.json({ success: true, bookings: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// PUT /api/test-drives/:id/status - Update booking status (admin)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    try {
        const result = await pool.query(
            'UPDATE test_drives SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *',
            [status, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        res.json({ success: true, message: 'Status updated', booking: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// DELETE /api/test-drives/:id - Cancel a booking (user)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE test_drives SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 AND user_id=$3 RETURNING *',
            ['cancelled', req.params.id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found or not authorized' });
        }
        res.json({ success: true, message: 'Booking cancelled' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;

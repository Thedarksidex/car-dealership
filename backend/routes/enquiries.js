const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { sendEnquiryConfirmationToUser, sendEnquiryNotificationToPortal } = require('../services/email');

// POST /api/enquiries - Submit an enquiry (public or logged-in)
router.post('/', async (req, res) => {
    const { name, email, phone, car_id, message, type } = req.body;
    if (!name || !email || !phone || !car_id) {
        return res.status(400).json({ success: false, message: 'Name, email, phone, and car are required' });
    }

    // Get optional user_id from auth header if present
    let user_id = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        try {
            const jwt = require('jsonwebtoken');
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            user_id = decoded.id;
        } catch (_) {}
    }

    try {
        // Fetch car name for emails
        const carRow = await pool.query('SELECT name FROM cars WHERE id = $1', [car_id]);
        const carName = carRow.rows.length ? carRow.rows[0].name : 'Unknown Car';

        const result = await pool.query(
            `INSERT INTO enquiries (user_id, name, email, phone, car_id, message, type)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [user_id, name, email, phone, car_id, message, type || 'purchase']
        );

        // Send emails fire-and-forget
        const emailData = { name, email, phone, carName, type: type || 'purchase', message };
        Promise.all([
            sendEnquiryConfirmationToUser(emailData),
            sendEnquiryNotificationToPortal(emailData),
        ]).catch(err => console.error('Email send error (enquiry):', err.message));

        res.status(201).json({ success: true, message: 'Enquiry submitted successfully', enquiry: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// GET /api/enquiries - Get all enquiries (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.*, c.name AS car_name, c.model AS car_model
             FROM enquiries e JOIN cars c ON e.car_id = c.id
             ORDER BY e.created_at DESC`
        );
        res.json({ success: true, enquiries: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// GET /api/enquiries/my - Get user's own enquiries
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.*, c.name AS car_name, c.model AS car_model
             FROM enquiries e JOIN cars c ON e.car_id = c.id
             WHERE e.user_id = $1 ORDER BY e.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, enquiries: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// PUT /api/enquiries/:id/status - Update enquiry status (admin)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'in-progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    try {
        const result = await pool.query(
            'UPDATE enquiries SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *',
            [status, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Enquiry not found' });
        }
        res.json({ success: true, message: 'Status updated', enquiry: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;

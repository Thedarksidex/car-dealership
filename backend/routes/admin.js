const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/admin/dashboard - Admin dashboard stats
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [usersResult, carsResult, testDrivesResult, enquiriesResult] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['user']),
            pool.query('SELECT COUNT(*) FROM cars'),
            pool.query('SELECT COUNT(*) FROM test_drives WHERE status = $1', ['pending']),
            pool.query('SELECT COUNT(*) FROM enquiries WHERE status = $1', ['pending']),
        ]);

        const recentBookings = await pool.query(
            `SELECT td.*, u.name AS user_name, c.name AS car_name
             FROM test_drives td JOIN users u ON td.user_id = u.id JOIN cars c ON td.car_id = c.id
             ORDER BY td.created_at DESC LIMIT 5`
        );

        const recentEnquiries = await pool.query(
            `SELECT e.*, c.name AS car_name
             FROM enquiries e JOIN cars c ON e.car_id = c.id
             ORDER BY e.created_at DESC LIMIT 5`
        );

        res.json({
            success: true,
            stats: {
                totalUsers: parseInt(usersResult.rows[0].count),
                totalCars: parseInt(carsResult.rows[0].count),
                pendingTestDrives: parseInt(testDrivesResult.rows[0].count),
                pendingEnquiries: parseInt(enquiriesResult.rows[0].count),
            },
            recentBookings: recentBookings.rows,
            recentEnquiries: recentEnquiries.rows,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// GET /api/admin/users - List all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, users: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    if (req.user.id === parseInt(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }
    try {
        // Remove FK-linked records first to avoid constraint violations
        await pool.query('DELETE FROM test_drives WHERE user_id = $1', [req.params.id]);
        await pool.query('DELETE FROM enquiries WHERE user_id = $1', [req.params.id]);
        await pool.query('DELETE FROM wishlist WHERE user_id = $1', [req.params.id]);
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;

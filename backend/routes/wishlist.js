const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/wishlist - Get user's wishlist
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT w.id, w.created_at, c.*
             FROM wishlist w JOIN cars c ON w.car_id = c.id
             WHERE w.user_id = $1 ORDER BY w.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, wishlist: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// POST /api/wishlist - Add to wishlist
router.post('/', authenticateToken, async (req, res) => {
    const { car_id } = req.body;
    if (!car_id) {
        return res.status(400).json({ success: false, message: 'Car ID required' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO wishlist (user_id, car_id) VALUES ($1, $2) ON CONFLICT (user_id, car_id) DO NOTHING RETURNING *',
            [req.user.id, car_id]
        );
        if (result.rows.length === 0) {
            return res.status(409).json({ success: false, message: 'Already in wishlist' });
        }
        res.status(201).json({ success: true, message: 'Added to wishlist', item: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// DELETE /api/wishlist/:car_id - Remove from wishlist
router.delete('/:car_id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM wishlist WHERE user_id=$1 AND car_id=$2 RETURNING *',
            [req.user.id, req.params.car_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not in wishlist' });
        }
        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;

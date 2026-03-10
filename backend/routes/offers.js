const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/offers - Get all active offers
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM offers WHERE valid_till >= CURRENT_DATE ORDER BY created_at DESC`
        );
        res.json({ success: true, offers: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// GET /api/offers/all - Get all offers (admin)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM offers ORDER BY created_at DESC');
        res.json({ success: true, offers: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// POST /api/offers - Add offer (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    const { title, description, discount_percent, valid_from, valid_till, applicable_cars } = req.body;
    if (!title || !valid_from || !valid_till) {
        return res.status(400).json({ success: false, message: 'Title and validity dates are required' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO offers (title, description, discount_percent, valid_from, valid_till, applicable_cars)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [title, description, discount_percent, valid_from, valid_till, applicable_cars]
        );
        res.status(201).json({ success: true, message: 'Offer created', offer: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// PUT /api/offers/:id - Update offer (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { title, description, discount_percent, valid_from, valid_till, applicable_cars } = req.body;
    try {
        const result = await pool.query(
            `UPDATE offers SET title=$1, description=$2, discount_percent=$3, valid_from=$4,
             valid_till=$5, applicable_cars=$6, updated_at=CURRENT_TIMESTAMP WHERE id=$7 RETURNING *`,
            [title, description, discount_percent, valid_from, valid_till, applicable_cars, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }
        res.json({ success: true, message: 'Offer updated', offer: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// DELETE /api/offers/:id - Delete offer (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM offers WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Offer deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;

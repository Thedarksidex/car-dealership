const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/faqs - Get all FAQs (optionally filtered by car_id)
router.get('/', async (req, res) => {
    const { car_id } = req.query;
    try {
        let result;
        if (car_id) {
            result = await pool.query(
                'SELECT f.*, c.name AS car_name FROM faqs f LEFT JOIN cars c ON f.car_id = c.id WHERE f.car_id = $1 ORDER BY f.id',
                [car_id]
            );
        } else {
            result = await pool.query(
                'SELECT f.*, c.name AS car_name FROM faqs f LEFT JOIN cars c ON f.car_id = c.id ORDER BY f.id'
            );
        }
        res.json({ success: true, faqs: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// POST /api/faqs - Add FAQ (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    const { car_id, question, answer } = req.body;
    if (!question || !answer) {
        return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO faqs (car_id, question, answer) VALUES ($1,$2,$3) RETURNING *',
            [car_id || null, question, answer]
        );
        res.status(201).json({ success: true, message: 'FAQ added', faq: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// DELETE /api/faqs/:id - Delete FAQ (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM faqs WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'FAQ deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;

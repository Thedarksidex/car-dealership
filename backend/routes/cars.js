const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/cars - Get all cars with optional filters
router.get('/', async (req, res) => {
    const { fuel_type, transmission, min_price, max_price, search } = req.query;
    let query = 'SELECT * FROM cars WHERE 1=1';
    const params = [];
    let idx = 1;

    if (fuel_type) { query += ` AND LOWER(fuel_type) = LOWER($${idx++})`; params.push(fuel_type); }
    if (transmission) { query += ` AND LOWER(transmission) = LOWER($${idx++})`; params.push(transmission); }
    if (min_price) { query += ` AND price >= $${idx++}`; params.push(min_price); }
    if (max_price) { query += ` AND price <= $${idx++}`; params.push(max_price); }
    if (search) {
        query += ` AND (LOWER(name) LIKE LOWER($${idx}) OR LOWER(model) LIKE LOWER($${idx}))`;
        params.push(`%${search}%`);
        idx++;
    }
    query += ' ORDER BY id ASC';

    try {
        const result = await pool.query(query, params);
        res.json({ success: true, cars: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// GET /api/cars/:id - Get single car
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cars WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }
        // Also fetch FAQs for this car
        const faqs = await pool.query('SELECT * FROM faqs WHERE car_id = $1', [req.params.id]);
        res.json({ success: true, car: result.rows[0], faqs: faqs.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// POST /api/cars - Add car (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    const { name, model, price, mileage, fuel_type, transmission, engine_cc, seating_capacity, description, image_url, color_images, features, stock } = req.body;
    if (!name || !model || !price || !mileage || !fuel_type || !transmission) {
        return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    try {
        const colorImagesVal = color_images ? JSON.stringify(color_images) : null;
        const result = await pool.query(
            `INSERT INTO cars (name, model, price, mileage, fuel_type, transmission, engine_cc, seating_capacity, description, image_url, color_images, features, stock)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
            [name, model, price, mileage, fuel_type, transmission, engine_cc, seating_capacity, description, image_url, colorImagesVal, features, stock || 0]
        );
        res.status(201).json({ success: true, message: 'Car added successfully', car: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// PUT /api/cars/:id - Update car (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { name, model, price, mileage, fuel_type, transmission, engine_cc, seating_capacity, description, image_url, color_images, features, stock } = req.body;
    try {
        const colorImagesVal = color_images ? JSON.stringify(color_images) : null;
        const result = await pool.query(
            `UPDATE cars SET name=$1, model=$2, price=$3, mileage=$4, fuel_type=$5, transmission=$6,
             engine_cc=$7, seating_capacity=$8, description=$9, image_url=$10, color_images=$11,
             features=$12, stock=$13, updated_at=CURRENT_TIMESTAMP WHERE id=$14 RETURNING *`,
            [name, model, price, mileage, fuel_type, transmission, engine_cc, seating_capacity, description, image_url, colorImagesVal, features, stock, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }
        res.json({ success: true, message: 'Car updated', car: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// DELETE /api/cars/:id - Delete car (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Remove FK-linked records first to avoid constraint violations
        await pool.query('DELETE FROM faqs WHERE car_id = $1', [req.params.id]);
        await pool.query('DELETE FROM wishlist WHERE car_id = $1', [req.params.id]);
        await pool.query('DELETE FROM enquiries WHERE car_id = $1', [req.params.id]);
        await pool.query('DELETE FROM test_drives WHERE car_id = $1', [req.params.id]);
        await pool.query('DELETE FROM cars WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Car deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;

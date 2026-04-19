const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Build allowed origins list from env (comma-separated) plus local defaults
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:5000',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : []),
];

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || /\.netlify\.app$/.test(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (local dev only)
if (!process.env.IS_NETLIFY_FUNCTION) {
    app.use(express.static(path.join(__dirname, '../frontend')));
}

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/test-drives', require('./routes/testDrives'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/faqs', require('./routes/faqs'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Maruti Dealership API is running', timestamp: new Date() });
});

// SPA fallback – local dev only (Netlify serves static files directly)
if (!process.env.IS_NETLIFY_FUNCTION) {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    });
}

// Start HTTP server only when run directly (not as a serverless function)
if (!process.env.IS_NETLIFY_FUNCTION) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;

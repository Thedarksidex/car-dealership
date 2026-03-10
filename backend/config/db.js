const { Pool } = require('pg');
require('dotenv').config();

// Render (and most PaaS) provide a DATABASE_URL connection string.
// Fall back to individual env vars for local development.
const pool = process.env.DATABASE_URL
    ? new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }, // required by Render's managed PostgreSQL
      })
    : new Pool({
          host:     process.env.DB_HOST     || 'localhost',
          port:     process.env.DB_PORT     || 5432,
          database: process.env.DB_NAME     || 'maruti_showroom',
          user:     process.env.DB_USER     || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
      });

pool.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to PostgreSQL database');
    }
});

module.exports = pool;

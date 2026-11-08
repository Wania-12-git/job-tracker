
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS applications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            company TEXT NOT NULL,
            position TEXT NOT NULL,
            location TEXT,
            date TEXT,
            status TEXT DEFAULT 'Applied'
        );

        CREATE TABLE IF NOT EXISTS migration_log (
            name TEXT PRIMARY KEY,
            completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await pool.query(`
        INSERT INTO users (id, name, email, password_hash)
        VALUES (1, 'JobTracker Owner', 'owner@jobtracker.local', 'NOT_CONFIGURED')
        ON CONFLICT (email) DO NOTHING;
    `);
}

module.exports = { pool, initializeDatabase };

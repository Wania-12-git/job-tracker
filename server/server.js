
"use strict";

// Load environment variables before importing the database
const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, ".env")
});

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { pool, initializeDatabase } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

const VALID_STATUSES = [
    "Applied",
    "Interview",
    "Offer",
    "Rejected"
];

app.use(cors({
    origin: "https://wania-12-git.github.io"
}));

app.use(express.json({ limit: "10kb" }));

// ======================================
// AUTHENTICATION MIDDLEWARE
// ======================================

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Please log in first."
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.userId;
        next();
    } catch {
        return res.status(401).json({
            error: "Invalid or expired login token."
        });
    }
}

// ======================================
// SIGN UP
// ======================================

app.post("/api/auth/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                error: "Please provide a name, email and password."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (cleanName.length < 2 || cleanName.length > 60) {
            return res.status(400).json({
                error: "Name must be between 2 and 60 characters."
            });
        }

        if (
            cleanEmail.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
        ) {
            return res.status(400).json({
                error: "Please enter a valid email address."
            });
        }

        if (
            password.length < 8 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                error: "Password must be at least 8 characters and no more than 72 bytes."
            });
        }

        // Hash the password. Never save the original password.
        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email`,
            [cleanName, cleanEmail, passwordHash]
        );

        const user = result.rows[0];

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "Account created successfully.",
            token,
            user
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "An account with this email already exists."
            });
        }

        console.error(error);
        res.status(500).json({
            error: "Could not create account."
        });
    }
});

// ======================================
// LOG IN
// ======================================

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                error: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const result = await pool.query(
            `SELECT id, name, email, password_hash
             FROM users
             WHERE email = $1`,
            [cleanEmail]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Could not log in."
        });
    }
});

// ======================================
// GET APPLICATIONS
// ======================================

app.get(
    "/api/applications",
    authenticateToken,
    async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT id, company, position, location, date, status
                 FROM applications
                 WHERE user_id = $1
                 ORDER BY id DESC`,
                [req.userId]
            );

            res.json(result.rows);

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: "Could not load applications."
            });
        }
    }
);

// ======================================
// ADD APPLICATION
// ======================================

app.post(
    "/api/applications",
    authenticateToken,
    async (req, res) => {
        try {
            const {
                company,
                position,
                location = "",
                date = "",
                status = "Applied"
            } = req.body;

            if (
                typeof company !== "string" ||
                typeof position !== "string" ||
                typeof location !== "string" ||
                typeof date !== "string" ||
                typeof status !== "string"
            ) {
                return res.status(400).json({
                    error: "Invalid application data."
                });
            }

            const cleanCompany = company.trim();
            const cleanPosition = position.trim();

            if (!cleanCompany || !cleanPosition) {
                return res.status(400).json({
                    error: "Company and position are required."
                });
            }

            if (
                cleanCompany.length > 100 ||
                cleanPosition.length > 100 ||
                location.length > 100
            ) {
                return res.status(400).json({
                    error: "One or more fields are too long."
                });
            }

            if (
                date !== "" &&
                !/^\d{4}-\d{2}-\d{2}$/.test(date)
            ) {
                return res.status(400).json({
                    error: "Date must use YYYY-MM-DD format."
                });
            }

            if (!VALID_STATUSES.includes(status)) {
                return res.status(400).json({
                    error: "Invalid application status."
                });
            }

            const result = await pool.query(
                `INSERT INTO applications
                 (user_id, company, position, location, date, status)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, company, position, location, date, status`,
                [
                    req.userId,
                    cleanCompany,
                    cleanPosition,
                    location.trim(),
                    date,
                    status
                ]
            );

            res.status(201).json(result.rows[0]);

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: "Could not add application."
            });
        }
    }
);

// ======================================
// UPDATE APPLICATION
// ======================================

app.put(
    "/api/applications/:id",
    authenticateToken,
    async (req, res) => {
        try {
            const id = Number(req.params.id);
            const { status } = req.body;

            if (!Number.isSafeInteger(id) || id <= 0) {
                return res.status(400).json({
                    error: "Invalid application ID."
                });
            }

            if (
                typeof status !== "string" ||
                !VALID_STATUSES.includes(status)
            ) {
                return res.status(400).json({
                    error: "Invalid status."
                });
            }

            const result = await pool.query(
                `UPDATE applications
                 SET status = $1
                 WHERE id = $2 AND user_id = $3
                 RETURNING id, company, position, location, date, status`,
                [status, id, req.userId]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    error: "Application not found."
                });
            }

            res.json(result.rows[0]);

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: "Could not update application."
            });
        }
    }
);

// ======================================
// DELETE APPLICATION
// ======================================

app.delete(
    "/api/applications/:id",
    authenticateToken,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isSafeInteger(id) || id <= 0) {
                return res.status(400).json({
                    error: "Invalid application ID."
                });
            }

            const result = await pool.query(
                `DELETE FROM applications
                 WHERE id = $1 AND user_id = $2
                 RETURNING id`,
                [id, req.userId]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    error: "Application not found."
                });
            }

            res.json({
                message: "Application deleted successfully."
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: "Could not delete application."
            });
        }
    }
);

// ======================================
// START SERVER
// ======================================

async function startServer() {
    try {
        if (
            !process.env.JWT_SECRET ||
            process.env.JWT_SECRET.length < 32
        ) {
            throw new Error(
                "JWT_SECRET must be set and at least 32 characters long."
            );
        }

        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`JobTracker running on port ${PORT}`);
            console.log("Connected to Neon PostgreSQL.");
            console.log("Authentication enabled.");
        });

    } catch (error) {
        console.error("Could not start server:", error);
        process.exit(1);
    }
}

startServer();

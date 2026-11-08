
const express = require("express");
const cors = require("cors");
const { pool, initializeDatabase } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: "https://wania-12-git.github.io"
}));

app.use(express.json());

// GET applications
app.get("/api/applications", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, company, position, location, date, status
            FROM applications
            WHERE user_id = 1
            ORDER BY id DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not load applications." });
    }
});

// ADD application
app.post("/api/applications", async (req, res) => {
    try {
        const { company, position, location, date, status } = req.body;

        if (!company || !position) {
            return res.status(400).json({
                error: "Company and position are required."
            });
        }

        const result = await pool.query(`
            INSERT INTO applications
            (user_id, company, position, location, date, status)
            VALUES (1, $1, $2, $3, $4, $5)
            RETURNING id, company, position, location, date, status
        `, [
            company,
            position,
            location || "",
            date || "",
            status || "Applied"
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not add application." });
    }
});

// UPDATE application status
app.put("/api/applications/:id", async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["Applied", "Interview", "Offer", "Rejected"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status." });
        }

        const result = await pool.query(`
            UPDATE applications
            SET status = $1
            WHERE id = $2 AND user_id = 1
            RETURNING id, company, position, location, date, status
        `, [status, req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Application not found." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not update application." });
    }
});

// DELETE application
app.delete("/api/applications/:id", async (req, res) => {
    try {
        const result = await pool.query(`
            DELETE FROM applications
            WHERE id = $1 AND user_id = 1
            RETURNING id
        `, [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Application not found." });
        }

        res.json({ message: "Application deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not delete application." });
    }
});

// Start server after database setup
async function startServer() {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`JobTracker server running on port ${PORT}`);
            console.log("Connected to Neon PostgreSQL.");
        });
    } catch (error) {
        console.error("Could not start server:", error);
        process.exit(1);
    }
}

startServer();

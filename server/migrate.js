
const Database = require("better-sqlite3");
const path = require("path");
const { pool, initializeDatabase } = require("./database");

async function migrate() {
    const sqlite = new Database(
        path.join(__dirname, "jobtracker.db"),
        { readonly: true }
    );

    try {
        await initializeDatabase();

        const check = await pool.query(
            "SELECT name FROM migration_log WHERE name = $1",
            ["sqlite_applications"]
        );

        if (check.rowCount > 0) {
            console.log("Applications already migrated.");
            return;
        }

        const oldApplications = sqlite.prepare(
            "SELECT * FROM applications"
        ).all();

        await pool.query("BEGIN");

        try {
            for (const app of oldApplications) {
                await pool.query(
                    `INSERT INTO applications
                    (user_id, company, position, location, date, status)
                    VALUES (1, $1, $2, $3, $4, $5)`,
                    [
                        app.company,
                        app.position,
                        app.location || "",
                        app.date || "",
                        app.status || "Applied"
                    ]
                );
            }

            await pool.query(
                "INSERT INTO migration_log (name) VALUES ($1)",
                ["sqlite_applications"]
            );

            await pool.query("COMMIT");

            console.log(
                `Successfully migrated ${oldApplications.length} applications to Neon!`
            );
        } catch (error) {
            await pool.query("ROLLBACK");
            throw error;
        }
    } finally {
        sqlite.close();
        await pool.end();
    }
}

migrate().catch(error => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
});

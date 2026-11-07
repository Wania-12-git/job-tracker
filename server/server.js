
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const app = express();
app.use(cors({
    origin: "https://wania-12-git.github.io"
}));
const PORT = 3000;

app.use(express.json());

// Store applications in a JSON file
const dataFile = path.join(__dirname, "applications.json");

function loadApplications() {
    if (!fs.existsSync(dataFile)) {
        fs.writeFileSync(dataFile, "[]");
    }

    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function saveApplications(applications) {
    fs.writeFileSync(
        dataFile,
        JSON.stringify(applications, null, 2)
    );
}

// GET: List all applications
app.get("/api/applications", (req, res) => {
    res.json(loadApplications());
});

// POST: Add an application
app.post("/api/applications", (req, res) => {
    const { company, position, location, date, status } = req.body;

    if (!company || !position) {
        return res.status(400).json({
            error: "Company and position are required."
        });
    }

    const applications = loadApplications();

    const newApplication = {
        id: randomUUID(),
        company,
        position,
        location: location || "",
        date: date || "",
        status: status || "Applied"
    };

    applications.push(newApplication);
    saveApplications(applications);

    res.status(201).json(newApplication);
});

// PUT: Update an application's status
app.put("/api/applications/:id", (req, res) => {
    const applications = loadApplications();

    const application = applications.find(
        item => item.id === req.params.id
    );

    if (!application) {
        return res.status(404).json({
            error: "Application not found."
        });
    }

    const { status } = req.body;

    const validStatuses = [
        "Applied",
        "Interview",
        "Offer",
        "Rejected"
    ];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid status."
        });
    }

    application.status = status;

    saveApplications(applications);

    res.json(application);
});

// DELETE: Remove an application
app.delete("/api/applications/:id", (req, res) => {
    const applications = loadApplications();

    const updatedApplications = applications.filter(
        item => item.id !== req.params.id
    );

    if (updatedApplications.length === applications.length) {
        return res.status(404).json({
            error: "Application not found."
        });
    }

    saveApplications(updatedApplications);

    res.json({
        message: "Application deleted successfully."
    });
});

// Serve the frontend from the parent folder
app.use(express.static(path.join(__dirname, "..")));

app.listen(PORT, () => {
    console.log(`JobTracker server running at http://localhost:${PORT}`);
});

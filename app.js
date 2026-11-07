
"use strict";

// ======================================
// 1. APPLICATION DATA
// ======================================

const API_URL = "/api/applications";

const VALID_STATUSES = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected"
];

let applications = [];


// ======================================
// 2. API FUNCTIONS
// ======================================

// GET: Load applications from Express

async function loadApplications() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Could not load applications.");
    }

    applications = await response.json();

    displayApplications();

  } catch (error) {
    console.error("Loading error:", error);

    const message = document.getElementById("empty-message");

    if (message) {
      message.textContent =
        "Could not connect to the server. Is it running?";
    }
  }
}


// POST: Add an application

async function addApplication(event) {
  event.preventDefault();

  const company =
    document.getElementById("company").value.trim();

  const position =
    document.getElementById("position").value.trim();

  const location =
    document.getElementById("location").value.trim();

  const date =
    document.getElementById("date").value;

  const status =
    document.getElementById("status").value;

  const message =
    document.getElementById("application-message");

  if (!company || !position || !location || !date) {
    message.textContent = "Please complete every field.";
    return;
  }

  if (!VALID_STATUSES.includes(status)) {
    message.textContent = "Please select a valid status.";
    return;
  }

  const newApplication = {
    company,
    position,
    location,
    date,
    status
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(newApplication)
    });

    if (!response.ok) {
      throw new Error("Could not add application.");
    }

    const savedApplication = await response.json();

    applications.push(savedApplication);

    displayApplications();

    document.getElementById("application-form").reset();

    message.textContent = "Application added successfully!";

  } catch (error) {
    console.error("Add error:", error);

    message.textContent =
      "Could not add application. Check your server.";
  }
}


// PUT: Update an application's status

async function updateApplication(id, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          status: newStatus
        })
      }
    );

    if (!response.ok) {
      throw new Error("Could not update application.");
    }

    const updatedApplication = await response.json();

    applications = applications.map(app =>
      app.id === id ? updatedApplication : app
    );

    displayApplications();

    document.getElementById("application-message").textContent =
      "Status updated successfully!";

  } catch (error) {
    console.error("Update error:", error);

    document.getElementById("application-message").textContent =
      "Could not update status.";

    await loadApplications();
  }
}


// DELETE: Remove an application

async function deleteApplication(id) {
  try {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {
      throw new Error("Could not delete application.");
    }

    applications = applications.filter(app => app.id !== id);

    displayApplications();

    document.getElementById("application-message").textContent =
      "Application deleted successfully!";

  } catch (error) {
    console.error("Delete error:", error);

    document.getElementById("application-message").textContent =
      "Could not delete application.";
  }
}


// ======================================
// 3. UPDATE STATISTICS
// ======================================

function updateStatistics() {
  const total = applications.length;

  const applied = applications.filter(
    app => app.status === "Applied"
  ).length;

  const interviews = applications.filter(
    app => app.status === "Interview"
  ).length;

  const offers = applications.filter(
    app => app.status === "Offer"
  ).length;

  document.getElementById("total-count").textContent = total;

  document.getElementById("applied-count").textContent = applied;

  document.getElementById("interview-count").textContent = interviews;

  document.getElementById("offer-count").textContent = offers;
}


// ======================================
// 4. DISPLAY APPLICATIONS
// ======================================

function displayApplications() {
  const table = document.getElementById("applications-table");

  if (!table) return;

  const filter = document.getElementById("status-filter");

  const selectedFilter = filter ? filter.value : "All";

  table.replaceChildren();

  const filteredApplications = applications.filter(app => {
    return selectedFilter === "All" ||
      app.status === selectedFilter;
  });

  filteredApplications.forEach(app => {
    const row = document.createElement("tr");

    // COMPANY, POSITION, LOCATION AND DATE

    const values = [
      app.company,
      app.position,
      app.location,
      app.date
    ];

    values.forEach(value => {
      const cell = document.createElement("td");

      cell.textContent = value;

      row.appendChild(cell);
    });


    // STATUS DROPDOWN

    const statusCell = document.createElement("td");

    const statusSelect = document.createElement("select");

    statusSelect.className = "status-select";

    statusSelect.setAttribute(
      "aria-label",
      `Change status for ${app.company}`
    );

    VALID_STATUSES.forEach(status => {
      const option = document.createElement("option");

      option.value = status;
      option.textContent = status;

      if (app.status === status) {
        option.selected = true;
      }

      statusSelect.appendChild(option);
    });

    statusSelect.addEventListener("change", () => {
      updateApplication(app.id, statusSelect.value);
    });

    statusCell.appendChild(statusSelect);

    row.appendChild(statusCell);


    // DELETE BUTTON

    const actionCell = document.createElement("td");

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className = "delete-button";

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteApplication(app.id);
    });

    actionCell.appendChild(deleteButton);

    row.appendChild(actionCell);

    table.appendChild(row);
  });


  // EMPTY MESSAGE

  const emptyMessage = document.getElementById("empty-message");

  if (emptyMessage) {
    emptyMessage.textContent =
      filteredApplications.length === 0
        ? "No applications found."
        : "";
  }

  updateStatistics();
}


// ======================================
// 5. DASHBOARD EVENTS
// ======================================

function setupDashboard() {
  const form = document.getElementById("application-form");

  const filter = document.getElementById("status-filter");

  if (!form || !filter) return;

  form.addEventListener("submit", addApplication);

  filter.addEventListener("change", displayApplications);

  loadApplications();
}


// ======================================
// 6. LOGIN DEMONSTRATION
// ======================================

function setupLogin() {
  const form = document.getElementById("login-form");

  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    document.getElementById("login-message").textContent =
      "Demo only: real authentication is not connected yet.";
  });
}


// ======================================
// 7. SIGNUP DEMONSTRATION
// ======================================

function setupSignup() {
  const form = document.getElementById("signup-form");

  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    document.getElementById("signup-message").textContent =
      "Demo only: account creation is not connected yet.";
  });
}


// ======================================
// 8. START THE APPLICATION
// ======================================

document.addEventListener("DOMContentLoaded", () => {
  setupDashboard();

  setupLogin();

  setupSignup();

  console.log("JobTracker successfully loaded!");
});

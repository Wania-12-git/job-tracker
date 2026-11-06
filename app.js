"use strict";

// ======================================
// 1. DEFAULT APPLICATIONS
// ======================================

const STORAGE_KEY = "jobtracker_applications";

const DEFAULT_APPLICATIONS = [
  {
    id: 1,
    company: "Google",
    position: "Junior Web Developer",
    location: "Toronto",
    date: "2026-10-20",
    status: "Interview"
  },
  {
    id: 2,
    company: "Microsoft",
    position: "Software Engineer",
    location: "Vancouver",
    date: "2026-10-25",
    status: "Applied"
  },
  {
    id: 3,
    company: "Amazon",
    position: "Frontend Developer",
    location: "New York",
    date: "2026-10-30",
    status: "Applied"
  }
];

const VALID_STATUSES = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected"
];


// ======================================
// 2. LOAD AND SAVE DATA
// ======================================

function loadApplications() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData === null) {
      return [...DEFAULT_APPLICATIONS];
    }

    const parsedData = JSON.parse(savedData);

    if (!Array.isArray(parsedData)) {
      return [...DEFAULT_APPLICATIONS];
    }

    return parsedData.filter(app =>
      app &&
      Number.isFinite(app.id) &&
      typeof app.company === "string" &&
      typeof app.position === "string" &&
      typeof app.location === "string" &&
      typeof app.date === "string" &&
      VALID_STATUSES.includes(app.status)
    );

  } catch (error) {
    console.error("Error loading applications:", error);
    return [...DEFAULT_APPLICATIONS];
  }
}

let applications = loadApplications();


function saveApplications() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(applications)
    );

    return true;

  } catch (error) {
    console.error("Error saving applications:", error);
    return false;
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

  const selectedFilter =
    document.getElementById("status-filter").value;

  table.replaceChildren();

  const filteredApplications = applications.filter(app => {

    return selectedFilter === "All" ||
           app.status === selectedFilter;

  });

  filteredApplications.forEach(app => {

    const row = document.createElement("tr");

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


    // STATUS

    const statusCell = document.createElement("td");

    const statusBadge = document.createElement("span");

    statusBadge.className = "status";

    statusBadge.textContent = app.status;

    statusCell.appendChild(statusBadge);

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

  if (filteredApplications.length === 0) {
    emptyMessage.textContent = "No applications found.";
  } else {
    emptyMessage.textContent = "";
  }

  updateStatistics();
}


// ======================================
// 5. ADD APPLICATION
// ======================================

function addApplication(event) {

  event.preventDefault();

  const company = document.getElementById("company").value.trim();

  const position = document.getElementById("position").value.trim();

  const location = document.getElementById("location").value.trim();

  const date = document.getElementById("date").value;

  const status = document.getElementById("status").value;

  const message = document.getElementById("application-message");


  if (!company || !position || !location || !date) {
    message.textContent = "Please complete every field.";
    return;
  }

  if (!VALID_STATUSES.includes(status)) {
    message.textContent = "Please select a valid status.";
    return;
  }


  const newApplication = {
    id: Date.now(),
    company,
    position,
    location,
    date,
    status
  };


  applications.push(newApplication);

  const saved = saveApplications();

  displayApplications();

  document.getElementById("application-form").reset();

  message.textContent = saved
    ? "Application added successfully!"
    : "Added temporarily, but could not save it.";

}


// ======================================
// 6. DELETE APPLICATION
// ======================================

function deleteApplication(id) {

  applications = applications.filter(app => app.id !== id);

  saveApplications();

  displayApplications();

  document.getElementById("application-message").textContent =
    "Application deleted.";

}


// ======================================
// 7. DASHBOARD EVENTS
// ======================================

function setupDashboard() {

  const form = document.getElementById("application-form");

  const filter = document.getElementById("status-filter");

  if (!form || !filter) return;

  form.addEventListener("submit", addApplication);

  filter.addEventListener("change", displayApplications);

  displayApplications();

}


// ======================================
// 8. LOGIN DEMONSTRATION
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
// 9. SIGNUP DEMONSTRATION
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
// 10. START THE APPLICATION
// ======================================

document.addEventListener("DOMContentLoaded", () => {

  setupDashboard();

  setupLogin();

  setupSignup();

  console.log("JobTracker successfully loaded!");

});
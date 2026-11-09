
"use strict";

// ======================================
// 1. CONFIGURATION
// ======================================

const API_BASE_URL = "https://job-tracker-api-nlc9.onrender.com/api";

const API_URL = `${API_BASE_URL}/applications`;

const TOKEN_KEY = "jobtracker_token";

const VALID_STATUSES = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected"
];

let applications = [];


// ======================================
// 2. AUTHENTICATION HELPERS
// ======================================

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  window.location.href = "login.html";
}

function authHeaders(extraHeaders = {}) {
  return {
    ...extraHeaders,
    Authorization: `Bearer ${getToken()}`
  };
}

async function handleUnauthorized(response) {
  if (response.status === 401) {
    sessionStorage.removeItem(TOKEN_KEY);
    window.location.href = "login.html";
    return true;
  }

  return false;
}


// ======================================
// 3. SIGN UP
// ======================================

function setupSignup() {
  const form = document.getElementById("signup-form");

  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const message = document.getElementById("signup-message");
    const button = form.querySelector('button[type="submit"]');

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;

    message.textContent = "";

    if (name.length < 2 || password.length < 8) {
      message.textContent = "Please check your name and password.";
      return;
    }

    button.disabled = true;
    button.textContent = "Creating account...";

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create account.");
      }

      saveToken(data.token);

      message.textContent = "Account created successfully!";

      window.location.href = "dashboard.html";

    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
      button.textContent = "Create Account";
    }
  });
}


// ======================================
// 4. LOGIN
// ======================================

function setupLogin() {
  const form = document.getElementById("login-form");

  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const message = document.getElementById("login-message");
    const button = form.querySelector('button[type="submit"]');

    const emailInput =
      document.getElementById("login-email") ||
      document.getElementById("email");

    const passwordInput =
      document.getElementById("login-password") ||
      document.getElementById("password");

    if (!emailInput || !passwordInput) {
      message.textContent = "Login form fields are missing.";
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    message.textContent = "";

    button.disabled = true;
    button.textContent = "Logging in...";

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      saveToken(data.token);

      message.textContent = "Login successful!";

      window.location.href = "dashboard.html";

    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
      button.textContent = "Login";
    }
  });
}


// ======================================
// 5. LOAD APPLICATIONS
// ======================================

async function loadApplications() {
  try {
    const response = await fetch(API_URL, {
      headers: authHeaders()
    });

    if (await handleUnauthorized(response)) return;

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
        "Could not connect to the server. Please try again.";
    }
  }
}


// ======================================
// 6. ADD APPLICATION
// ======================================

async function addApplication(event) {
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

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: authHeaders({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        company,
        position,
        location,
        date,
        status
      })
    });

    if (await handleUnauthorized(response)) return;

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not add application.");
    }

    applications.push(data);

    displayApplications();

    document.getElementById("application-form").reset();

    message.textContent = "Application added successfully!";

  } catch (error) {
    console.error("Add error:", error);
    message.textContent = error.message;
  }
}


// ======================================
// 7. UPDATE APPLICATION
// ======================================

async function updateApplication(id, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) return;

  try {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: authHeaders({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          status: newStatus
        })
      }
    );

    if (await handleUnauthorized(response)) return;

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not update application.");
    }

    applications = applications.map(app =>
      app.id === id ? data : app
    );

    displayApplications();

    document.getElementById("application-message").textContent =
      "Status updated successfully!";

  } catch (error) {
    console.error("Update error:", error);

    document.getElementById("application-message").textContent =
      error.message;

    await loadApplications();
  }
}


// ======================================
// 8. DELETE APPLICATION
// ======================================

async function deleteApplication(id) {
  try {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: authHeaders()
      }
    );

    if (await handleUnauthorized(response)) return;

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not delete application.");
    }

    applications = applications.filter(app => app.id !== id);

    displayApplications();

    document.getElementById("application-message").textContent =
      "Application deleted successfully!";

  } catch (error) {
    console.error("Delete error:", error);

    document.getElementById("application-message").textContent =
      error.message;
  }
}


// ======================================
// 9. UPDATE STATISTICS
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
// 10. DISPLAY APPLICATIONS
// ======================================

function displayApplications() {
  const table = document.getElementById("applications-table");

  if (!table) return;

  const filter = document.getElementById("status-filter");

  const selectedFilter = filter ? filter.value : "All";

  table.replaceChildren();

  const filteredApplications = applications.filter(app =>
    selectedFilter === "All" || app.status === selectedFilter
  );

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
      option.selected = app.status === status;

      statusSelect.appendChild(option);
    });

    statusSelect.addEventListener("change", () => {
      updateApplication(app.id, statusSelect.value);
    });

    statusCell.appendChild(statusSelect);
    row.appendChild(statusCell);

    // DELETE

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
// 11. DASHBOARD
// ======================================

function setupDashboard() {
  const form = document.getElementById("application-form");
  const filter = document.getElementById("status-filter");

  if (!form || !filter) return;

  if (!getToken()) {
    window.location.href = "login.html";
    return;
  }

  form.addEventListener("submit", addApplication);

  filter.addEventListener("change", displayApplications);

  loadApplications();
}


// ======================================
// 12. LOGOUT
// ======================================

function setupLogout() {
  const logoutButton = document.getElementById("logout-button");

  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }
}


// ======================================
// 13. START APPLICATION
// ======================================

document.addEventListener("DOMContentLoaded", () => {
  setupSignup();
  setupLogin();
  setupDashboard();
  setupLogout();

  console.log("JobTracker successfully loaded!");
});

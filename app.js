// ==========================================
// JOBTRACKER - JAVASCRIPT
// ==========================================

// 1. VARIABLES AND ARRAYS

const STORAGE_KEY = "jobTrackerApplications";

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


// 2. LOAD APPLICATIONS FROM LOCAL STORAGE

function loadApplications() {

  try {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      return [...DEFAULT_APPLICATIONS];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [...DEFAULT_APPLICATIONS];

  } catch (error) {

    console.error("Could not read saved applications:", error);

    return [...DEFAULT_APPLICATIONS];

  }

}


// MAIN APPLICATION ARRAY

let applications = loadApplications();


// 3. SAVE APPLICATIONS

function saveApplications() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(applications)
    );

  } catch (error) {

    console.error("Could not save applications:", error);

    const message = document.getElementById("application-message");

    if (message) {
      message.textContent =
        "Your browser could not save the changes.";
    }

  }

}


// 4. UPDATE DASHBOARD STATISTICS

function updateOverview() {

  const counts = {

    "total-count": applications.length,

    "interview-count":
      applications.filter(app => app.status === "Interview").length,

    "offer-count":
      applications.filter(app => app.status === "Offer").length,

    "rejected-count":
      applications.filter(app => app.status === "Rejected").length

  };

  Object.entries(counts).forEach(([id, count]) => {

    const element = document.getElementById(id);

    if (element) {
      element.textContent = count;
    }

  });

}


// 5. DISPLAY APPLICATIONS IN THE TABLE

function displayApplications() {

  const table = document.getElementById("applications-table");

  const filter = document.getElementById("status-filter");

  if (!table || !filter) return;

  table.replaceChildren();

  const selectedStatus = filter.value;

  const visibleApplications = applications.filter(app =>

    selectedStatus === "All" || app.status === selectedStatus

  );


  // Show message if there are no matching applications

  if (visibleApplications.length === 0) {

    const row = document.createElement("tr");

    const cell = document.createElement("td");

    cell.colSpan = 6;

    cell.textContent = "No applications match this filter.";

    row.appendChild(cell);

    table.appendChild(row);

  }


  // LOOP THROUGH APPLICATIONS

  visibleApplications.forEach(application => {

    const row = document.createElement("tr");


    // COMPANY, POSITION, LOCATION AND DATE

    [
      application.company,
      application.position,
      application.location,
      application.date

    ].forEach(value => {

      const cell = document.createElement("td");

      cell.textContent = value;

      row.appendChild(cell);

    });


    // STATUS

    const statusCell = document.createElement("td");

    const pill = document.createElement("span");

    pill.className = "status-pill";

    pill.textContent = application.status;

    statusCell.appendChild(pill);

    row.appendChild(statusCell);


    // DELETE BUTTON

    const actionCell = document.createElement("td");

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className = "delete-button";

    deleteButton.textContent = "Delete";

    deleteButton.setAttribute(
      "aria-label",
      `Delete ${application.company} application`
    );

    deleteButton.addEventListener("click", () => {

      deleteApplication(application.id);

    });

    actionCell.appendChild(deleteButton);

    row.appendChild(actionCell);


    // ADD ROW TO TABLE

    table.appendChild(row);

  });


  updateOverview();

}


// 6. ADD A NEW APPLICATION

function addApplication(event) {

  event.preventDefault();

  const form = event.currentTarget;


  // CREATE A NEW APPLICATION OBJECT

  const newApplication = {

    id: Date.now(),

    company: document.getElementById("company").value.trim(),

    position: document.getElementById("position").value.trim(),

    location: document.getElementById("location").value.trim(),

    date: document.getElementById("date").value,

    status: document.getElementById("status").value

  };


  // CHECK REQUIRED INFORMATION

  if (
    !newApplication.company ||
    !newApplication.position ||
    !newApplication.location ||
    !newApplication.date
  ) {

    return;

  }


  // ADD APPLICATION TO ARRAY

  applications.push(newApplication);


  // SAVE CHANGES

  saveApplications();


  // RESET FILTER

  const filter = document.getElementById("status-filter");

  if (filter) {
    filter.value = "All";
  }


  // UPDATE TABLE

  displayApplications();


  // CLEAR FORM

  form.reset();


  // SUCCESS MESSAGE

  const message = document.getElementById("application-message");

  if (message) {

    message.textContent =
      `${newApplication.company} was added successfully.`;

  }

}


// 7. DELETE AN APPLICATION

function deleteApplication(id) {

  applications = applications.filter(app => app.id !== id);

  saveApplications();

  displayApplications();

}


// 8. SET UP DASHBOARD EVENTS

function setupDashboard() {

  const form = document.getElementById("application-form");

  const filter = document.getElementById("status-filter");


  // CHECK WHETHER DASHBOARD EXISTS

  if (!form || !filter) return;


  // FORM SUBMISSION EVENT

  form.addEventListener("submit", addApplication);


  // FILTER CHANGE EVENT

  filter.addEventListener("change", displayApplications);


  // INITIAL DISPLAY

  displayApplications();

}


// 9. LOGIN AND SIGNUP DEMONSTRATION

function setupDemoAuthForms() {

  const loginForm = document.getElementById("login-form");


  // LOGIN FORM

  if (loginForm) {

    loginForm.addEventListener("submit", event => {

      event.preventDefault();

      document.getElementById("login-message").textContent =

        "Demo only: secure login is not connected yet. No password was sent or saved.";

    });

  }


  const signupForm = document.getElementById("signup-form");


  // SIGNUP FORM

  if (signupForm) {

    signupForm.addEventListener("submit", event => {

      event.preventDefault();

      document.getElementById("signup-message").textContent =

        "Demo only: account creation is not connected yet. No password was sent or saved.";

    });

  }

}


// 10. START APPLICATION

document.addEventListener("DOMContentLoaded", () => {

  setupDashboard();

  setupDemoAuthForms();

});
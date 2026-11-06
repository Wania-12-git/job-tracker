
// =====================================
// JOB TRACKER - JAVASCRIPT
// =====================================


// 1. VARIABLES AND ARRAYS

const STORAGE_KEY = "jobTrackerApplications";

const defaultApplications = [
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

let applications = loadApplications();


// 2. SELECT HTML ELEMENTS

const form = document.getElementById("application-form");
const table = document.getElementById("applications-table");
const filter = document.getElementById("status-filter");


// 3. LOAD DATA FROM LOCAL STORAGE

function loadApplications() {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData !== null) {
        try {
            const parsedData = JSON.parse(savedData);

            if (Array.isArray(parsedData)) {
                return parsedData;
            }
        } catch (error) {
            console.error("Could not load saved applications:", error);
        }
    }

    return defaultApplications;
}


// 4. SAVE DATA TO LOCAL STORAGE

function saveApplications() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(applications)
    );
}


// 5. DISPLAY APPLICATIONS

function displayApplications() {

    table.innerHTML = "";

    const selectedStatus = filter.value;

    const filteredApplications = applications.filter(application => {
        return selectedStatus === "All" ||
               application.status === selectedStatus;
    });

    if (filteredApplications.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "No applications found.";

        row.appendChild(cell);
        table.appendChild(row);

    } else {

        filteredApplications.forEach(application => {

            const row = document.createElement("tr");

            const companyCell = document.createElement("td");
            const positionCell = document.createElement("td");
            const locationCell = document.createElement("td");
            const dateCell = document.createElement("td");
            const statusCell = document.createElement("td");
            const actionCell = document.createElement("td");

            companyCell.textContent = application.company;
            positionCell.textContent = application.position;
            locationCell.textContent = application.location;
            dateCell.textContent = application.date;
            statusCell.textContent = application.status;

            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.type = "button";

            deleteButton.addEventListener("click", function() {
                deleteApplication(application.id);
            });

            actionCell.appendChild(deleteButton);

            row.append(
                companyCell,
                positionCell,
                locationCell,
                dateCell,
                statusCell,
                actionCell
            );

            table.appendChild(row);
        });
    }

    updateOverview();
}


// 6. ADD A NEW APPLICATION

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const newApplication = {

        id: Date.now(),

        company: document.getElementById("company").value.trim(),

        position: document.getElementById("position").value.trim(),

        location: document.getElementById("location").value.trim(),

        date: document.getElementById("date").value,

        status: document.getElementById("status").value
    };

    applications.push(newApplication);

    saveApplications();

    displayApplications();

    form.reset();
});


// 7. DELETE AN APPLICATION

function deleteApplication(id) {

    applications = applications.filter(function(application) {
        return application.id !== id;
    });

    saveApplications();

    displayApplications();
}


// 8. FILTER APPLICATIONS

filter.addEventListener("change", function() {
    displayApplications();
});


// 9. UPDATE DASHBOARD STATISTICS

function updateOverview() {

    document.getElementById("total-count").textContent =
        applications.length;

    document.getElementById("interview-count").textContent =
        applications.filter(app => app.status === "Interview").length;

    document.getElementById("offer-count").textContent =
        applications.filter(app => app.status === "Offer").length;

    document.getElementById("rejected-count").textContent =
        applications.filter(app => app.status === "Rejected").length;
}


// 10. INITIALIZE THE APPLICATION

saveApplications();
displayApplications();

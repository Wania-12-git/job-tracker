# JobTracker

A full-stack job application tracker that helps users organize and manage their job search.

**Live Demo:** https://wania-12-git.github.io/job-tracker/

## Features

- Create an account and log in.
- Secure password hashing.
- JWT-based authentication.
- Add, view, update, and delete job applications.
- Track application statuses:
  - Applied
  - Interview
  - Offer
  - Rejected
- Filter applications by status.
- Separate application data for each user.
- Persistent PostgreSQL database.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML | Page structure |
| CSS | Styling and layout |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime |
| Express.js | Backend API |
| PostgreSQL | Database |
| Neon | Hosted PostgreSQL |
| Render | Backend hosting |
| GitHub Pages | Frontend hosting |
| Git & GitHub | Version control |

## Screenshots

Add screenshots of your application here.

Suggested screenshots:
- Landing page
- Sign-up page
- Login page
- Dashboard with applications

## Project Architecture

The frontend communicates with the Express backend using HTTP requests (`fetch()`).

The backend handles authentication and application management, while PostgreSQL stores user accounts and job applications.

## Live Application

https://wania-12-git.github.io/job-tracker/

## What I Learned

Through this project, I gained experience with:

- Building responsive web interfaces.
- Connecting a frontend to a backend API.
- Creating REST API endpoints.
- Working with PostgreSQL databases.
- Implementing user authentication.
- Using Git and GitHub for version control.
- Deploying a full-stack application.

## Future Improvements

- Application search.
- Dashboard analytics and charts.
- Application deadlines and reminders.
- Export applications to CSV.

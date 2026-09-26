# student-attendance-system

Simple institute attendance management system built with Express and SQLite.

Features:
- Manage classes
- Add students by class
- Record attendance by date
- View attendance list for each class
- Easy to extend for desktop app later

## Tech stack
- Node.js
- Express
- SQLite
- Plain HTML/CSS/JavaScript frontend

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app:
   ```bash
   npm start
   ```

3. Open the browser:
   ```bash
   http://localhost:3000
   ```

## Project structure

- `server.js` — Express server and API routes
- `db.js` — SQLite database setup and seeding
- `public/` — frontend files
- `data/attendance.db` — SQLite database file created automatically

## Future desktop version
This app is structured so it can later be wrapped with Electron or a desktop shell without reworking the core attendance workflow.

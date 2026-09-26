const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'attendance.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

function initDatabase(callback) {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        roll_number TEXT NOT NULL,
        UNIQUE(class_id, roll_number),
        FOREIGN KEY(class_id) REFERENCES classes(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'absent',
        notes TEXT DEFAULT '',
        UNIQUE(student_id, date),
        FOREIGN KEY(student_id) REFERENCES students(id),
        FOREIGN KEY(class_id) REFERENCES classes(id)
      )
    `);

    db.run(`
      INSERT OR IGNORE INTO classes (name) VALUES ('Class 1A')
    `);

    db.run(`
      INSERT OR IGNORE INTO students (class_id, name, roll_number) VALUES
      (1, 'Ahmed Ali', '01'),
      (1, 'Sara Hassan', '02'),
      (1, 'Khalid Omar', '03'),
      (1, 'Noura Salem', '04')
    `);

    if (typeof callback === 'function') {
      callback();
    }
  });
}

db.initDatabase = initDatabase;

module.exports = db;

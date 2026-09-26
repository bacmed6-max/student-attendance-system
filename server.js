const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/classes', (req, res) => {
  db.all('SELECT * FROM classes ORDER BY name ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to fetch classes' });
    }
    res.json(rows);
  });
});

app.post('/api/classes', (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Class name is required' });
  }

  db.run(
    'INSERT INTO classes (name) VALUES (?)',
    [name.trim()],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Unable to create class' });
      }

      res.status(201).json({ id: this.lastID, name: name.trim() });
    }
  );
});

app.get('/api/classes/:classId/students', (req, res) => {
  const { classId } = req.params;

  db.all(
    `SELECT * FROM students WHERE class_id = ? ORDER BY roll_number ASC, name ASC`,
    [classId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to fetch students' });
      }
      res.json(rows);
    }
  );
});

app.post('/api/students', (req, res) => {
  const { classId, name, rollNumber } = req.body;

  if (!classId || !name || !name.trim() || !rollNumber || !rollNumber.toString().trim()) {
    return res.status(400).json({ error: 'Class, student name, and roll number are required' });
  }

  db.run(
    'INSERT INTO students (class_id, name, roll_number) VALUES (?, ?, ?)',
    [classId, name.trim(), rollNumber.toString().trim()],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Unable to create student' });
      }

      res.status(201).json({
        id: this.lastID,
        class_id: classId,
        name: name.trim(),
        roll_number: rollNumber.toString().trim()
      });
    }
  );
});

app.get('/api/attendance', (req, res) => {
  const { classId, date } = req.query;

  if (!classId || !date) {
    return res.status(400).json({ error: 'classId and date are required' });
  }

  db.all(
    `SELECT s.id, s.name, s.roll_number, a.status, a.notes
     FROM students s
     LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
     WHERE s.class_id = ?
     ORDER BY s.roll_number ASC, s.name ASC`,
    [date, classId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to fetch attendance' });
      }
      res.json(rows);
    }
  );
});

app.post('/api/attendance', (req, res) => {
  const { classId, date, records } = req.body;

  if (!classId || !date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Invalid attendance payload' });
  }

  const sql = `
    INSERT INTO attendance (student_id, class_id, date, status, notes)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(student_id, date) DO UPDATE SET
      class_id = excluded.class_id,
      status = excluded.status,
      notes = excluded.notes
  `;

  db.serialize(() => {
    let completed = 0;

    if (records.length === 0) {
      return res.json({ success: true, updated: 0 });
    }

    records.forEach((record) => {
      db.run(
        sql,
        [record.studentId, classId, date, record.status, record.notes || ''],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Unable to save attendance' });
          }

          completed += 1;
          if (completed === records.length) {
            res.json({ success: true, updated: completed });
          }
        }
      );
    });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

db.initDatabase(() => {
  app.listen(PORT, () => {
    console.log(`Student attendance system running on http://localhost:${PORT}`);
  });
});

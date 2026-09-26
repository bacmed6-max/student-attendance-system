* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f3f7fb;
  color: #1f2d3d;
}

button, input, select {
  font: inherit;
}

.app-shell {
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: #132238;
  color: white;
  padding: 24px 18px;
}

.sidebar h1,
.sidebar h2,
.main-content h2,
.main-content h3 {
  margin-top: 0;
}

.sidebar section {
  margin-top: 28px;
}

.stack-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input, select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #dfe7f2;
}

button {
  background: #2f80ed;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
}

button:hover {
  background: #266cc1;
}

.main-content {
  padding: 28px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 18px;
  margin-bottom: 22px;
}

.date-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}

.class-picker {
  margin-bottom: 22px;
}

.attendance-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 18px rgba(19, 34, 56, 0.08);
  padding: 18px;
}

.attendance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border-bottom: 1px solid #edf1f7;
  padding: 12px 10px;
  text-align: center;
}

th {
  background: #f7f9fd;
}

.status-group {
  display: flex;
  justify-content: center;
}

.status-group input {
  width: 18px;
  height: 18px;
}

.notes-input {
  width: 140px;
}

@media (max-width: 900px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}

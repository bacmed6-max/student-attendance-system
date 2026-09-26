const state = {
  classes: [],
  selectedClassId: null,
  attendanceDate: '',
  attendanceData: []
};

const classForm = document.getElementById('classForm');
const studentForm = document.getElementById('studentForm');
const classNameInput = document.getElementById('className');
const studentClassSelect = document.getElementById('studentClassSelect');
const classSelect = document.getElementById('classSelect');
const studentNameInput = document.getElementById('studentName');
const rollNumberInput = document.getElementById('rollNumber');
const attendanceDateInput = document.getElementById('attendanceDate');
const attendanceTableBody = document.getElementById('attendanceTableBody');
const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString + 'T00:00:00').toISOString().slice(0, 10);
}

function setTodayDate() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60 * 1000);
  state.attendanceDate = localDate.toISOString().slice(0, 10);
  attendanceDateInput.value = state.attendanceDate;
}

async function fetchClasses() {
  const response = await fetch('/api/classes');
  const classes = await response.json();
  state.classes = classes;

  if (!classes.length) {
    classSelect.innerHTML = '<option value="">No classes available</option>';
    studentClassSelect.innerHTML = '<option value="">Add a class first</option>';
    return;
  }

  state.selectedClassId = state.selectedClassId || classes[0].id;

  const options = classes
    .map((cls) => `<option value="${cls.id}">${cls.name}</option>`)
    .join('');

  classSelect.innerHTML = options;
  studentClassSelect.innerHTML = options;
  classSelect.value = String(state.selectedClassId);
  studentClassSelect.value = String(state.selectedClassId);

  await fetchAttendance();
}

async function fetchAttendance() {
  if (!state.selectedClassId || !state.attendanceDate) {
    attendanceTableBody.innerHTML = '';
    return;
  }

  const response = await fetch(`/api/attendance?classId=${state.selectedClassId}&date=${state.attendanceDate}`);
  const records = await response.json();
  state.attendanceData = records;

  renderAttendanceTable(records);
}

function renderAttendanceTable(records) {
  if (!records.length) {
    attendanceTableBody.innerHTML = '<tr><td colspan="7">No students in this class yet.</td></tr>';
    return;
  }

  attendanceTableBody.innerHTML = records
    .map((student, index) => {
      const status = student.status || 'absent';
      const notes = student.notes || '';

      return `
        <tr data-student-id="${student.id}">
          <td>${index + 1}</td>
          <td>${student.name}</td>
          <td>${student.roll_number}</td>
          <td>
            <div class="status-group">
              <label><input type="radio" name="status-${student.id}" value="present" ${status === 'present' ? 'checked' : ''} /></label>
            </div>
          </td>
          <td>
            <div class="status-group">
              <label><input type="radio" name="status-${student.id}" value="absent" ${status === 'absent' ? 'checked' : ''} /></label>
            </div>
          </td>
          <td>
            <div class="status-group">
              <label><input type="radio" name="status-${student.id}" value="late" ${status === 'late' ? 'checked' : ''} /></label>
            </div>
          </td>
          <td>
            <input class="notes-input" type="text" value="${notes}" data-notes="${student.id}" />
          </td>
        </tr>
      `;
    })
    .join('');
}

classForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = classNameInput.value.trim();
  if (!name) return;

  const response = await fetch('/api/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  if (response.ok) {
    classNameInput.value = '';
    await fetchClasses();
  } else {
    alert('Unable to create class');
  }
});

studentForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const classId = studentClassSelect.value;
  const name = studentNameInput.value.trim();
  const rollNumber = rollNumberInput.value.trim();

  if (!classId || !name || !rollNumber) {
    alert('Please complete all student fields');
    return;
  }

  const response = await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classId, name, rollNumber })
  });

  if (response.ok) {
    studentNameInput.value = '';
    rollNumberInput.value = '';
    await fetchAttendance();
  } else {
    alert('Unable to add student');
  }
});

classSelect.addEventListener('change', (event) => {
  state.selectedClassId = Number(event.target.value);
  fetchAttendance();
});

attendanceDateInput.addEventListener('change', (event) => {
  state.attendanceDate = event.target.value;
  fetchAttendance();
});

saveAttendanceBtn.addEventListener('click', async () => {
  if (!state.selectedClassId || !state.attendanceDate) {
    alert('Please select a class and date');
    return;
  }

  const rows = [...document.querySelectorAll('#attendanceTableBody tr')];
  const records = rows.map((row) => {
    const studentId = Number(row.dataset.studentId);
    const checkedStatus = row.querySelector('input[type="radio"]:checked');
    const noteInput = row.querySelector('.notes-input');

    return {
      studentId,
      status: checkedStatus ? checkedStatus.value : 'absent',
      notes: noteInput ? noteInput.value : ''
    };
  });

  const response = await fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      classId: state.selectedClassId,
      date: state.attendanceDate,
      records
    })
  });

  if (response.ok) {
    alert('Attendance saved successfully');
    await fetchAttendance();
  } else {
    alert('Unable to save attendance');
  }
});

async function init() {
  setTodayDate();
  await fetchClasses();
}

init();

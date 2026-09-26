const STORAGE_KEY = 'attendance_system_v2';

const state = {
  classes: [],
  selectedClassId: null,
  attendanceDate: ''
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

function getData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return {
      classes: [{ id: 1, name: 'الفصل 1' }],
      students: [{ id: 1, classId: 1, name: 'أحمد علي', rollNumber: '01' }, { id: 2, classId: 1, name: 'سارة حسن', rollNumber: '02' }],
      attendance: {}
    };
  }

  return JSON.parse(saved);
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function setTodayDate() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60 * 1000);
  state.attendanceDate = localDate.toISOString().slice(0, 10);
  attendanceDateInput.value = state.attendanceDate;
}

function renderClassOptions() {
  const data = getData();
  state.classes = data.classes;

  if (!state.classes.length) {
    classSelect.innerHTML = '<option value="">لا توجد فصول</option>';
    studentClassSelect.innerHTML = '<option value="">أضف فصل أولاً</option>';
    return;
  }

  if (!state.selectedClassId) {
    state.selectedClassId = state.classes[0].id;
  }

  const options = state.classes
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join('');

  classSelect.innerHTML = options;
  studentClassSelect.innerHTML = options;
  classSelect.value = String(state.selectedClassId);
  studentClassSelect.value = String(state.selectedClassId);
}

function renderAttendanceTable() {
  const data = getData();
  const selectedClassStudents = data.students.filter((student) => student.classId === Number(state.selectedClassId));

  if (!selectedClassStudents.length) {
    attendanceTableBody.innerHTML = '<tr><td colspan="7">لا توجد طلاب في هذا الفصل</td></tr>';
    return;
  }

  const recordsForDate = data.attendance[state.attendanceDate] || {};

  attendanceTableBody.innerHTML = selectedClassStudents
    .map((student, index) => {
      const studentRecord = recordsForDate[student.id] || { status: 'absent', notes: '' };
      const selectedStatus = studentRecord.status || 'absent';
      const notes = studentRecord.notes || '';

      return `
        <tr data-student-id="${student.id}">
          <td>${index + 1}</td>
          <td>${student.name}</td>
          <td>${student.rollNumber}</td>
          <td><div class="status-group"><input type="radio" name="status-${student.id}" value="present" ${selectedStatus === 'present' ? 'checked' : ''} /></div></td>
          <td><div class="status-group"><input type="radio" name="status-${student.id}" value="absent" ${selectedStatus === 'absent' ? 'checked' : ''} /></div></td>
          <td><div class="status-group"><input type="radio" name="status-${student.id}" value="late" ${selectedStatus === 'late' ? 'checked' : ''} /></div></td>
          <td><input class="notes-input" type="text" value="${notes}" /></td>
        </tr>
      `;
    })
    .join('');
}

classForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = classNameInput.value.trim();
  if (!name) return;

  const data = getData();
  const newClass = {
    id: Date.now(),
    name
  };

  data.classes.push(newClass);
  saveData(data);
  classNameInput.value = '';
  state.selectedClassId = newClass.id;
  renderClassOptions();
  renderAttendanceTable();
});

studentForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const classId = Number(studentClassSelect.value);
  const name = studentNameInput.value.trim();
  const rollNumber = rollNumberInput.value.trim();

  if (!classId || !name || !rollNumber) {
    alert('يرجى تعبئة جميع الحقول');
    return;
  }

  const data = getData();
  data.students.push({
    id: Date.now(),
    classId,
    name,
    rollNumber
  });

  saveData(data);
  studentNameInput.value = '';
  rollNumberInput.value = '';
  renderAttendanceTable();
});

classSelect.addEventListener('change', (event) => {
  state.selectedClassId = Number(event.target.value);
  renderAttendanceTable();
});

attendanceDateInput.addEventListener('change', (event) => {
  state.attendanceDate = event.target.value;
  renderAttendanceTable();
});

saveAttendanceBtn.addEventListener('click', () => {
  const data = getData();
  if (!state.selectedClassId || !state.attendanceDate) {
    alert('يرجى اختيار الفصل والتاريخ');
    return;
  }

  const rows = [...document.querySelectorAll('#attendanceTableBody tr')];
  if (!rows.length) {
    alert('لا توجد بيانات للحفظ');
    return;
  }

  const attendanceMap = data.attendance[state.attendanceDate] || {};

  rows.forEach((row) => {
    const studentId = Number(row.dataset.studentId);
    const checked = row.querySelector('input[type="radio"]:checked');
    const noteInput = row.querySelector('.notes-input');

    attendanceMap[studentId] = {
      status: checked ? checked.value : 'absent',
      notes: noteInput ? noteInput.value : ''
    };
  });

  data.attendance[state.attendanceDate] = attendanceMap;
  saveData(data);
  alert('تم حفظ الحضور بنجاح');
});

function init() {
  setTodayDate();
  renderClassOptions();
  renderAttendanceTable();
}

init();

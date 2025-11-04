// State - stored in memory instead of localStorage
let schedules = [];
let assignments = [];
let editingClassId = null;

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderSchedule();
    renderAssignments();
});

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // Filter day
    document.getElementById('filterDay').addEventListener('change', (e) => {
        renderSchedule(e.target.value);
    });

    // Search assignments
    document.getElementById('searchAssignments').addEventListener('input', (e) => {
        renderAssignments(e.target.value);
    });

    // Add class button
    document.getElementById('addClassBtn').addEventListener('click', openAddClassModal);

    // Add assignment button
    document.getElementById('addAssignmentBtn').addEventListener('click', openAddAssignmentModal);

    // Save class button
    document.getElementById('saveClassBtn').addEventListener('click', saveClass);

    // Save assignment button
    document.getElementById('saveAssignmentBtn').addEventListener('click', saveAssignment);

    // Close modals on outside click
    document.getElementById('classModal').addEventListener('click', (e) => {
        if (e.target.id === 'classModal') closeClassModal();
    });

    document.getElementById('assignmentModal').addEventListener('click', (e) => {
        if (e.target.id === 'assignmentModal') closeAssignmentModal();
    });
}

// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}Tab`).classList.add('active');
}

// Render schedule
function renderSchedule(filterDay = 'all') {
    const grid = document.getElementById('scheduleGrid');
    grid.innerHTML = '';

    const daysToShow = filterDay === 'all' ? days : [filterDay];

    daysToShow.forEach(day => {
        const dayClasses = schedules
            .filter(cls => cls.day === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.innerHTML = `
            <h3>${day}</h3>
            <div class="class-list">
                ${dayClasses.length === 0 
                    ? '<div class="no-classes">No classes scheduled</div>'
                    : dayClasses.map(cls => createClassCard(cls)).join('')
                }
            </div>
        `;
        grid.appendChild(dayCard);
    });
}

// Create class card HTML
function createClassCard(cls) {
    return `
        <div class="class-item" style="border-left-color: ${cls.color}; background-color: ${cls.color}10">
            <div class="class-header">
                <div class="class-title">${cls.subject}</div>
                <div class="class-actions">
                    <button class="icon-btn" onclick="editClass(${cls.id})">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-btn" onclick="deleteClass(${cls.id})">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #ef4444">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            ${cls.code ? `<div class="class-code">${cls.code}</div>` : ''}
            <div class="class-time">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${cls.startTime} - ${cls.endTime}
            </div>
            ${cls.instructor ? `<div class="class-info">👨‍🏫 ${cls.instructor}</div>` : ''}
            ${cls.room ? `<div class="class-info">📍 ${cls.room}</div>` : ''}
        </div>
    `;
}

// Class modal functions
function openAddClassModal() {
    editingClassId = null;
    document.getElementById('classModalTitle').textContent = 'Add New Class';
    document.getElementById('classSubject').value = '';
    document.getElementById('classCode').value = '';
    document.getElementById('classInstructor').value = '';
    document.getElementById('classRoom').value = '';
    document.getElementById('classDay').value = 'Monday';
    document.getElementById('classStartTime').value = '08:00';
    document.getElementById('classEndTime').value = '09:00';
    document.getElementById('classColor').value = '#3b82f6';
    document.getElementById('classModal').classList.add('active');
}

function closeClassModal() {
    document.getElementById('classModal').classList.remove('active');
    editingClassId = null;
}

function editClass(id) {
    const cls = schedules.find(c => c.id === id);
    if (!cls) return;

    editingClassId = id;
    document.getElementById('classModalTitle').textContent = 'Edit Class';
    document.getElementById('classSubject').value = cls.subject;
    document.getElementById('classCode').value = cls.code || '';
    document.getElementById('classInstructor').value = cls.instructor || '';
    document.getElementById('classRoom').value = cls.room || '';
    document.getElementById('classDay').value = cls.day;
    document.getElementById('classStartTime').value = cls.startTime;
    document.getElementById('classEndTime').value = cls.endTime;
    document.getElementById('classColor').value = cls.color;
    document.getElementById('classModal').classList.add('active');
}

function saveClass() {
    const subject = document.getElementById('classSubject').value.trim();
    const code = document.getElementById('classCode').value.trim();
    const instructor = document.getElementById('classInstructor').value.trim();
    const room = document.getElementById('classRoom').value.trim();
    const day = document.getElementById('classDay').value;
    const startTime = document.getElementById('classStartTime').value;
    const endTime = document.getElementById('classEndTime').value;
    const color = document.getElementById('classColor').value;

    if (!subject || !startTime || !endTime) {
        alert('Please fill in all required fields');
        return;
    }

    if (startTime >= endTime) {
        alert('End time must be after start time');
        return;
    }

    const classData = {
        subject,
        code,
        instructor,
        room,
        day,
        startTime,
        endTime,
        color
    };

    if (editingClassId) {
        // Update existing class
        const index = schedules.findIndex(c => c.id === editingClassId);
        schedules[index] = { ...classData, id: editingClassId };
    } else {
        // Add new class
        const newClass = {
            id: Date.now(),
            ...classData
        };
        schedules.push(newClass);
    }

    renderSchedule(document.getElementById('filterDay').value);
    closeClassModal();
}

function deleteClass(id) {
    if (!confirm('Are you sure you want to delete this class?')) return;

    schedules = schedules.filter(c => c.id !== id);
    renderSchedule(document.getElementById('filterDay').value);
}

// Render assignments
function renderAssignments(searchQuery = '') {
    const list = document.getElementById('assignmentsList');
    
    let filteredAssignments = assignments;
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredAssignments = assignments.filter(a => 
            a.subject.toLowerCase().includes(query) ||
            a.title.toLowerCase().includes(query)
        );
    }

    // Sort by due date
    filteredAssignments.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    // Update count
    const pendingCount = assignments.filter(a => !a.completed).length;
    document.getElementById('assignmentCount').textContent = `(${pendingCount})`;

    if (filteredAssignments.length === 0) {
        list.innerHTML = '<div class="no-classes">No assignments found</div>';
        return;
    }

    list.innerHTML = filteredAssignments.map(a => createAssignmentCard(a)).join('');
}

// Create assignment card HTML
function createAssignmentCard(assignment) {
    const daysUntil = getDaysUntilDue(assignment.dueDate);
    const dueBadge = getDueBadge(daysUntil, assignment.completed);
    
    return `
        <div class="assignment-card ${assignment.completed ? 'completed' : ''}">
            <div class="assignment-header">
                <div class="assignment-left">
                    <div class="assignment-checkbox">
                        <input type="checkbox" 
                               ${assignment.completed ? 'checked' : ''} 
                               onchange="toggleAssignment(${assignment.id})">
                        <div class="assignment-title ${assignment.completed ? 'completed' : ''}">
                            ${assignment.title}
                        </div>
                    </div>
                    <div class="assignment-subject">${assignment.subject}</div>
                    ${assignment.description ? `<div class="assignment-description">${assignment.description}</div>` : ''}
                </div>
                <button class="icon-btn" onclick="deleteAssignment(${assignment.id})">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #ef4444">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
            <div class="assignment-footer">
                <div class="assignment-due">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Due: ${formatDate(assignment.dueDate)}
                    ${dueBadge}
                </div>
                <div class="priority-badge priority-${assignment.priority}">
                    ${assignment.priority.toUpperCase()}
                </div>
            </div>
        </div>
    `;
}

// Assignment modal functions
function openAddAssignmentModal() {
    document.getElementById('assignmentSubject').value = '';
    document.getElementById('assignmentTitle').value = '';
    document.getElementById('assignmentDescription').value = '';
    document.getElementById('assignmentDueDate').value = '';
    document.getElementById('assignmentPriority').value = 'medium';
    document.getElementById('assignmentModal').classList.add('active');
}

function closeAssignmentModal() {
    document.getElementById('assignmentModal').classList.remove('active');
}

function saveAssignment() {
    const subject = document.getElementById('assignmentSubject').value.trim();
    const title = document.getElementById('assignmentTitle').value.trim();
    const description = document.getElementById('assignmentDescription').value.trim();
    const dueDate = document.getElementById('assignmentDueDate').value;
    const priority = document.getElementById('assignmentPriority').value;

    if (!subject || !title || !dueDate) {
        alert('Please fill in all required fields');
        return;
    }

    const newAssignment = {
        id: Date.now(),
        subject,
        title,
        description,
        dueDate,
        priority,
        completed: false
    };

    assignments.push(newAssignment);
    renderAssignments();
    closeAssignmentModal();
}

function toggleAssignment(id) {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
        assignment.completed = !assignment.completed;
        renderAssignments(document.getElementById('searchAssignments').value);
    }
}

function deleteAssignment(id) {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    assignments = assignments.filter(a => a.id !== id);
    renderAssignments(document.getElementById('searchAssignments').value);
}

// Helper functions
function getDaysUntilDue(dueDate) {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function getDueBadge(days, completed) {
    if (completed) return '';
    
    let badgeClass = 'due-normal';
    let text = '';

    if (days < 0) {
        badgeClass = 'due-overdue';
        text = `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`;
    } else if (days === 0) {
        badgeClass = 'due-soon';
        text = 'Due today';
    } else if (days === 1) {
        badgeClass = 'due-soon';
        text = 'Due tomorrow';
    } else if (days <= 3) {
        badgeClass = 'due-soon';
        text = `${days} days left`;
    } else {
        text = `${days} days left`;
    }

    return `<span class="due-badge ${badgeClass}">${text}</span>`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
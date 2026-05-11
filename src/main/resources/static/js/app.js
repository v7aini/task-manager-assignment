const API_URL = '/api';
let currentUser = null;
let currentProjectId = null;

// DOM Elements
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginCard = document.getElementById('login-card');
const signupCard = document.getElementById('signup-card');

// Check for token on load
window.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('user');
    if (user) {
        currentUser = JSON.parse(user);
        setupApp();
    }
});

function toggleAuth() {
    if (loginCard.style.display === 'none') {
        loginCard.style.display = 'block';
        signupCard.style.display = 'none';
    } else {
        loginCard.style.display = 'none';
        signupCard.style.display = 'block';
    }
}

// Auth Handlers
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_URL}/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('user', JSON.stringify(data));
            currentUser = data;
            setupApp();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        alert('Error connecting to server');
    }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;

    try {
        const res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role })
        });
        const data = await res.json();
        if (res.ok) {
            alert('Signup successful! Please sign in.');
            toggleAuth();
        } else {
            alert(data.message || 'Signup failed');
        }
    } catch (err) {
        console.error(err);
        alert('Error connecting to server');
    }
});

function setupApp() {
    authSection.style.display = 'none';
    appSection.style.display = 'grid';
    document.getElementById('user-display').textContent = `Logged in as: ${currentUser.username} (${currentUser.role.replace('ROLE_', '')})`;
    
    if (currentUser.role === 'ROLE_ADMIN') {
        document.getElementById('admin-nav').style.display = 'flex';
        document.getElementById('create-project-btn').style.display = 'block';
    } else {
        document.getElementById('create-project-btn').style.display = 'none';
    }
    
    showDashboard();
    lucide.createIcons();
}

function logout() {
    localStorage.removeItem('user');
    location.reload();
}

// Navigation
function hideAllViews() {
    const views = ['dashboard-view', 'projects-view', 'tasks-view', 'project-detail-view'];
    views.forEach(v => document.getElementById(v).style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
}

async function showDashboard() {
    hideAllViews();
    document.getElementById('dashboard-view').style.display = 'block';
    document.querySelector('.nav-item:nth-child(1)').classList.add('active');
    
    const projects = await fetchApi('/projects');
    const tasks = await fetchApi('/tasks');
    
    const statsContainer = document.getElementById('dashboard-stats');
    statsContainer.innerHTML = `
        <div class="project-card glass-panel fade-in">
            <h3>Active Projects</h3>
            <p style="font-size: 2.5rem; font-weight: 800; color: var(--primary);">${projects.length}</p>
        </div>
        <div class="project-card glass-panel fade-in">
            <h3>Total Tasks</h3>
            <p style="font-size: 2.5rem; font-weight: 800; color: var(--accent);">${tasks.length}</p>
        </div>
        <div class="project-card glass-panel fade-in">
            <h3>Pending Tasks</h3>
            <p style="font-size: 2.5rem; font-weight: 800; color: var(--danger);">${tasks.filter(t => t.status !== 'DONE').length}</p>
        </div>
    `;
}

async function showProjects() {
    hideAllViews();
    document.getElementById('projects-view').style.display = 'block';
    document.querySelector('.nav-item:nth-child(2)').classList.add('active');
    
    const projects = await fetchApi('/projects');
    const list = document.getElementById('projects-list');
    list.innerHTML = projects.map(p => `
        <div class="project-card glass-panel fade-in" onclick="viewProject(${p.id})">
            <h3 style="margin-bottom: 0.5rem;">${p.name}</h3>
            <p style="color: var(--text-muted); font-size: 0.875rem;">${p.description || 'No description'}</p>
            <div style="margin-top: 1.5rem; font-size: 0.75rem; color: var(--primary);">
                View Details →
            </div>
        </div>
    `).join('');
}

async function viewProject(id) {
    currentProjectId = id;
    hideAllViews();
    const project = await fetchApi(`/projects/${id}`);
    const tasks = await fetchApi(`/tasks`); // In a real app, filter by project
    const projectTasks = tasks.filter(t => t.project.id === id);

    document.getElementById('project-detail-view').style.display = 'block';
    document.getElementById('current-project-name').textContent = project.name;
    document.getElementById('current-project-desc').textContent = project.description;
    
    if (currentUser.role !== 'ROLE_ADMIN') {
        document.getElementById('create-task-btn').style.display = 'none';
    } else {
        document.getElementById('create-task-btn').style.display = 'block';
    }

    renderTasks(projectTasks, 'project-tasks-list');
}

async function showTasks() {
    hideAllViews();
    document.getElementById('tasks-view').style.display = 'block';
    document.querySelector('.nav-item:nth-child(3)').classList.add('active');
    
    const tasks = await fetchApi('/tasks');
    renderTasks(tasks, 'tasks-list');
}

function renderTasks(tasks, containerId) {
    const list = document.getElementById(containerId);
    list.innerHTML = tasks.map(t => `
        <div class="task-item glass-panel fade-in">
            <div>
                <h4 style="margin-bottom: 0.25rem;">${t.title}</h4>
                <p style="color: var(--text-muted); font-size: 0.875rem;">${t.description || ''}</p>
                <div style="margin-top: 0.5rem; font-size: 0.75rem;">
                    Priority: <span style="color: ${t.priority === 'HIGH' ? 'var(--danger)' : 'var(--text-muted)'}">${t.priority}</span>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <select onchange="updateTaskStatus(${t.id}, this.value)" class="form-input" style="width: auto; padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                    <option value="TODO" ${t.status === 'TODO' ? 'selected' : ''}>TODO</option>
                    <option value="IN_PROGRESS" ${t.status === 'IN_PROGRESS' ? 'selected' : ''}>IN PROGRESS</option>
                    <option value="DONE" ${t.status === 'DONE' ? 'selected' : ''}>DONE</option>
                </select>
                <span class="status-badge status-${t.status.toLowerCase().replace('_', '')}">${t.status}</span>
            </div>
        </div>
    `).join('');
}

// API Helpers
async function fetchApi(endpoint, options = {}) {
    const headers = {
        'Authorization': `Bearer ${currentUser.token}`,
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (res.status === 401) logout();
    if (!res.ok) throw new Error('API Error');
    return res.json();
}

// Modal Logic
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
    if (id === 'task-modal') loadUsers();
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

async function loadUsers() {
    const users = await fetchApi('/users');
    const select = document.getElementById('task-assignee');
    select.innerHTML = users.map(u => `<option value="${u.id}">${u.username}</option>`).join('');
}

// Forms
document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('project-name').value;
    const description = document.getElementById('project-desc').value;
    
    await fetchApi('/projects', {
        method: 'POST',
        body: JSON.stringify({ name, description })
    });
    
    closeModal('project-modal');
    showProjects();
});

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const priority = document.getElementById('task-priority').value;
    const dueDate = document.getElementById('task-date').value;
    const assigneeId = document.getElementById('task-assignee').value;
    
    const task = await fetchApi(`/tasks/project/${currentProjectId}`, {
        method: 'POST',
        body: JSON.stringify({ title, description, priority, dueDate })
    });
    
    await fetchApi(`/tasks/${task.id}/assignee?userId=${assigneeId}`, { method: 'PUT' });
    
    closeModal('task-modal');
    viewProject(currentProjectId);
});

async function updateTaskStatus(id, status) {
    await fetchApi(`/tasks/${id}/status?status=${status}`, { method: 'PUT' });
    // Refresh current view
    if (document.getElementById('tasks-view').style.display === 'block') showTasks();
    else viewProject(currentProjectId);
}

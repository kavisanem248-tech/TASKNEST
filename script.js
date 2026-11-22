/**
 * ==============================================================================
 * TASKNEST – SMART TASK MANAGEMENT APP
 * EdBytes Full Stack Development – TASK-FSD-02
 * Clean Vanilla JavaScript Implementation
 * ==============================================================================
 */

(function () {
  'use strict';

  // LocalStorage Key
  const STORAGE_KEY = 'tasknest_tasks';

  // Application State
  let tasks = [];
  let currentFilter = 'all'; // 'all' | 'active' | 'completed'

  // DOM Elements
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const prioritySelect = document.getElementById('prioritySelect');
  const validationMsg = document.getElementById('validationMsg');
  const validationText = document.getElementById('validationText');
  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const emptyTitle = document.getElementById('emptyTitle');
  const emptyDesc = document.getElementById('emptyDesc');
  const progressFill = document.getElementById('progressFill');
  const statsCount = document.getElementById('statsCount');
  const statsPercent = document.getElementById('statsPercent');
  const countAll = document.getElementById('countAll');
  const countActive = document.getElementById('countActive');
  const countCompleted = document.getElementById('countCompleted');
  const filterTabs = document.getElementById('filterTabs');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');
  const toastContainer = document.getElementById('toastContainer');

  // ----------------------------------------------------------------------------
  // INITIALIZATION
  // ----------------------------------------------------------------------------
  function init() {
    loadTasksFromStorage();
    setupEventListeners();
    render();
  }

  // ----------------------------------------------------------------------------
  // LOCAL STORAGE OPERATIONS
  // ----------------------------------------------------------------------------
  function loadTasksFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        tasks = JSON.parse(stored);
      } else {
        // Initial sample tasks for first-time evaluation
        tasks = [
          {
            id: 'task_' + (Date.now() - 3000),
            text: 'Explore TaskNest Smart Task Manager',
            completed: true,
            priority: 'Normal',
            createdAt: 'Completed'
          },
          {
            id: 'task_' + (Date.now() - 2000),
            text: 'Submit EdBytes Full Stack Assignment TASK-FSD-02',
            completed: false,
            priority: 'High',
            createdAt: 'Today'
          },
          {
            id: 'task_' + (Date.now() - 1000),
            text: 'Practice JavaScript LocalStorage and DOM manipulation',
            completed: false,
            priority: 'Low',
            createdAt: 'Today'
          }
        ];
        saveTasksToStorage();
      }
    } catch (err) {
      console.warn('Failed to parse tasks from LocalStorage, resetting:', err);
      tasks = [];
    }
  }

  function saveTasksToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to save tasks to LocalStorage:', err);
      showToast('Error saving data to browser storage', 'danger');
    }
  }

  // ----------------------------------------------------------------------------
  // TASK CRUD OPERATIONS
  // ----------------------------------------------------------------------------
  function addTask(text, priority = 'Normal') {
    const trimmed = text.trim();

    // Prevent empty or whitespace-only task submissions
    if (!trimmed) {
      showValidationError('Please enter a task before submitting!');
      taskInput.classList.add('input-error');
      taskInput.focus();
      return false;
    }

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      text: trimmed,
      completed: false,
      priority: priority,
      createdAt: 'Just now'
    };

    tasks.unshift(newTask);
    saveTasksToStorage();
    render();
    showToast('Task added successfully!', 'success');

    // Reset input
    taskInput.value = '';
    clearValidationError();
    taskInput.focus();
    return true;
  }

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    saveTasksToStorage();
    render();

    if (task.completed) {
      showToast('Task completed!', 'success');
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasksToStorage();
    render();
    showToast('Task deleted', 'danger');
  }

  function clearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      showToast('No completed tasks to clear', 'danger');
      return;
    }

    tasks = tasks.filter(t => !t.completed);
    saveTasksToStorage();
    render();
    showToast(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}`, 'success');
  }

  // ----------------------------------------------------------------------------
  // VALIDATION FEEDBACK
  // ----------------------------------------------------------------------------
  function showValidationError(message) {
    validationText.textContent = message;
    validationMsg.classList.add('visible');
  }

  function clearValidationError() {
    validationMsg.classList.remove('visible');
    taskInput.classList.remove('input-error');
  }

  // ----------------------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // ----------------------------------------------------------------------------
  function showToast(message, type = 'success') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 250);
    }, 2400);
  }

  // ----------------------------------------------------------------------------
  // RENDERING & UI UPDATES
  // ----------------------------------------------------------------------------
  function render() {
    renderTaskList();
    updateStats();
  }

  function renderTaskList() {
    taskList.innerHTML = '';

    // Filter tasks based on selected tab
    const filteredTasks = tasks.filter(task => {
      if (currentFilter === 'active') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true; // 'all'
    });

    // Handle Empty States
    if (tasks.length === 0) {
      emptyTitle.textContent = 'No tasks yet!';
      emptyDesc.textContent = 'Add your first task above and start organizing your day.';
      emptyState.classList.add('visible');
    } else if (filteredTasks.length === 0) {
      emptyTitle.textContent = `No ${currentFilter} tasks`;
      emptyDesc.textContent = currentFilter === 'completed' 
        ? 'You have not completed any tasks yet.' 
        : 'All tasks have been completed! Great job.';
      emptyState.classList.add('visible');
    } else {
      emptyState.classList.remove('visible');
    }

    // Build Task Items
    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.setAttribute('data-id', task.id);

      const priorityClass = `priority-${task.priority.toLowerCase()}`;

      li.innerHTML = `
        <div class="task-left">
          <button type="button" class="task-checkbox" aria-label="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
          <div class="task-content">
            <span class="task-text">${escapeHtml(task.text)}</span>
            <div class="task-meta">
              <span class="priority-badge ${priorityClass}">${task.priority}</span>
              <span class="task-date">${task.createdAt || 'Added'}</span>
            </div>
          </div>
        </div>
        <button type="button" class="task-delete-btn" aria-label="Delete task" title="Delete task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      // Event Listeners for Task Items
      const checkbox = li.querySelector('.task-checkbox');
      const textSpan = li.querySelector('.task-text');
      const deleteBtn = li.querySelector('.task-delete-btn');

      checkbox.addEventListener('click', () => toggleTask(task.id));
      textSpan.addEventListener('click', () => toggleTask(task.id));
      deleteBtn.addEventListener('click', () => deleteTask(task.id));

      taskList.appendChild(li);
    });
  }

  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Update Progress Bar & Counter
    progressFill.style.width = `${percentage}%`;
    statsCount.textContent = `${completed} of ${total} completed`;
    statsPercent.textContent = `${percentage}%`;

    // Update Tab Badges
    countAll.textContent = total;
    countActive.textContent = active;
    countCompleted.textContent = completed;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ----------------------------------------------------------------------------
  // EVENT LISTENERS
  // ----------------------------------------------------------------------------
  function setupEventListeners() {
    // Form submission
    taskForm.addEventListener('submit', function (e) {
      e.preventDefault();
      addTask(taskInput.value, prioritySelect.value);
    });

    // Clear validation error when user types
    taskInput.addEventListener('input', function () {
      if (validationMsg.classList.contains('visible')) {
        clearValidationError();
      }
    });

    // Filter Tabs
    filterTabs.addEventListener('click', function (e) {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;

      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentFilter = btn.getAttribute('data-filter');
      renderTaskList();
    });

    // Clear Completed Button
    clearCompletedBtn.addEventListener('click', clearCompleted);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

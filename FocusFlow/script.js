/**
 * ==============================================================================
 * FOCUSFLOW – SMART PRODUCTIVITY MANAGER
 * Pure Vanilla JavaScript Application Logic
 * ==============================================================================
 */

(function () {
  'use strict';

  // ----------------------------------------------------------------------------
  // APPLICATION CONSTANTS & LOCAL STORAGE KEYS
  // ----------------------------------------------------------------------------
  const STORAGE_KEYS = {
    TASKS: 'focusflow_tasks',
    SETTINGS: 'focusflow_settings'
  };

  const CATEGORIES = ['College', 'Projects', 'Internship', 'Personal', 'Other'];
  const PRIORITIES = ['High', 'Medium', 'Low'];

  // Inspirational productivity quotes for the dashboard hero
  const PRODUCTIVITY_QUOTES = [
    '"The secret of getting ahead is getting started." – Mark Twain',
    '"Focus on being productive instead of busy." – Tim Ferriss',
    '"Small daily improvements over time lead to stunning results." – Robin Sharma',
    '"Action is the foundational key to all success." – Pablo Picasso',
    '"Your future is created by what you do today, not tomorrow." – Robert Kiyosaki'
  ];

  // ----------------------------------------------------------------------------
  // APPLICATION STATE
  // ----------------------------------------------------------------------------
  let appState = {
    tasks: [],
    settings: {
      displayName: 'Productive User',
      theme: 'theme-dark',
      showToasts: true
    },
    currentView: 'dashboard',
    filters: {
      search: '',
      status: 'All',       // 'All', 'Pending', 'Completed', 'Overdue'
      category: 'All',     // 'All', 'College', 'Projects', 'Internship', 'Personal', 'Other'
      priority: 'All'      // 'All', 'High', 'Medium', 'Low'
    },
    calendar: {
      year: new Date().getFullYear(),
      month: new Date().getMonth(), // 0 - 11
      selectedDate: getTodayDateString()
    },
    pendingConfirmAction: null
  };

  // ----------------------------------------------------------------------------
  // DATE UTILITY FUNCTIONS
  // ----------------------------------------------------------------------------
  /**
   * Returns today's date formatted as YYYY-MM-DD
   */
  function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format date for human friendly display (e.g. "Sunday, Nov 22, 2026")
   */
  function formatDateFriendly(dateObj) {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format YYYY-MM-DD string to short format (e.g. "Nov 22, 2026")
   */
  function formatDateStringShort(dateStr) {
    if (!dateStr) return 'No due date';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Check if a date string is strictly overdue (before today and task not completed)
   */
  function isDateOverdue(dateStr) {
    if (!dateStr) return false;
    const todayStr = getTodayDateString();
    return dateStr < todayStr;
  }

  /**
   * Check if date string is today
   */
  function isDateToday(dateStr) {
    if (!dateStr) return false;
    return dateStr === getTodayDateString();
  }

  /**
   * Check if date string is tomorrow
   */
  function isDateTomorrow(dateStr) {
    if (!dateStr) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    return dateStr === `${y}-${m}-${d}`;
  }

  // ----------------------------------------------------------------------------
  // STARTER SAMPLE DATA (For first-time visits)
  // ----------------------------------------------------------------------------
  function getDefaultSampleTasks() {
    const today = getTodayDateString();
    
    // Tomorrow date string
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    // Overdue date string (yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    // Next week date string
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 5);
    const nextWeekStr = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`;

    return [
      {
        id: 'task_sample_1',
        title: 'Complete FocusFlow Frontend Architecture',
        description: 'Build complete HTML5, CSS3 glassmorphic design and modular Vanilla JavaScript productivity engine.',
        category: 'Projects',
        priority: 'High',
        dueDate: today,
        completed: true,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      },
      {
        id: 'task_sample_2',
        title: 'Prepare AI & Full-Stack Internship Weekly Report',
        description: 'Summarize work completed, pull requests, key learnings, and sprint velocity for mentor review.',
        category: 'Internship',
        priority: 'High',
        dueDate: today,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      },
      {
        id: 'task_sample_3',
        title: 'Submit Data Structures & Algorithms Assignment',
        description: 'Finalize Graph Theory questions and submit the PDF through the college portal.',
        category: 'College',
        priority: 'Medium',
        dueDate: yesterdayStr,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      },
      {
        id: 'task_sample_4',
        title: 'Plan Personal Learning Roadmap & Habit Tracker',
        description: 'Dedicate 45 minutes to read tech articles and practice TypeScript fundamentals.',
        category: 'Personal',
        priority: 'Low',
        dueDate: tomorrowStr,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      },
      {
        id: 'task_sample_5',
        title: 'Review System Design Patterns & Cloud Deployment',
        description: 'Read documentation on micro-services and modern edge deployments.',
        category: 'Other',
        priority: 'Medium',
        dueDate: nextWeekStr,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      }
    ];
  }

  // ----------------------------------------------------------------------------
  // LOCAL STORAGE LOAD & SAVE
  // ----------------------------------------------------------------------------
  function loadFromStorage() {
    // Load Settings
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        appState.settings = { ...appState.settings, ...parsedSettings };
      }
    } catch (err) {
      console.warn('Failed to parse settings from LocalStorage:', err);
    }

    // Load Tasks
    try {
      const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (storedTasks !== null) {
        appState.tasks = JSON.parse(storedTasks);
      } else {
        // Initial setup: populate with realistic starter tasks
        appState.tasks = getDefaultSampleTasks();
        saveTasksToStorage();
      }
    } catch (err) {
      console.warn('Failed to parse tasks from LocalStorage, initializing default:', err);
      appState.tasks = getDefaultSampleTasks();
      saveTasksToStorage();
    }
  }

  function saveTasksToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(appState.tasks));
    } catch (err) {
      console.error('Failed to save tasks to LocalStorage:', err);
      showToast('Error saving data to browser storage', 'danger');
    }
  }

  function saveSettingsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(appState.settings));
    } catch (err) {
      console.error('Failed to save settings to LocalStorage:', err);
    }
  }

  // ----------------------------------------------------------------------------
  // TOAST NOTIFICATION SYSTEM
  // ----------------------------------------------------------------------------
  function showToast(message, type = 'success') {
    if (!appState.settings.showToasts && type !== 'danger') {
      return;
    }

    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-content">
        ${iconSvg}
        <span>${escapeHtml(message)}</span>
      </div>
      <button class="toast-close-btn" aria-label="Close notification">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => {
      dismissToast(toast);
    });

    container.appendChild(toast);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      dismissToast(toast);
    }, 3500);
  }

  function dismissToast(toastElement) {
    if (!toastElement || !toastElement.parentElement) return;
    toastElement.classList.add('toast-hiding');
    setTimeout(() => {
      if (toastElement.parentElement) {
        toastElement.parentElement.removeChild(toastElement);
      }
    }, 250);
  }

  // ----------------------------------------------------------------------------
  // SANITIZATION HELPER
  // ----------------------------------------------------------------------------
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ----------------------------------------------------------------------------
  // CUSTOM CONFIRMATION MODAL
  // ----------------------------------------------------------------------------
  function showConfirmDialog({ title, message, okText = 'Confirm', okClass = 'btn-danger', onConfirm }) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmModalTitle');
    const msgEl = document.getElementById('confirmModalMessage');
    const okBtn = document.getElementById('confirmOkBtn');

    titleEl.textContent = title;
    msgEl.textContent = message;
    okBtn.textContent = okText;
    okBtn.className = `btn ${okClass}`;

    appState.pendingConfirmAction = onConfirm;
    modal.classList.add('active');
  }

  function hideConfirmDialog() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('active');
    appState.pendingConfirmAction = null;
  }

  // ----------------------------------------------------------------------------
  // TASK CRUD OPERATIONS
  // ----------------------------------------------------------------------------
  /**
   * Add a new task
   */
  function addTask({ title, description, category, priority, dueDate }) {
    // Validation
    const cleanTitle = (title || '').trim();
    if (!cleanTitle) {
      showToast('Please enter a task title.', 'danger');
      return false;
    }

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      title: cleanTitle,
      description: (description || '').trim(),
      category: CATEGORIES.includes(category) ? category : 'Other',
      priority: PRIORITIES.includes(priority) ? priority : 'Medium',
      dueDate: dueDate || '',
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    appState.tasks.unshift(newTask);
    saveTasksToStorage();
    renderAllViews();
    showToast('Task added successfully!', 'success');
    return true;
  }

  /**
   * Update an existing task
   */
  function updateTask(id, updatedFields) {
    const taskIndex = appState.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return false;

    const cleanTitle = (updatedFields.title || '').trim();
    if (!cleanTitle) {
      showToast('Please enter a task title.', 'danger');
      return false;
    }

    const task = appState.tasks[taskIndex];
    task.title = cleanTitle;
    task.description = (updatedFields.description || '').trim();
    task.category = CATEGORIES.includes(updatedFields.category) ? updatedFields.category : task.category;
    task.priority = PRIORITIES.includes(updatedFields.priority) ? updatedFields.priority : task.priority;
    task.dueDate = updatedFields.dueDate || '';

    if (updatedFields.status !== undefined) {
      const wasCompleted = task.completed;
      task.completed = updatedFields.status === 'completed';
      if (!wasCompleted && task.completed) {
        task.completedAt = new Date().toISOString();
      } else if (!task.completed) {
        task.completedAt = null;
      }
    }

    saveTasksToStorage();
    renderAllViews();
    showToast('Task updated successfully!', 'success');
    return true;
  }

  /**
   * Toggle task completion status
   */
  function toggleTaskStatus(id) {
    const task = appState.tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;

    saveTasksToStorage();
    renderAllViews();

    if (task.completed) {
      showToast('Task completed! Keep it up!', 'success');
    } else {
      showToast('Task marked as pending.', 'info');
    }
  }

  /**
   * Delete a task with confirmation
   */
  function promptDeleteTask(id) {
    const task = appState.tasks.find(t => t.id === id);
    if (!task) return;

    showConfirmDialog({
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      okText: 'Delete Task',
      okClass: 'btn-danger',
      onConfirm: () => {
        appState.tasks = appState.tasks.filter(t => t.id !== id);
        saveTasksToStorage();
        renderAllViews();
        showToast('Task deleted successfully!', 'success');
      }
    });
  }

  /**
   * Clear all tasks
   */
  function promptClearAllTasks() {
    if (appState.tasks.length === 0) {
      showToast('No tasks to clear.', 'info');
      return;
    }

    showConfirmDialog({
      title: 'Clear All Tasks',
      message: `Are you sure you want to delete all ${appState.tasks.length} tasks? This will permanently wipe your task history.`,
      okText: 'Clear All Tasks',
      okClass: 'btn-danger',
      onConfirm: () => {
        appState.tasks = [];
        saveTasksToStorage();
        renderAllViews();
        showToast('All tasks cleared successfully.', 'success');
      }
    });
  }

  /**
   * Reset application to default state
   */
  function promptResetApp() {
    showConfirmDialog({
      title: 'Reset Application',
      message: 'This will reset all your settings, clear your current tasks, and reload the initial demo data. Are you sure?',
      okText: 'Reset Application',
      okClass: 'btn-danger',
      onConfirm: () => {
        localStorage.removeItem(STORAGE_KEYS.TASKS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        appState.settings = {
          displayName: 'Productive User',
          theme: 'theme-dark',
          showToasts: true
        };
        appState.tasks = getDefaultSampleTasks();
        saveTasksToStorage();
        saveSettingsToStorage();
        applyTheme(appState.settings.theme);
        applySettingsToForm();
        renderAllViews();
        showToast('Application reset to defaults.', 'success');
      }
    });
  }

  // ----------------------------------------------------------------------------
  // STATISTICS & CALCULATIONS
  // ----------------------------------------------------------------------------
  function calculateMetrics() {
    const total = appState.tasks.length;
    let completed = 0;
    let pending = 0;
    let overdue = 0;

    const todayStr = getTodayDateString();

    appState.tasks.forEach(t => {
      if (t.completed) {
        completed++;
      } else {
        pending++;
        if (t.dueDate && t.dueDate < todayStr) {
          overdue++;
        }
      }
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Overall productivity score (0 - 100)
    let productivityScore = 0;
    if (total > 0) {
      // Score = completionRate penalized for overdue ratio
      const overdueRatio = overdue / total;
      const rawScore = completionRate - (overdueRatio * 30);
      productivityScore = Math.max(0, Math.min(100, Math.round(rawScore)));
    }

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate,
      productivityScore
    };
  }

  // ----------------------------------------------------------------------------
  // NAVIGATION & VIEW SWITCHING
  // ----------------------------------------------------------------------------
  function switchView(viewName) {
    const validViews = ['dashboard', 'tasks', 'calendar', 'analytics', 'settings'];
    if (!validViews.includes(viewName)) return;

    appState.currentView = viewName;

    // Update active state in nav buttons
    document.querySelectorAll('.nav-link').forEach(btn => {
      if (btn.getAttribute('data-view') === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update view panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const targetPanel = document.getElementById(`view${capitalize(viewName)}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Update Top Header Title and Subtitle
    updateHeaderTitles(viewName);

    // Close mobile sidebar if open
    closeMobileSidebar();

    // Specific view rendering hooks
    if (viewName === 'tasks') {
      renderMyTasksView();
    } else if (viewName === 'calendar') {
      renderCalendarView();
    } else if (viewName === 'analytics') {
      renderAnalyticsView();
    } else if (viewName === 'dashboard') {
      renderDashboardView();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateHeaderTitles(viewName) {
    const titleEl = document.getElementById('pageTitle');
    const subtitleEl = document.getElementById('pageSubtitle');
    if (!titleEl || !subtitleEl) return;

    switch (viewName) {
      case 'dashboard':
        titleEl.textContent = 'Dashboard';
        subtitleEl.textContent = 'Plan Smart. Stay Focused. Achieve More.';
        break;
      case 'tasks':
        titleEl.textContent = 'My Tasks';
        subtitleEl.textContent = 'Organize, filter, and execute your workload seamlessly';
        break;
      case 'calendar':
        titleEl.textContent = 'Calendar';
        subtitleEl.textContent = 'Visual timeline of your deadlines and schedules';
        break;
      case 'analytics':
        titleEl.textContent = 'Analytics';
        subtitleEl.textContent = 'Data-driven insights into your productivity performance';
        break;
      case 'settings':
        titleEl.textContent = 'Settings';
        subtitleEl.textContent = 'Customize appearance, preferences, and data';
        break;
    }
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ----------------------------------------------------------------------------
  // RENDERING: DASHBOARD
  // ----------------------------------------------------------------------------
  function renderDashboardView() {
    const metrics = calculateMetrics();

    // Dynamic greeting & user name
    const welcomeUserEl = document.getElementById('welcomeUserName');
    if (welcomeUserEl) {
      welcomeUserEl.textContent = appState.settings.displayName || 'Productive User';
    }

    // Dynamic date string
    const welcomeDateEl = document.getElementById('welcomeDateStr');
    if (welcomeDateEl) {
      welcomeDateEl.textContent = formatDateFriendly(new Date());
    }

    // Update 4 Stat Cards
    const totalCountEl = document.getElementById('statTotalCount');
    const completedCountEl = document.getElementById('statCompletedCount');
    const pendingCountEl = document.getElementById('statPendingCount');
    const overdueCountEl = document.getElementById('statOverdueCount');
    const completedRateDescEl = document.getElementById('statCompletedRateDesc');

    if (totalCountEl) totalCountEl.textContent = metrics.total;
    if (completedCountEl) completedCountEl.textContent = metrics.completed;
    if (pendingCountEl) pendingCountEl.textContent = metrics.pending;
    if (overdueCountEl) overdueCountEl.textContent = metrics.overdue;
    if (completedRateDescEl) {
      completedRateDescEl.textContent = `${metrics.completionRate}% overall completion`;
    }

    // Update Progress Section
    const progressRatioEl = document.getElementById('progressRatioText');
    const progressPercentPill = document.getElementById('progressPercentPill');
    const progressBar = document.getElementById('dashboardProgressBar');
    const progressCompletedVal = document.getElementById('progressCompletedVal');
    const progressPendingVal = document.getElementById('progressPendingVal');
    const progressOverdueVal = document.getElementById('progressOverdueVal');

    if (progressRatioEl) progressRatioEl.textContent = `${metrics.completed} of ${metrics.total} tasks`;
    if (progressPercentPill) progressPercentPill.textContent = `${metrics.completionRate}%`;
    if (progressBar) progressBar.style.width = `${metrics.completionRate}%`;
    if (progressCompletedVal) progressCompletedVal.textContent = metrics.completed;
    if (progressPendingVal) progressPendingVal.textContent = metrics.pending;
    if (progressOverdueVal) progressOverdueVal.textContent = metrics.overdue;

    // Update Sidebar badge
    const sidebarBadge = document.getElementById('sidebarPendingBadge');
    if (sidebarBadge) {
      sidebarBadge.textContent = metrics.pending;
      sidebarBadge.style.display = metrics.pending > 0 ? 'inline-block' : 'none';
    }

    // Render Recent / Priority Tasks Preview List on Dashboard
    renderDashboardRecentTasks();
  }

  function renderDashboardRecentTasks() {
    const listContainer = document.getElementById('dashRecentTasksList');
    if (!listContainer) return;

    if (appState.tasks.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state-card" style="padding: 24px 16px;">
          <div class="empty-icon-wrap" style="width: 48px; height: 48px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>
          </div>
          <h4 class="empty-title" style="font-size: 1.05rem;">No tasks yet!</h4>
          <p class="empty-desc" style="font-size: 0.8rem;">Add your first task and start being productive.</p>
        </div>
      `;
      return;
    }

    // Show up to 5 most urgent/recent tasks (pending first, sorted by due date)
    const sortedTasks = [...appState.tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    }).slice(0, 5);

    let html = '';
    sortedTasks.forEach(task => {
      const isCompleted = task.completed;
      const overdue = !isCompleted && isDateOverdue(task.dueDate);
      const isToday = !isCompleted && isDateToday(task.dueDate);

      let dueText = 'No date';
      if (task.dueDate) {
        if (isOverdue(task)) dueText = `<span class="text-danger font-bold">Overdue (${formatDateStringShort(task.dueDate)})</span>`;
        else if (isToday) dueText = `<span class="text-warning font-bold">Today</span>`;
        else dueText = formatDateStringShort(task.dueDate);
      }

      html += `
        <div class="mini-task-item ${isCompleted ? 'is-completed' : ''}" data-task-id="${task.id}">
          <div class="mini-task-left">
            <button class="task-checkbox-btn" onclick="FocusFlowApp.toggleTask('${task.id}')" title="${isCompleted ? 'Mark as pending' : 'Mark as complete'}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <div style="overflow: hidden;">
              <div class="mini-task-title" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; gap: 8px; align-items: center; margin-top: 2px;">
                <span class="badge-category cat-${task.category}" style="font-size: 0.68rem; padding: 1px 6px;">${task.category}</span>
                <span>${dueText}</span>
              </div>
            </div>
          </div>
          <div class="task-action-btns">
            <button class="task-btn-action" onclick="FocusFlowApp.openEditModal('${task.id}')" title="Edit Task">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="task-btn-action action-delete" onclick="FocusFlowApp.deleteTask('${task.id}')" title="Delete Task">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = html;
  }

  function isOverdue(task) {
    return !task.completed && isDateOverdue(task.dueDate);
  }

  // ----------------------------------------------------------------------------
  // RENDERING: MY TASKS (WITH SEARCH & COMPOUND FILTERS)
  // ----------------------------------------------------------------------------
  function renderMyTasksView() {
    const container = document.getElementById('taskCardsContainer');
    const resultCountEl = document.getElementById('tasksResultCount');
    const searchClearBtn = document.getElementById('searchClearBtn');
    const activeFilterTagsContainer = document.getElementById('activeFilterTagsContainer');

    if (!container) return;

    // Search clear button toggle
    if (searchClearBtn) {
      searchClearBtn.style.display = appState.filters.search ? 'inline-flex' : 'none';
    }

    // Apply Filters
    const filteredTasks = appState.tasks.filter(task => {
      // 1. Search Query
      if (appState.filters.search) {
        const query = appState.filters.search.toLowerCase();
        const titleMatch = (task.title || '').toLowerCase().includes(query);
        const descMatch = (task.description || '').toLowerCase().includes(query);
        if (!titleMatch && !descMatch) return false;
      }

      // 2. Status Filter
      if (appState.filters.status === 'Pending') {
        if (task.completed) return false;
      } else if (appState.filters.status === 'Completed') {
        if (!task.completed) return false;
      } else if (appState.filters.status === 'Overdue') {
        if (task.completed || !isDateOverdue(task.dueDate)) return false;
      }

      // 3. Category Filter
      if (appState.filters.category !== 'All') {
        if (task.category !== appState.filters.category) return false;
      }

      // 4. Priority Filter
      if (appState.filters.priority !== 'All') {
        if (task.priority !== appState.filters.priority) return false;
      }

      return true;
    });

    // Update result count indicator
    if (resultCountEl) {
      if (appState.tasks.length === 0) {
        resultCountEl.textContent = 'Showing 0 tasks';
      } else {
        resultCountEl.textContent = `Showing ${filteredTasks.length} of ${appState.tasks.length} tasks`;
      }
    }

    // Active Filter Tags Summary
    if (activeFilterTagsContainer) {
      let tagsHtml = '';
      if (appState.filters.status !== 'All') {
        tagsHtml += `<span class="badge badge-purple">Status: ${appState.filters.status}</span>`;
      }
      if (appState.filters.category !== 'All') {
        tagsHtml += `<span class="badge badge-purple">Category: ${appState.filters.category}</span>`;
      }
      if (appState.filters.priority !== 'All') {
        tagsHtml += `<span class="badge badge-purple">Priority: ${appState.filters.priority}</span>`;
      }
      if (appState.filters.search) {
        tagsHtml += `<span class="badge badge-purple">Search: "${escapeHtml(appState.filters.search)}"</span>`;
      }
      activeFilterTagsContainer.innerHTML = tagsHtml;
    }

    // Empty state handling
    if (appState.tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3 class="empty-title">No tasks yet!</h3>
          <p class="empty-desc">Add your first task and start being productive.</p>
          <button class="btn btn-primary" onclick="FocusFlowApp.openAddModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Create Task</span>
          </button>
        </div>
      `;
      return;
    }

    if (filteredTasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon-wrap" style="background: rgba(245, 158, 11, 0.15); color: var(--color-warning);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
          <h3 class="empty-title">No matching tasks found.</h3>
          <p class="empty-desc">Try adjusting your search query or reset your filters to view more tasks.</p>
          <button class="btn btn-secondary" onclick="FocusFlowApp.clearFilters()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            <span>Clear All Filters</span>
          </button>
        </div>
      `;
      return;
    }

    // Render Task Cards
    let cardsHtml = '';
    filteredTasks.forEach(task => {
      const isCompleted = task.completed;
      const overdue = !isCompleted && isDateOverdue(task.dueDate);
      const isToday = !isCompleted && isDateToday(task.dueDate);
      const isTomorrow = !isCompleted && isDateTomorrow(task.dueDate);

      // Due date pill representation
      let dueClass = '';
      let dueLabel = 'No due date';
      let dueIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;

      if (isCompleted) {
        dueClass = 'is-completed';
        dueLabel = 'Completed';
        dueIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      } else if (overdue) {
        dueClass = 'is-overdue';
        dueLabel = `Overdue (${formatDateStringShort(task.dueDate)})`;
        dueIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      } else if (isToday) {
        dueClass = 'is-today';
        dueLabel = 'Due Today';
      } else if (isTomorrow) {
        dueLabel = 'Due Tomorrow';
      } else if (task.dueDate) {
        dueLabel = formatDateStringShort(task.dueDate);
      }

      cardsHtml += `
        <div class="task-card priority-${task.priority.toLowerCase()} ${isCompleted ? 'is-completed' : ''}" data-task-id="${task.id}">
          <div class="task-card-header">
            <div class="task-badges">
              <span class="badge-category cat-${task.category}">${task.category}</span>
              <span class="badge-priority prio-${task.priority}">
                ${task.priority} Priority
              </span>
            </div>
            <button class="task-checkbox-btn" onclick="FocusFlowApp.toggleTask('${task.id}')" title="${isCompleted ? 'Mark as Pending' : 'Mark as Complete'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
          </div>

          <div class="task-card-body">
            <h4 class="task-card-title">${escapeHtml(task.title)}</h4>
            <p class="task-card-desc">${escapeHtml(task.description || 'No additional notes provided.')}</p>
          </div>

          <div class="task-card-footer">
            <div class="task-due-pill ${dueClass}">
              ${dueIcon}
              <span>${dueLabel}</span>
            </div>

            <div class="task-action-btns">
              <button class="task-btn-action action-toggle" onclick="FocusFlowApp.toggleTask('${task.id}')" title="${isCompleted ? 'Mark as Pending' : 'Mark as Complete'}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>
              <button class="task-btn-action" onclick="FocusFlowApp.openEditModal('${task.id}')" title="Edit Task">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="task-btn-action action-delete" onclick="FocusFlowApp.deleteTask('${task.id}')" title="Delete Task">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = cardsHtml;
  }

  // ----------------------------------------------------------------------------
  // RENDERING: CALENDAR VIEW
  // ----------------------------------------------------------------------------
  function renderCalendarView() {
    const monthYearText = document.getElementById('calendarMonthYearText');
    const daysGrid = document.getElementById('calendarDaysGrid');
    const totalIndicator = document.getElementById('calendarTotalTasksIndicator');

    if (!daysGrid) return;

    const currentYear = appState.calendar.year;
    const currentMonth = appState.calendar.month;

    // Display formatted Month & Year
    const monthDateObj = new Date(currentYear, currentMonth, 1);
    if (monthYearText) {
      monthYearText.textContent = monthDateObj.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    }

    // Number of tasks with due dates in this month
    const tasksWithDueDate = appState.tasks.filter(t => !!t.dueDate);
    if (totalIndicator) {
      totalIndicator.textContent = `${tasksWithDueDate.length} scheduled tasks`;
    }

    // Compute calendar cells
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const todayStr = getTodayDateString();
    let gridHtml = '';

    // Previous month trailing days
    for (let x = firstDayIndex; x > 0; x--) {
      const dayNum = daysInPrevMonth - x + 1;
      const prevDateObj = new Date(currentYear, currentMonth - 1, dayNum);
      const prevDateStr = formatDateKey(prevDateObj);
      gridHtml += createCalendarDayCellHtml(dayNum, prevDateStr, true);
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const dateObj = new Date(currentYear, currentMonth, dayNum);
      const dateStr = formatDateKey(dateObj);
      const isToday = (dateStr === todayStr);
      const isSelected = (dateStr === appState.calendar.selectedDate);
      gridHtml += createCalendarDayCellHtml(dayNum, dateStr, false, isToday, isSelected);
    }

    // Next month leading days to complete grid (multiples of 7)
    const totalCells = firstDayIndex + daysInCurrentMonth;
    const nextDaysNeeded = (7 - (totalCells % 7)) % 7;
    for (let dayNum = 1; dayNum <= nextDaysNeeded; dayNum++) {
      const nextDateObj = new Date(currentYear, currentMonth + 1, dayNum);
      const nextDateStr = formatDateKey(nextDateObj);
      gridHtml += createCalendarDayCellHtml(dayNum, nextDateStr, true);
    }

    daysGrid.innerHTML = gridHtml;

    // Render the side details panel for the selected date
    renderCalendarDateDetails();
  }

  function formatDateKey(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function createCalendarDayCellHtml(dayNum, dateStr, isOtherMonth, isToday = false, isSelected = false) {
    // Find tasks for this date
    const tasksOnDay = appState.tasks.filter(t => t.dueDate === dateStr);
    const count = tasksOnDay.length;

    let cellClasses = 'calendar-day-cell';
    if (isOtherMonth) cellClasses += ' other-month';
    if (isToday) cellClasses += ' is-today';
    if (isSelected) cellClasses += ' is-selected';

    let indicatorsHtml = '';
    if (count > 0) {
      const hasPending = tasksOnDay.some(t => !t.completed && !isDateOverdue(t.dueDate));
      const hasOverdue = tasksOnDay.some(t => !t.completed && isDateOverdue(t.dueDate));
      const allCompleted = tasksOnDay.every(t => t.completed);

      let pillClass = 'day-task-pill';
      if (hasOverdue) pillClass += ' has-overdue';
      else if (hasPending) pillClass += ' has-pending';
      else if (allCompleted) pillClass += ' all-completed';

      indicatorsHtml = `
        <div class="day-task-indicators">
          <span class="${pillClass}">${count} task${count > 1 ? 's' : ''}</span>
        </div>
      `;
    }

    return `
      <div class="${cellClasses}" onclick="FocusFlowApp.selectCalendarDate('${dateStr}')" data-date="${dateStr}">
        <span class="day-number">${dayNum}</span>
        ${indicatorsHtml}
      </div>
    `;
  }

  function selectCalendarDate(dateStr) {
    appState.calendar.selectedDate = dateStr;
    renderCalendarView();
  }

  function renderCalendarDateDetails() {
    const titleEl = document.getElementById('calSelectedDateTitle');
    const subtitleEl = document.getElementById('calSelectedDateSubtitle');
    const listContainer = document.getElementById('calSelectedTasksList');

    if (!listContainer) return;

    const selectedDate = appState.calendar.selectedDate || getTodayDateString();
    const formatted = formatDateStringShort(selectedDate);

    if (titleEl) {
      titleEl.textContent = isDateToday(selectedDate) ? `Today (${formatted})` : formatted;
    }

    const tasksOnDate = appState.tasks.filter(t => t.dueDate === selectedDate);

    if (subtitleEl) {
      subtitleEl.textContent = `${tasksOnDate.length} task${tasksOnDate.length !== 1 ? 's' : ''} scheduled`;
    }

    if (tasksOnDate.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state-card" style="padding: 28px 16px;">
          <div class="empty-icon-wrap" style="width: 48px; height: 48px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
            </svg>
          </div>
          <h5 class="empty-title" style="font-size: 1rem;">No tasks due on this date</h5>
          <p class="empty-desc" style="font-size: 0.8rem;">Click 'Add Task' to schedule a task for this day.</p>
        </div>
      `;
      return;
    }

    let itemsHtml = '';
    tasksOnDate.forEach(task => {
      const isCompleted = task.completed;
      itemsHtml += `
        <div class="mini-task-item ${isCompleted ? 'is-completed' : ''}" data-task-id="${task.id}">
          <div class="mini-task-left">
            <button class="task-checkbox-btn" onclick="FocusFlowApp.toggleTask('${task.id}')" title="${isCompleted ? 'Mark as Pending' : 'Mark as Complete'}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <div>
              <div class="mini-task-title" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; gap: 6px; align-items: center; margin-top: 2px;">
                <span class="badge-category cat-${task.category}" style="font-size: 0.65rem; padding: 1px 5px;">${task.category}</span>
                <span class="badge-priority prio-${task.priority}" style="font-size: 0.65rem; padding: 1px 5px;">${task.priority}</span>
              </div>
            </div>
          </div>
          <div class="task-action-btns">
            <button class="task-btn-action" onclick="FocusFlowApp.openEditModal('${task.id}')" title="Edit Task">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="task-btn-action action-delete" onclick="FocusFlowApp.deleteTask('${task.id}')" title="Delete Task">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = itemsHtml;
  }

  function changeCalendarMonth(offset) {
    let newMonth = appState.calendar.month + offset;
    let newYear = appState.calendar.year;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    appState.calendar.month = newMonth;
    appState.calendar.year = newYear;
    renderCalendarView();
  }

  function jumpToTodayCalendar() {
    const today = new Date();
    appState.calendar.month = today.getMonth();
    appState.calendar.year = today.getFullYear();
    appState.calendar.selectedDate = getTodayDateString();
    renderCalendarView();
  }

  // ----------------------------------------------------------------------------
  // RENDERING: ANALYTICS VIEW
  // ----------------------------------------------------------------------------
  function renderAnalyticsView() {
    const metrics = calculateMetrics();

    // Productivity score circular ring & value
    const scoreValEl = document.getElementById('analyticsProductivityScore');
    const scorePathEl = document.getElementById('analyticsScorePath');
    const rateBadge = document.getElementById('analyticsRateBadge');
    const activeBadge = document.getElementById('analyticsActiveBadge');
    const headlineEl = document.getElementById('analyticsHeadline');
    const summaryTextEl = document.getElementById('analyticsSummaryText');

    if (scoreValEl) scoreValEl.textContent = `${metrics.productivityScore}%`;
    if (scorePathEl) {
      scorePathEl.setAttribute('stroke-dasharray', `${metrics.productivityScore}, 100`);
    }
    if (rateBadge) rateBadge.textContent = `Completion Rate: ${metrics.completionRate}%`;

    // Dynamic headline and coaching tip
    if (headlineEl && summaryTextEl && activeBadge) {
      if (metrics.total === 0) {
        headlineEl.textContent = 'Ready to Start Planning';
        summaryTextEl.textContent = 'Add your pending assignments, projects, and personal tasks to begin tracking analytics.';
        activeBadge.textContent = 'Status: Clean Slate';
      } else if (metrics.productivityScore >= 80) {
        headlineEl.textContent = 'Outstanding Productivity!';
        summaryTextEl.textContent = 'You are crushing your deadlines with high consistency. Keep this excellent flow going!';
        activeBadge.textContent = 'Focus Score: High Performer';
      } else if (metrics.productivityScore >= 50) {
        headlineEl.textContent = 'Steady Momentum';
        summaryTextEl.textContent = 'Solid progress! Completing a few pending items will elevate your productivity score.';
        activeBadge.textContent = 'Focus Score: On Track';
      } else {
        headlineEl.textContent = 'Focus & Catch Up';
        summaryTextEl.textContent = 'You have pending or overdue tasks. Knock out the highest priority task first today!';
        activeBadge.textContent = 'Focus Score: Needs Focus';
      }
    }

    // 4 Counter Stat Cards
    const totalEl = document.getElementById('analyticsTotalCount');
    const completedEl = document.getElementById('analyticsCompletedCount');
    const pendingEl = document.getElementById('analyticsPendingCount');
    const overdueEl = document.getElementById('analyticsOverdueCount');

    if (totalEl) totalEl.textContent = metrics.total;
    if (completedEl) completedEl.textContent = metrics.completed;
    if (pendingEl) pendingEl.textContent = metrics.pending;
    if (overdueEl) overdueEl.textContent = metrics.overdue;

    // Category Breakdown Progress Bars
    renderCategoryBreakdown(metrics.total);

    // Priority Breakdown Progress Bars
    renderPriorityBreakdown(metrics.total);
  }

  function renderCategoryBreakdown(totalTasks) {
    const listContainer = document.getElementById('categoryBreakdownList');
    if (!listContainer) return;

    const categoryCounts = {};
    CATEGORIES.forEach(cat => { categoryCounts[cat] = 0; });
    appState.tasks.forEach(t => {
      if (categoryCounts[t.category] !== undefined) {
        categoryCounts[t.category]++;
      } else {
        categoryCounts['Other']++;
      }
    });

    let html = '';
    CATEGORIES.forEach(cat => {
      const count = categoryCounts[cat] || 0;
      const percent = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

      // Color mapping
      let colorVar = 'var(--cat-other)';
      if (cat === 'College') colorVar = 'var(--cat-college)';
      else if (cat === 'Projects') colorVar = 'var(--cat-projects)';
      else if (cat === 'Internship') colorVar = 'var(--cat-internship)';
      else if (cat === 'Personal') colorVar = 'var(--cat-personal)';

      html += `
        <div class="breakdown-row">
          <div class="breakdown-info">
            <span class="breakdown-label" style="color: ${colorVar}">${cat}</span>
            <span class="breakdown-count">${count} task${count !== 1 ? 's' : ''} (${percent}%)</span>
          </div>
          <div class="breakdown-bar-track">
            <div class="breakdown-bar-fill" style="width: ${percent}%; background-color: ${colorVar};"></div>
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = html;
  }

  function renderPriorityBreakdown(totalTasks) {
    const listContainer = document.getElementById('priorityBreakdownList');
    if (!listContainer) return;

    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
    appState.tasks.forEach(t => {
      if (priorityCounts[t.priority] !== undefined) {
        priorityCounts[t.priority]++;
      } else {
        priorityCounts['Medium']++;
      }
    });

    let html = '';
    PRIORITIES.forEach(prio => {
      const count = priorityCounts[prio] || 0;
      const percent = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

      let colorVar = 'var(--priority-medium)';
      if (prio === 'High') colorVar = 'var(--priority-high)';
      else if (prio === 'Low') colorVar = 'var(--priority-low)';

      html += `
        <div class="breakdown-row">
          <div class="breakdown-info">
            <span class="breakdown-label" style="color: ${colorVar};">${prio} Priority</span>
            <span class="breakdown-count">${count} task${count !== 1 ? 's' : ''} (${percent}%)</span>
          </div>
          <div class="breakdown-bar-track">
            <div class="breakdown-bar-fill" style="width: ${percent}%; background-color: ${colorVar};"></div>
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = html;
  }

  // ----------------------------------------------------------------------------
  // RENDERING ALL VIEWS & THEME SYNC
  // ----------------------------------------------------------------------------
  function renderAllViews() {
    renderDashboardView();
    renderMyTasksView();
    renderCalendarView();
    renderAnalyticsView();
  }

  function applyTheme(themeClass) {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(themeClass);
    appState.settings.theme = themeClass;
    saveSettingsToStorage();

    // Sync Settings view picker cards
    const darkCard = document.getElementById('themeOptionDark');
    const lightCard = document.getElementById('themeOptionLight');
    if (darkCard && lightCard) {
      if (themeClass === 'theme-light') {
        lightCard.classList.add('active');
        darkCard.classList.remove('active');
      } else {
        darkCard.classList.add('active');
        lightCard.classList.remove('active');
      }
    }
  }

  function toggleQuickTheme() {
    const nextTheme = appState.settings.theme === 'theme-dark' ? 'theme-light' : 'theme-dark';
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'theme-dark' ? 'Dark Navy' : 'Light'} theme`, 'info');
  }

  function applySettingsToForm() {
    const nameInput = document.getElementById('settingsDisplayName');
    const toastToggle = document.getElementById('settingToastToggle');
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarAvatar = document.getElementById('sidebarAvatar');

    if (nameInput) nameInput.value = appState.settings.displayName || '';
    if (toastToggle) toastToggle.checked = !!appState.settings.showToasts;

    if (sidebarUserName) {
      sidebarUserName.textContent = appState.settings.displayName || 'Productive User';
    }
    if (sidebarAvatar) {
      const name = (appState.settings.displayName || 'FF').trim();
      const initials = name.split(' ').map(n => n[0]).join('').substr(0, 2).toUpperCase();
      sidebarAvatar.textContent = initials || 'FF';
    }
  }

  // ----------------------------------------------------------------------------
  // MODAL CONTROLLERS: ADD & EDIT
  // ----------------------------------------------------------------------------
  function openAddModal(prefilledDueDate = null) {
    const modal = document.getElementById('addTaskModal');
    const titleInput = document.getElementById('modalTaskTitle');
    const descInput = document.getElementById('modalTaskDesc');
    const categorySelect = document.getElementById('modalTaskCategory');
    const prioritySelect = document.getElementById('modalTaskPriority');
    const dueDateInput = document.getElementById('modalTaskDueDate');
    const errorEl = document.getElementById('modalTitleError');

    if (!modal) return;

    // Reset Form
    titleInput.value = '';
    titleInput.classList.remove('is-invalid');
    if (errorEl) errorEl.textContent = '';
    descInput.value = '';
    categorySelect.value = 'Internship';
    prioritySelect.value = 'Medium';
    dueDateInput.value = prefilledDueDate || getTodayDateString();

    modal.classList.add('active');
    setTimeout(() => titleInput.focus(), 150);
  }

  function closeAddModal() {
    const modal = document.getElementById('addTaskModal');
    if (modal) modal.classList.remove('active');
  }

  function openEditModal(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.getElementById('editTaskModal');
    const idInput = document.getElementById('editTaskId');
    const titleInput = document.getElementById('editTaskTitle');
    const descInput = document.getElementById('editTaskDesc');
    const categorySelect = document.getElementById('editTaskCategory');
    const prioritySelect = document.getElementById('editTaskPriority');
    const dueDateInput = document.getElementById('editTaskDueDate');
    const statusSelect = document.getElementById('editTaskStatus');
    const errorEl = document.getElementById('editTitleError');

    if (!modal) return;

    idInput.value = task.id;
    titleInput.value = task.title;
    titleInput.classList.remove('is-invalid');
    if (errorEl) errorEl.textContent = '';
    descInput.value = task.description || '';
    categorySelect.value = task.category;
    prioritySelect.value = task.priority;
    dueDateInput.value = task.dueDate || '';
    statusSelect.value = task.completed ? 'completed' : 'pending';

    modal.classList.add('active');
    setTimeout(() => titleInput.focus(), 150);
  }

  function closeEditModal() {
    const modal = document.getElementById('editTaskModal');
    if (modal) modal.classList.remove('active');
  }

  // ----------------------------------------------------------------------------
  // EXPORT & IMPORT BACKUP (JSON)
  // ----------------------------------------------------------------------------
  function exportTasksJson() {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState.tasks, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `focusflow_tasks_${getTodayDateString()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Tasks exported successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error exporting tasks.', 'danger');
    }
  }

  function importTasksJson(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const importedTasks = JSON.parse(e.target.result);
        if (Array.isArray(importedTasks)) {
          // Merge imported tasks, deduplicating by ID
          const existingIds = new Set(appState.tasks.map(t => t.id));
          let count = 0;
          importedTasks.forEach(task => {
            if (task.id && task.title) {
              if (!existingIds.has(task.id)) {
                appState.tasks.push(task);
                existingIds.add(task.id);
                count++;
              }
            }
          });
          saveTasksToStorage();
          renderAllViews();
          showToast(`Successfully imported ${count} tasks!`, 'success');
        } else {
          showToast('Invalid JSON task file format.', 'danger');
        }
      } catch (err) {
        console.error(err);
        showToast('Error parsing JSON backup file.', 'danger');
      }
    };
    reader.readAsText(file);
  }

  // ----------------------------------------------------------------------------
  // MOBILE SIDEBAR CONTROLS
  // ----------------------------------------------------------------------------
  function openMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
      sidebar.classList.add('mobile-open');
      overlay.classList.add('active');
    }
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
    }
  }

  // ----------------------------------------------------------------------------
  // INITIALIZATION & EVENT LISTENERS
  // ----------------------------------------------------------------------------
  function initEventBindings() {
    // 1. Navigation clicks
    document.querySelectorAll('.nav-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        switchView(view);
      });
    });

    // 2. Mobile menu & sidebar overlay
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileSidebar);
    if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileSidebar);

    // 3. Quick theme toggle buttons
    const quickThemeBtn = document.getElementById('quickThemeBtn');
    if (quickThemeBtn) quickThemeBtn.addEventListener('click', toggleQuickTheme);

    const themeDarkOption = document.getElementById('themeOptionDark');
    const themeLightOption = document.getElementById('themeOptionLight');
    if (themeDarkOption) themeDarkOption.addEventListener('click', () => applyTheme('theme-dark'));
    if (themeLightOption) themeLightOption.addEventListener('click', () => applyTheme('theme-light'));

    // 4. Header buttons & View shortcuts
    const openAddModalBtn = document.getElementById('openAddModalBtn');
    const tasksPageAddBtn = document.getElementById('tasksPageAddBtn');
    const viewAllTasksBtn = document.getElementById('viewAllTasksBtn');

    if (openAddModalBtn) openAddModalBtn.addEventListener('click', () => openAddModal());
    if (tasksPageAddBtn) tasksPageAddBtn.addEventListener('click', () => openAddModal());
    if (viewAllTasksBtn) viewAllTasksBtn.addEventListener('click', () => switchView('tasks'));

    // 5. Dashboard Inline Add Task Form
    const dashForm = document.getElementById('dashAddTaskForm');
    const dashTitleInput = document.getElementById('dashTaskTitle');
    const dashTitleError = document.getElementById('dashTitleError');
    const dashCancelBtn = document.getElementById('dashCancelBtn');

    if (dashTitleInput) {
      dashTitleInput.addEventListener('input', () => {
        dashTitleInput.classList.remove('is-invalid');
        if (dashTitleError) dashTitleError.textContent = '';
      });
    }

    if (dashCancelBtn) {
      dashCancelBtn.addEventListener('click', () => {
        dashForm.reset();
        dashTitleInput.classList.remove('is-invalid');
        if (dashTitleError) dashTitleError.textContent = '';
        document.getElementById('dashTaskDueDate').value = getTodayDateString();
      });
    }

    if (dashForm) {
      dashForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = dashTitleInput.value;
        const cleanTitle = (title || '').trim();

        if (!cleanTitle) {
          dashTitleInput.classList.add('is-invalid');
          if (dashTitleError) dashTitleError.textContent = 'Please enter a task title.';
          dashTitleInput.focus();
          showToast('Please enter a task title.', 'danger');
          return;
        }

        const success = addTask({
          title: cleanTitle,
          description: document.getElementById('dashTaskDesc').value,
          category: document.getElementById('dashTaskCategory').value,
          priority: document.getElementById('dashTaskPriority').value,
          dueDate: document.getElementById('dashTaskDueDate').value
        });

        if (success) {
          dashForm.reset();
          dashTitleInput.classList.remove('is-invalid');
          if (dashTitleError) dashTitleError.textContent = '';
          document.getElementById('dashTaskDueDate').value = getTodayDateString();
        }
      });
    }

    // 6. Modal Add Task Form
    const modalAddForm = document.getElementById('modalAddTaskForm');
    const modalTitleInput = document.getElementById('modalTaskTitle');
    const modalTitleError = document.getElementById('modalTitleError');
    const closeAddModalBtn = document.getElementById('closeAddModalBtn');
    const modalAddCancelBtn = document.getElementById('modalAddCancelBtn');

    if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', closeAddModal);
    if (modalAddCancelBtn) modalAddCancelBtn.addEventListener('click', closeAddModal);

    if (modalTitleInput) {
      modalTitleInput.addEventListener('input', () => {
        modalTitleInput.classList.remove('is-invalid');
        if (modalTitleError) modalTitleError.textContent = '';
      });
    }

    if (modalAddForm) {
      modalAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = modalTitleInput.value;
        const cleanTitle = (title || '').trim();

        if (!cleanTitle) {
          modalTitleInput.classList.add('is-invalid');
          if (modalTitleError) modalTitleError.textContent = 'Please enter a task title.';
          modalTitleInput.focus();
          showToast('Please enter a task title.', 'danger');
          return;
        }

        const success = addTask({
          title: cleanTitle,
          description: document.getElementById('modalTaskDesc').value,
          category: document.getElementById('modalTaskCategory').value,
          priority: document.getElementById('modalTaskPriority').value,
          dueDate: document.getElementById('modalTaskDueDate').value
        });

        if (success) {
          closeAddModal();
        }
      });
    }

    // 7. Modal Edit Task Form
    const editForm = document.getElementById('editTaskForm');
    const editTitleInput = document.getElementById('editTaskTitle');
    const editTitleError = document.getElementById('editTitleError');
    const closeEditModalBtn = document.getElementById('closeEditModalBtn');
    const editCancelBtn = document.getElementById('editCancelBtn');

    if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', closeEditModal);
    if (editCancelBtn) editCancelBtn.addEventListener('click', closeEditModal);

    if (editTitleInput) {
      editTitleInput.addEventListener('input', () => {
        editTitleInput.classList.remove('is-invalid');
        if (editTitleError) editTitleError.textContent = '';
      });
    }

    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editTaskId').value;
        const title = editTitleInput.value;
        const cleanTitle = (title || '').trim();

        if (!cleanTitle) {
          editTitleInput.classList.add('is-invalid');
          if (editTitleError) editTitleError.textContent = 'Please enter a task title.';
          editTitleInput.focus();
          showToast('Please enter a task title.', 'danger');
          return;
        }

        const success = updateTask(id, {
          title: cleanTitle,
          description: document.getElementById('editTaskDesc').value,
          category: document.getElementById('editTaskCategory').value,
          priority: document.getElementById('editTaskPriority').value,
          dueDate: document.getElementById('editTaskDueDate').value,
          status: document.getElementById('editTaskStatus').value
        });

        if (success) {
          closeEditModal();
        }
      });
    }

    // 8. Confirmation Dialog Buttons
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const confirmOkBtn = document.getElementById('confirmOkBtn');

    if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', hideConfirmDialog);
    if (confirmOkBtn) {
      confirmOkBtn.addEventListener('click', () => {
        if (typeof appState.pendingConfirmAction === 'function') {
          appState.pendingConfirmAction();
        }
        hideConfirmDialog();
      });
    }

    // 9. Search Bar in My Tasks
    const searchInput = document.getElementById('taskSearchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        appState.filters.search = e.target.value;
        renderMyTasksView();
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        appState.filters.search = '';
        renderMyTasksView();
        searchInput.focus();
      });
    }

    // 10. Filter Pills: Status, Category, Priority
    document.querySelectorAll('#statusFilterPills .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#statusFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        appState.filters.status = pill.getAttribute('data-status');
        renderMyTasksView();
      });
    });

    document.querySelectorAll('#categoryFilterPills .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#categoryFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        appState.filters.category = pill.getAttribute('data-category');
        renderMyTasksView();
      });
    });

    document.querySelectorAll('#priorityFilterPills .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#priorityFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        appState.filters.priority = pill.getAttribute('data-priority');
        renderMyTasksView();
      });
    });

    // 11. Clear All Filters Button
    const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
    if (clearAllFiltersBtn) {
      clearAllFiltersBtn.addEventListener('click', clearFilters);
    }

    // 12. Calendar Controls
    const calPrevBtn = document.getElementById('calPrevMonthBtn');
    const calNextBtn = document.getElementById('calNextMonthBtn');
    const calTodayBtn = document.getElementById('calTodayBtn');
    const calQuickAddTaskBtn = document.getElementById('calQuickAddTaskBtn');

    if (calPrevBtn) calPrevBtn.addEventListener('click', () => changeCalendarMonth(-1));
    if (calNextBtn) calNextBtn.addEventListener('click', () => changeCalendarMonth(1));
    if (calTodayBtn) calTodayBtn.addEventListener('click', jumpToTodayCalendar);
    if (calQuickAddTaskBtn) {
      calQuickAddTaskBtn.addEventListener('click', () => {
        openAddModal(appState.calendar.selectedDate);
      });
    }

    // 13. Settings Form & Actions
    const profileForm = document.getElementById('profileSettingsForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameVal = document.getElementById('settingsDisplayName').value.trim();
        appState.settings.displayName = nameVal || 'Productive User';
        saveSettingsToStorage();
        applySettingsToForm();
        renderDashboardView();
        showToast('Profile updated successfully!', 'success');
      });
    }

    const toastToggle = document.getElementById('settingToastToggle');
    if (toastToggle) {
      toastToggle.addEventListener('change', (e) => {
        appState.settings.showToasts = e.target.checked;
        saveSettingsToStorage();
        showToast(`Toast notifications ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
      });
    }

    const clearAllTasksBtn = document.getElementById('clearAllTasksBtn');
    if (clearAllTasksBtn) clearAllTasksBtn.addEventListener('click', promptClearAllTasks);

    const resetAppBtn = document.getElementById('resetAppBtn');
    if (resetAppBtn) resetAppBtn.addEventListener('click', promptResetApp);

    const exportBtn = document.getElementById('exportTasksBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportTasksJson);

    const importInput = document.getElementById('importTasksInput');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importTasksJson(e.target.files[0]);
          importInput.value = ''; // Reset input
        }
      });
    }

    // Close modals on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAddModal();
        closeEditModal();
        hideConfirmDialog();
      }
    });

    // Close modals when clicking backdrop
    [document.getElementById('addTaskModal'), document.getElementById('editTaskModal')].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.remove('active');
          }
        });
      }
    });
  }

  function clearFilters() {
    appState.filters = {
      search: '',
      status: 'All',
      category: 'All',
      priority: 'All'
    };

    const searchInput = document.getElementById('taskSearchInput');
    if (searchInput) searchInput.value = '';

    // Reset Pill Highlights
    document.querySelectorAll('#statusFilterPills .filter-pill').forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-status') === 'All');
    });
    document.querySelectorAll('#categoryFilterPills .filter-pill').forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-category') === 'All');
    });
    document.querySelectorAll('#priorityFilterPills .filter-pill').forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-priority') === 'All');
    });

    renderMyTasksView();
    showToast('Filters cleared', 'info');
  }

  // ----------------------------------------------------------------------------
  // APPLICATION BOOTSTRAP
  // ----------------------------------------------------------------------------
  function initApp() {
    // 1. Load saved tasks and settings from LocalStorage
    loadFromStorage();

    // 2. Set current date on headers & form inputs
    const todayStr = getTodayDateString();
    const currentDateText = document.getElementById('currentDateText');
    if (currentDateText) {
      currentDateText.textContent = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }

    const dashDueDate = document.getElementById('dashTaskDueDate');
    if (dashDueDate) dashDueDate.value = todayStr;

    // Pick random inspiration quote for dashboard
    const quoteEl = document.getElementById('dailyInspiration');
    if (quoteEl) {
      const randIdx = Math.floor(Math.random() * PRODUCTIVITY_QUOTES.length);
      quoteEl.textContent = PRODUCTIVITY_QUOTES[randIdx];
    }

    // 3. Apply Theme and Form settings
    applyTheme(appState.settings.theme || 'theme-dark');
    applySettingsToForm();

    // 4. Attach event listeners
    initEventBindings();

    // 5. Initial render of all view components
    renderAllViews();
  }

  // ----------------------------------------------------------------------------
  // EXPOSE GLOBAL API FOR INLINE HANDLERS
  // ----------------------------------------------------------------------------
  window.FocusFlowApp = {
    toggleTask: toggleTaskStatus,
    openEditModal: openEditModal,
    deleteTask: promptDeleteTask,
    openAddModal: openAddModal,
    selectCalendarDate: selectCalendarDate,
    clearFilters: clearFilters
  };

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();

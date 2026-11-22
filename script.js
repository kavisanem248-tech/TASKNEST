/**
 * ==============================================================================
 * TASKNEST – SMART TASK MANAGEMENT APP
 * EdBytes Full Stack Development – TASK-FSD-02
 * Complete Modular Vanilla JavaScript Implementation
 * ==============================================================================
 */

(function () {
  'use strict';

  // ----------------------------------------------------------------------------
  // APPLICATION CONSTANTS & LOCAL STORAGE KEYS
  // ----------------------------------------------------------------------------
  const STORAGE_KEYS = {
    TASKS: 'tasknest_tasks',
    SETTINGS: 'tasknest_settings'
  };

  const CATEGORIES = ['College', 'Personal', 'Projects', 'Internship', 'Work', 'Other'];
  const PRIORITIES = ['High', 'Medium', 'Low'];

  const POMO_DURATIONS = {
    focus: 25 * 60,       // 25 minutes
    shortBreak: 5 * 60,   // 5 minutes
    longBreak: 15 * 60    // 15 minutes
  };

  const DAILY_QUOTES = [
    '"Small daily improvements over time lead to stunning results." – Robin Sharma',
    '"Focus on being productive instead of busy." – Tim Ferriss',
    '"The secret of getting ahead is getting started." – Mark Twain',
    '"Action is the foundational key to all success." – Pablo Picasso',
    '"Your future is created by what you do today, not tomorrow." – Robert Kiyosaki',
    '"Organize tasks. Stay productive. Achieve more." – TaskNest'
  ];

  // ----------------------------------------------------------------------------
  // APPLICATION STATE
  // ----------------------------------------------------------------------------
  const state = {
    tasks: [],
    settings: {
      displayName: 'Productive User',
      theme: 'theme-dark',
      showToasts: true,
      pomoSound: true,
      completedPomoSessions: 0,
      totalFocusMinutes: 0
    },
    currentView: 'dashboard',
    filters: {
      search: '',
      status: 'All',       // 'All' | 'Pending' | 'Completed' | 'Overdue'
      category: 'All',     // 'All' | 'College' | 'Personal' | 'Projects' | 'Internship' | 'Work' | 'Other'
      priority: 'All',     // 'All' | 'High' | 'Medium' | 'Low'
      sortBy: 'created-desc'
    },
    calendar: {
      year: new Date().getFullYear(),
      month: new Date().getMonth(), // 0 - 11
      selectedDate: getTodayDateString()
    },
    pomodoro: {
      mode: 'focus', // 'focus' | 'shortBreak' | 'longBreak'
      totalSeconds: POMO_DURATIONS.focus,
      remainingSeconds: POMO_DURATIONS.focus,
      isRunning: false,
      intervalId: null
    },
    pendingConfirmAction: null
  };

  // ----------------------------------------------------------------------------
  // DATE UTILITY FUNCTIONS
  // ----------------------------------------------------------------------------
  function getTodayDateString() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatDateFriendly(dateObj) {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatDateShort(dateStr) {
    if (!dateStr) return 'No due date';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  function isDateOverdue(dateStr) {
    if (!dateStr) return false;
    return dateStr < getTodayDateString();
  }

  function isDateToday(dateStr) {
    if (!dateStr) return false;
    return dateStr === getTodayDateString();
  }

  // ----------------------------------------------------------------------------
  // INITIAL STARTER TASKS
  // ----------------------------------------------------------------------------
  function getDefaultStarterTasks() {
    const today = getTodayDateString();
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    return [
      {
        id: 'task_' + (Date.now() - 4000),
        title: 'Complete TaskNest Professional Upgrade',
        description: 'Implement modern glassmorphic dashboard, Pomodoro timer, calendar and analytics for EdBytes TASK-FSD-02.',
        category: 'Projects',
        priority: 'High',
        dueDate: today,
        completed: true,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      },
      {
        id: 'task_' + (Date.now() - 3000),
        title: 'Submit Full Stack Assignment Documentation',
        description: 'Verify all project features, tests, LocalStorage persistence, and push repository commits.',
        category: 'Internship',
        priority: 'High',
        dueDate: today,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      },
      {
        id: 'task_' + (Date.now() - 2000),
        title: 'Review System Design & Cloud Architecture',
        description: 'Read documentation on micro-services and modern responsive frontend patterns.',
        category: 'College',
        priority: 'Medium',
        dueDate: yesterdayStr,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      },
      {
        id: 'task_' + (Date.now() - 1000),
        title: '25-minute Pomodoro Deep Work Session',
        description: 'Use the integrated Pomodoro focus timer to knock out priority tasks with zero distractions.',
        category: 'Personal',
        priority: 'Low',
        dueDate: tomorrowStr,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      }
    ];
  }

  // ----------------------------------------------------------------------------
  // LOCAL STORAGE & DATA MIGRATION
  // ----------------------------------------------------------------------------
  function loadDataFromStorage() {
    // 1. Load Settings
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        state.settings = { ...state.settings, ...JSON.parse(storedSettings) };
      }
    } catch (err) {
      console.warn('Failed to parse settings from storage:', err);
    }

    // 2. Load Tasks (with backwards compatibility for previous tasknest/focusflow structures)
    try {
      let storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      // Fallback check if tasks were stored under focusflow_tasks
      if (storedTasks === null) {
        storedTasks = localStorage.getItem('focusflow_tasks');
      }

      if (storedTasks !== null) {
        const parsed = JSON.parse(storedTasks);
        if (Array.isArray(parsed) && parsed.length > 0) {
          state.tasks = parsed.map(t => ({
            id: t.id || 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            title: t.title || t.text || 'Untitled Task',
            description: t.description || '',
            category: CATEGORIES.includes(t.category) ? t.category : 'Work',
            priority: PRIORITIES.includes(t.priority) ? t.priority : (t.priority === 'Normal' ? 'Medium' : 'Medium'),
            dueDate: t.dueDate || '',
            completed: !!t.completed,
            createdAt: t.createdAt || new Date().toISOString(),
            completedAt: t.completedAt || (t.completed ? new Date().toISOString() : null)
          }));
        } else {
          state.tasks = getDefaultStarterTasks();
        }
      } else {
        state.tasks = getDefaultStarterTasks();
        saveTasksToStorage();
      }
    } catch (err) {
      console.warn('Failed to parse tasks from storage, initializing defaults:', err);
      state.tasks = getDefaultStarterTasks();
      saveTasksToStorage();
    }
  }

  function saveTasksToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
    } catch (err) {
      console.error('Failed to save tasks to LocalStorage:', err);
      showToast('Error saving data to browser storage', 'danger');
    }
  }

  function saveSettingsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    } catch (err) {
      console.error('Failed to save settings to LocalStorage:', err);
    }
  }

  // ----------------------------------------------------------------------------
  // TOAST NOTIFICATIONS & SOUND CHIME
  // ----------------------------------------------------------------------------
  function showToast(message, type = 'success') {
    if (!state.settings.showToasts && type !== 'danger') return;

    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
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

    toast.querySelector('.toast-close-btn').addEventListener('click', () => dismissToast(toast));
    container.appendChild(toast);

    setTimeout(() => dismissToast(toast), 3200);
  }

  function dismissToast(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 250);
  }

  // Synthesized Web Audio chime (no external audio files required!)
  function playCompletionChime() {
    if (!state.settings.pomoSound) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio chime failed:', e);
    }
  }

  // ----------------------------------------------------------------------------
  // CONFIRMATION DIALOG
  // ----------------------------------------------------------------------------
  function showConfirmDialog({ title, message, okText = 'Confirm', onConfirm }) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmModalTitle');
    const msgEl = document.getElementById('confirmModalMessage');
    const okBtn = document.getElementById('confirmOkBtn');

    titleEl.textContent = title;
    msgEl.textContent = message;
    okBtn.textContent = okText;

    state.pendingConfirmAction = onConfirm;
    modal.classList.add('active');
  }

  function hideConfirmDialog() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('active');
    state.pendingConfirmAction = null;
  }

  // ----------------------------------------------------------------------------
  // TASK CRUD OPERATIONS
  // ----------------------------------------------------------------------------
  function addTask({ title, description, category, priority, dueDate }) {
    const cleanTitle = (title || '').trim();
    if (!cleanTitle) {
      showToast('Please enter a task title.', 'danger');
      return false;
    }

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: cleanTitle,
      description: (description || '').trim(),
      category: CATEGORIES.includes(category) ? category : 'Work',
      priority: PRIORITIES.includes(priority) ? priority : 'Medium',
      dueDate: dueDate || '',
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    state.tasks.unshift(newTask);
    saveTasksToStorage();
    renderAllViews();
    showToast('Task added successfully!', 'success');
    return true;
  }

  function updateTask(id, updatedFields) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return false;

    const cleanTitle = (updatedFields.title || '').trim();
    if (!cleanTitle) {
      showToast('Please enter a task title.', 'danger');
      return false;
    }

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

  function toggleTaskStatus(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;

    saveTasksToStorage();
    renderAllViews();

    if (task.completed) {
      showToast('Task marked as completed! Great job.', 'success');
    } else {
      showToast('Task marked as pending.', 'info');
    }
  }

  function promptDeleteTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    showConfirmDialog({
      title: 'Delete Task',
      message: `Are you sure you want to permanently delete "${task.title}"?`,
      okText: 'Delete Task',
      onConfirm: () => {
        state.tasks = state.tasks.filter(t => t.id !== id);
        saveTasksToStorage();
        renderAllViews();
        showToast('Task deleted successfully.', 'success');
      }
    });
  }

  function promptClearAllTasks() {
    if (state.tasks.length === 0) {
      showToast('No tasks to clear.', 'info');
      return;
    }

    showConfirmDialog({
      title: 'Clear All Tasks',
      message: `Are you sure you want to permanently delete all ${state.tasks.length} tasks from TaskNest?`,
      okText: 'Clear All',
      onConfirm: () => {
        state.tasks = [];
        saveTasksToStorage();
        renderAllViews();
        showToast('All tasks cleared successfully.', 'success');
      }
    });
  }

  function promptResetApp() {
    showConfirmDialog({
      title: 'Reset Application',
      message: 'This will reset settings, reload default starter tasks, and reset timer statistics. Proceed?',
      okText: 'Reset App',
      onConfirm: () => {
        localStorage.removeItem(STORAGE_KEYS.TASKS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        state.settings = {
          displayName: 'Productive User',
          theme: 'theme-dark',
          showToasts: true,
          pomoSound: true,
          completedPomoSessions: 0,
          totalFocusMinutes: 0
        };
        state.tasks = getDefaultStarterTasks();
        saveTasksToStorage();
        saveSettingsToStorage();
        applyTheme(state.settings.theme);
        applySettingsToForm();
        renderAllViews();
        showToast('Application reset to default state.', 'success');
      }
    });
  }

  // ----------------------------------------------------------------------------
  // METRICS & STATISTICS CALCULATIONS
  // ----------------------------------------------------------------------------
  function calculateMetrics() {
    const total = state.tasks.length;
    let completed = 0;
    let pending = 0;
    let overdue = 0;
    let todayCount = 0;
    let completedToday = 0;

    const todayStr = getTodayDateString();

    state.tasks.forEach(task => {
      if (task.completed) {
        completed++;
        if (task.completedAt && task.completedAt.startsWith(todayStr)) {
          completedToday++;
        }
      } else {
        pending++;
        if (task.dueDate && task.dueDate < todayStr) {
          overdue++;
        }
      }

      if (task.dueDate === todayStr) {
        todayCount++;
      }
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Overall productivity score factoring timely completion
    let productivityScore = 0;
    if (total > 0) {
      const overdueRatio = overdue / total;
      const rawScore = completionRate - (overdueRatio * 30);
      productivityScore = Math.max(0, Math.min(100, Math.round(rawScore)));
    }

    return {
      total,
      completed,
      pending,
      overdue,
      todayCount,
      completedToday,
      completionRate,
      productivityScore
    };
  }

  // ----------------------------------------------------------------------------
  // NAVIGATION & VIEW SWITCHING
  // ----------------------------------------------------------------------------
  function switchView(viewName) {
    const validViews = ['dashboard', 'tasks', 'calendar', 'pomodoro', 'analytics', 'settings'];
    if (!validViews.includes(viewName)) return;

    state.currentView = viewName;

    // Nav Link Highlight
    document.querySelectorAll('.nav-link').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // Panel Display
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    const activePanel = document.getElementById(`view${capitalize(viewName)}`);
    if (activePanel) activePanel.classList.add('active');

    // Update Header
    updateHeaderTitles(viewName);

    // Close Mobile Drawer
    closeMobileSidebar();

    // Specific view renders
    if (viewName === 'dashboard') renderDashboardView();
    else if (viewName === 'tasks') renderMyTasksView();
    else if (viewName === 'calendar') renderCalendarView();
    else if (viewName === 'analytics') renderAnalyticsView();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateHeaderTitles(viewName) {
    const titleEl = document.getElementById('pageTitle');
    const subtitleEl = document.getElementById('pageSubtitle');
    if (!titleEl || !subtitleEl) return;

    const titles = {
      dashboard: { title: 'Dashboard', sub: 'Organize Tasks. Stay Productive.' },
      tasks: { title: 'My Tasks', sub: 'Filter, prioritize, and manage your workload' },
      calendar: { title: 'Calendar', sub: 'Visual schedule and deadline timeline' },
      pomodoro: { title: 'Pomodoro Timer', sub: 'Structured intervals for deep focus and breaks' },
      analytics: { title: 'Analytics', sub: 'Productivity health and velocity insights' },
      settings: { title: 'Settings', sub: 'Preferences, themes, and data management' }
    };

    if (titles[viewName]) {
      titleEl.textContent = titles[viewName].title;
      subtitleEl.textContent = titles[viewName].sub;
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ----------------------------------------------------------------------------
  // RENDERING: DASHBOARD
  // ----------------------------------------------------------------------------
  function renderDashboardView() {
    const metrics = calculateMetrics();

    // Welcome Greeting
    const welcomeUserEl = document.getElementById('welcomeUserName');
    if (welcomeUserEl) welcomeUserEl.textContent = state.settings.displayName || 'Productive User';

    // 5 Stat Cards
    const totalEl = document.getElementById('dashTotalCount');
    const compEl = document.getElementById('dashCompletedCount');
    const pendEl = document.getElementById('dashPendingCount');
    const overEl = document.getElementById('dashOverdueCount');
    const todayEl = document.getElementById('dashTodayCount');
    const rateDescEl = document.getElementById('dashCompletionRateDesc');

    if (totalEl) totalEl.textContent = metrics.total;
    if (compEl) compEl.textContent = metrics.completed;
    if (pendEl) pendEl.textContent = metrics.pending;
    if (overEl) overEl.textContent = metrics.overdue;
    if (todayEl) todayEl.textContent = metrics.todayCount;
    if (rateDescEl) rateDescEl.textContent = `${metrics.completionRate}% complete`;

    // Progress Section
    const progressRatioEl = document.getElementById('dashProgressRatioText');
    const progressPercentEl = document.getElementById('dashProgressPercent');
    const progressBar = document.getElementById('dashProgressBar');
    const progressComp = document.getElementById('progressCompCount');
    const progressPend = document.getElementById('progressPendCount');
    const progressOver = document.getElementById('progressOverCount');
    const progressToday = document.getElementById('progressTodayCount');

    if (progressRatioEl) progressRatioEl.textContent = `${metrics.completed} of ${metrics.total} tasks`;
    if (progressPercentEl) progressPercentEl.textContent = `${metrics.completionRate}%`;
    if (progressBar) progressBar.style.width = `${metrics.completionRate}%`;
    if (progressComp) progressComp.textContent = metrics.completed;
    if (progressPend) progressPend.textContent = metrics.pending;
    if (progressOver) progressOver.textContent = metrics.overdue;
    if (progressToday) progressToday.textContent = metrics.todayCount;

    // Sidebar Badge
    const navBadge = document.getElementById('navPendingBadge');
    if (navBadge) {
      navBadge.textContent = metrics.pending;
      navBadge.style.display = metrics.pending > 0 ? 'inline-block' : 'none';
    }

    // Recent Tasks List Preview
    renderDashboardRecentTasks();
  }

  function renderDashboardRecentTasks() {
    const container = document.getElementById('dashRecentTasksList');
    if (!container) return;

    if (state.tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card" style="padding: 24px 16px;">
          <div class="empty-icon-wrap" style="width: 44px; height: 44px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>
          </div>
          <h4 class="empty-title" style="font-size: 1rem;">No tasks yet!</h4>
          <p class="empty-desc" style="font-size: 0.78rem;">Use the form to add your first task.</p>
        </div>
      `;
      return;
    }

    // Show top 5 sorted: pending items first, sorted by due date
    const sorted = [...state.tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    }).slice(0, 5);

    let html = '';
    sorted.forEach(task => {
      const isCompleted = task.completed;
      const isOverdue = !isCompleted && isDateOverdue(task.dueDate);
      const isToday = !isCompleted && isDateToday(task.dueDate);

      let dueText = 'No date';
      if (task.dueDate) {
        if (isOverdue) dueText = `<span class="text-danger font-bold">Overdue (${formatDateShort(task.dueDate)})</span>`;
        else if (isToday) dueText = `<span class="text-warning font-bold">Today</span>`;
        else dueText = formatDateShort(task.dueDate);
      }

      html += `
        <div class="mini-task-item ${isCompleted ? 'is-completed' : ''}" data-id="${task.id}">
          <div class="mini-task-left">
            <button class="task-check-btn" onclick="TaskNestApp.toggleTask('${task.id}')" title="${isCompleted ? 'Mark Pending' : 'Mark Complete'}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <div style="overflow: hidden;">
              <div class="mini-task-title" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; gap: 6px; align-items: center; margin-top: 2px;">
                <span class="badge-cat cat-${task.category}">${task.category}</span>
                <span>${dueText}</span>
              </div>
            </div>
          </div>
          <div class="task-action-buttons">
            <button class="task-btn-action" onclick="TaskNestApp.openEditModal('${task.id}')" title="Edit Task">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="task-btn-action action-del" onclick="TaskNestApp.deleteTask('${task.id}')" title="Delete Task">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // ----------------------------------------------------------------------------
  // RENDERING: MY TASKS (SEARCH, COMPOUND FILTERS & SORTING)
  // ----------------------------------------------------------------------------
  function renderMyTasksView() {
    const container = document.getElementById('taskCardsContainer');
    const countEl = document.getElementById('tasksResultCount');
    const clearSearchBtn = document.getElementById('searchClearBtn');
    const activeTagsEl = document.getElementById('activeFilterTags');

    if (!container) return;

    // Toggle Clear Search Button
    if (clearSearchBtn) {
      clearSearchBtn.style.display = state.filters.search ? 'inline-flex' : 'none';
    }

    // 1. Filter Tasks
    let filtered = state.tasks.filter(task => {
      // Search
      if (state.filters.search) {
        const query = state.filters.search.toLowerCase();
        const titleMatch = (task.title || '').toLowerCase().includes(query);
        const descMatch = (task.description || '').toLowerCase().includes(query);
        if (!titleMatch && !descMatch) return false;
      }

      // Status
      if (state.filters.status === 'Pending' && task.completed) return false;
      if (state.filters.status === 'Completed' && !task.completed) return false;
      if (state.filters.status === 'Overdue') {
        if (task.completed || !isDateOverdue(task.dueDate)) return false;
      }

      // Category
      if (state.filters.category !== 'All' && task.category !== state.filters.category) {
        return false;
      }

      // Priority
      if (state.filters.priority !== 'All' && task.priority !== state.filters.priority) {
        return false;
      }

      return true;
    });

    // 2. Sort Tasks
    filtered.sort((a, b) => {
      if (state.filters.sortBy === 'due-asc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      } else if (state.filters.sortBy === 'due-desc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return b.dueDate.localeCompare(a.dueDate);
      } else if (state.filters.sortBy === 'priority-desc') {
        const weight = { High: 3, Medium: 2, Low: 1 };
        return (weight[b.priority] || 0) - (weight[a.priority] || 0);
      } else {
        // 'created-desc'
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
    });

    // 3. Update Result Count
    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} of ${state.tasks.length} tasks`;
    }

    // 4. Update Active Filter Tags
    if (activeTagsEl) {
      let tagsHtml = '';
      if (state.filters.status !== 'All') {
        tagsHtml += `<span class="badge badge-purple">Status: ${state.filters.status}</span>`;
      }
      if (state.filters.category !== 'All') {
        tagsHtml += `<span class="badge badge-purple">Category: ${state.filters.category}</span>`;
      }
      if (state.filters.priority !== 'All') {
        tagsHtml += `<span class="badge badge-purple">Priority: ${state.filters.priority}</span>`;
      }
      if (state.filters.search) {
        tagsHtml += `<span class="badge badge-purple">Search: "${escapeHtml(state.filters.search)}"</span>`;
      }
      activeTagsEl.innerHTML = tagsHtml;
    }

    // 5. Handle Empty States
    if (state.tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
          </div>
          <h3 class="empty-title">No tasks yet!</h3>
          <p class="empty-desc">Create your first task to start organizing your projects.</p>
          <button class="btn btn-primary" onclick="TaskNestApp.openAddModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Create Task</span>
          </button>
        </div>
      `;
      return;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon-wrap" style="background: rgba(245, 158, 11, 0.15); color: var(--color-warning);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3 class="empty-title">No matching tasks found.</h3>
          <p class="empty-desc">Try modifying your search or reset active filters.</p>
          <button class="btn btn-secondary" onclick="TaskNestApp.clearFilters()">Clear Filters</button>
        </div>
      `;
      return;
    }

    // 6. Render Task Cards
    let cardsHtml = '';
    filtered.forEach(task => {
      const isCompleted = task.completed;
      const isOverdue = !isCompleted && isDateOverdue(task.dueDate);
      const isToday = !isCompleted && isDateToday(task.dueDate);

      let dueClass = '';
      let dueText = 'No due date';
      let dueIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>`;

      if (isCompleted) {
        dueClass = 'is-completed';
        dueText = 'Completed';
        dueIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      } else if (isOverdue) {
        dueClass = 'is-overdue';
        dueText = `Overdue (${formatDateShort(task.dueDate)})`;
        dueIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>`;
      } else if (isToday) {
        dueClass = 'is-today';
        dueText = 'Due Today';
      } else if (task.dueDate) {
        dueText = `Due ${formatDateShort(task.dueDate)}`;
      }

      cardsHtml += `
        <div class="task-card priority-${task.priority.toLowerCase()} ${isCompleted ? 'is-completed' : ''}" data-id="${task.id}">
          <div class="task-card-top">
            <div class="task-badges-row">
              <span class="badge-cat cat-${task.category}">${task.category}</span>
              <span class="badge-prio prio-${task.priority}">${task.priority}</span>
            </div>
            <button class="task-check-btn" onclick="TaskNestApp.toggleTask('${task.id}')" title="${isCompleted ? 'Mark Pending' : 'Mark Complete'}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
          </div>

          <div class="task-card-body">
            <h4 class="task-card-title">${escapeHtml(task.title)}</h4>
            <p class="task-card-desc">${escapeHtml(task.description || 'No additional notes.')}</p>
          </div>

          <div class="task-card-footer">
            <div class="task-due-chip ${dueClass}">
              ${dueIcon}
              <span>${dueText}</span>
            </div>

            <div class="task-action-buttons">
              <button class="task-btn-action action-toggle" onclick="TaskNestApp.toggleTask('${task.id}')" title="${isCompleted ? 'Mark Pending' : 'Mark Complete'}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>
              <button class="task-btn-action" onclick="TaskNestApp.openEditModal('${task.id}')" title="Edit Task">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="task-btn-action action-del" onclick="TaskNestApp.deleteTask('${task.id}')" title="Delete Task">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = cardsHtml;
  }

  function clearFilters() {
    state.filters = {
      search: '',
      status: 'All',
      category: 'All',
      priority: 'All',
      sortBy: 'created-desc'
    };

    const searchInput = document.getElementById('taskSearchInput');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('taskSortSelect');
    if (sortSelect) sortSelect.value = 'created-desc';

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
  // RENDERING: CALENDAR VIEW
  // ----------------------------------------------------------------------------
  function renderCalendarView() {
    const titleEl = document.getElementById('calendarMonthYearText');
    const badgeEl = document.getElementById('calendarTaskCountBadge');
    const gridEl = document.getElementById('calendarDaysGrid');

    if (!gridEl) return;

    const currentYear = state.calendar.year;
    const currentMonth = state.calendar.month;

    // Title
    const monthObj = new Date(currentYear, currentMonth, 1);
    if (titleEl) {
      titleEl.textContent = monthObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    const scheduledCount = state.tasks.filter(t => !!t.dueDate).length;
    if (badgeEl) badgeEl.textContent = `${scheduledCount} scheduled`;

    // Days Grid Calculation
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const todayStr = getTodayDateString();
    let gridHtml = '';

    // Trailing days from previous month
    for (let x = firstDayIndex; x > 0; x--) {
      const dayNum = daysInPrevMonth - x + 1;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const prevDateStr = formatDateKey(prevDate);
      gridHtml += buildCalDayCell(dayNum, prevDateStr, true);
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const dateStr = formatDateKey(dateObj);
      const isToday = (dateStr === todayStr);
      const isSelected = (dateStr === state.calendar.selectedDate);
      gridHtml += buildCalDayCell(d, dateStr, false, isToday, isSelected);
    }

    // Leading days for next month
    const totalCells = firstDayIndex + daysInMonth;
    const nextDays = (7 - (totalCells % 7)) % 7;
    for (let d = 1; d <= nextDays; d++) {
      const nextDate = new Date(currentYear, currentMonth + 1, d);
      const nextDateStr = formatDateKey(nextDate);
      gridHtml += buildCalDayCell(d, nextDateStr, true);
    }

    gridEl.innerHTML = gridHtml;
    renderCalendarDateDetails();
  }

  function formatDateKey(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function buildCalDayCell(dayNum, dateStr, isOtherMonth, isToday = false, isSelected = false) {
    const tasksOnDay = state.tasks.filter(t => t.dueDate === dateStr);
    const count = tasksOnDay.length;

    let classes = 'calendar-day-cell';
    if (isOtherMonth) classes += ' other-month';
    if (isToday) classes += ' is-today';
    if (isSelected) classes += ' is-selected';

    let pillsHtml = '';
    if (count > 0) {
      const hasPending = tasksOnDay.some(t => !t.completed && !isDateOverdue(t.dueDate));
      const hasOverdue = tasksOnDay.some(t => !t.completed && isDateOverdue(t.dueDate));
      const allCompleted = tasksOnDay.every(t => t.completed);

      let pillClass = 'day-task-pill';
      if (hasOverdue) pillClass += ' has-overdue';
      else if (hasPending) pillClass += ' has-pending';
      else if (allCompleted) pillClass += ' all-completed';

      pillsHtml = `<div class="day-task-indicators"><span class="${pillClass}">${count} task${count > 1 ? 's' : ''}</span></div>`;
    }

    return `
      <div class="${classes}" onclick="TaskNestApp.selectCalDate('${dateStr}')" data-date="${dateStr}">
        <span class="day-number">${dayNum}</span>
        ${pillsHtml}
      </div>
    `;
  }

  function selectCalDate(dateStr) {
    state.calendar.selectedDate = dateStr;
    renderCalendarView();
  }

  function renderCalendarDateDetails() {
    const titleEl = document.getElementById('calSelectedDateTitle');
    const subtitleEl = document.getElementById('calSelectedDateSubtitle');
    const listEl = document.getElementById('calSelectedTasksList');

    if (!listEl) return;

    const selDate = state.calendar.selectedDate || getTodayDateString();
    const formatted = formatDateShort(selDate);

    if (titleEl) titleEl.textContent = isDateToday(selDate) ? `Today (${formatted})` : formatted;

    const tasksOnDate = state.tasks.filter(t => t.dueDate === selDate);
    if (subtitleEl) subtitleEl.textContent = `${tasksOnDate.length} task${tasksOnDate.length !== 1 ? 's' : ''} scheduled`;

    if (tasksOnDate.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state-card" style="padding: 24px 16px;">
          <h5 class="empty-title" style="font-size: 0.95rem;">No tasks due on this date</h5>
          <p class="empty-desc" style="font-size: 0.78rem;">Click 'Add Task' to schedule an assignment or project.</p>
        </div>
      `;
      return;
    }

    let html = '';
    tasksOnDate.forEach(task => {
      const isCompleted = task.completed;
      html += `
        <div class="mini-task-item ${isCompleted ? 'is-completed' : ''}" data-id="${task.id}">
          <div class="mini-task-left">
            <button class="task-check-btn" onclick="TaskNestApp.toggleTask('${task.id}')" title="${isCompleted ? 'Mark Pending' : 'Mark Complete'}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <div>
              <div class="mini-task-title" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; gap: 6px; margin-top: 2px;">
                <span class="badge-cat cat-${task.category}">${task.category}</span>
                <span class="badge-prio prio-${task.priority}">${task.priority}</span>
              </div>
            </div>
          </div>
          <div class="task-action-buttons">
            <button class="task-btn-action" onclick="TaskNestApp.openEditModal('${task.id}')" title="Edit Task">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="task-btn-action action-del" onclick="TaskNestApp.deleteTask('${task.id}')" title="Delete Task">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  }

  function changeCalendarMonth(offset) {
    let newMonth = state.calendar.month + offset;
    let newYear = state.calendar.year;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    state.calendar.month = newMonth;
    state.calendar.year = newYear;
    renderCalendarView();
  }

  function jumpToTodayCal() {
    const now = new Date();
    state.calendar.month = now.getMonth();
    state.calendar.year = now.getFullYear();
    state.calendar.selectedDate = getTodayDateString();
    renderCalendarView();
  }

  // ----------------------------------------------------------------------------
  // POMODORO FOCUS TIMER
  // ----------------------------------------------------------------------------
  function setPomodoroMode(mode) {
    if (!POMO_DURATIONS[mode]) return;
    
    // Stop running timer
    if (state.pomodoro.isRunning) {
      pausePomodoro();
    }

    state.pomodoro.mode = mode;
    state.pomodoro.totalSeconds = POMO_DURATIONS[mode];
    state.pomodoro.remainingSeconds = POMO_DURATIONS[mode];

    // Update Mode Buttons
    document.querySelectorAll('.pomo-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    updatePomodoroDisplay();
  }

  function startPomodoro() {
    if (state.pomodoro.isRunning) {
      pausePomodoro();
      return;
    }

    state.pomodoro.isRunning = true;
    updatePomoButtonStates(true);

    const statusLabel = document.getElementById('pomoStatusLabel');
    if (statusLabel) {
      statusLabel.textContent = state.pomodoro.mode === 'focus' ? 'Deep Work in Progress' : 'Break in Progress';
    }

    state.pomodoro.intervalId = setInterval(() => {
      if (state.pomodoro.remainingSeconds > 0) {
        state.pomodoro.remainingSeconds--;
        updatePomodoroDisplay();
      } else {
        // Session Finished!
        completePomodoroSession();
      }
    }, 1000);
  }

  function pausePomodoro() {
    state.pomodoro.isRunning = false;
    clearInterval(state.pomodoro.intervalId);
    state.pomodoro.intervalId = null;
    updatePomoButtonStates(false);

    const statusLabel = document.getElementById('pomoStatusLabel');
    if (statusLabel) statusLabel.textContent = 'Paused';
  }

  function resetPomodoro() {
    pausePomodoro();
    state.pomodoro.remainingSeconds = state.pomodoro.totalSeconds;
    updatePomodoroDisplay();

    const statusLabel = document.getElementById('pomoStatusLabel');
    if (statusLabel) statusLabel.textContent = 'Ready to Focus';
  }

  function completePomodoroSession() {
    pausePomodoro();
    playCompletionChime();

    if (state.pomodoro.mode === 'focus') {
      state.settings.completedPomoSessions = (state.settings.completedPomoSessions || 0) + 1;
      state.settings.totalFocusMinutes = (state.settings.totalFocusMinutes || 0) + 25;
      saveSettingsToStorage();
      updatePomodoroFooterStats();
      showToast('Focus session completed! Take a well-deserved break.', 'success');

      // Auto-switch to short break
      setPomodoroMode('shortBreak');
    } else {
      showToast('Break completed! Ready for the next focus sprint?', 'info');
      setPomodoroMode('focus');
    }
  }

  function updatePomodoroDisplay() {
    const minutes = Math.floor(state.pomodoro.remainingSeconds / 60);
    const seconds = state.pomodoro.remainingSeconds % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const displayEl = document.getElementById('pomoTimeDisplay');
    if (displayEl) displayEl.textContent = timeStr;

    // SVG Circular Ring animation (2 * PI * 95 = 596.9)
    const ring = document.getElementById('pomoProgressRing');
    if (ring) {
      const circumference = 2 * Math.PI * 95;
      const progress = (state.pomodoro.totalSeconds - state.pomodoro.remainingSeconds) / state.pomodoro.totalSeconds;
      const offset = circumference * (1 - progress);
      ring.style.strokeDashoffset = offset;
    }
  }

  function updatePomoButtonStates(running) {
    const btnText = document.getElementById('pomoStartBtnText');
    if (btnText) {
      btnText.textContent = running ? 'Pause' : 'Start Focus';
    }
  }

  function updatePomodoroFooterStats() {
    const countEl = document.getElementById('pomoSessionCount');
    const timeEl = document.getElementById('pomoTotalFocusMinutes');
    const dailySessionsEl = document.getElementById('dailyPomodoroSessions');

    if (countEl) countEl.textContent = state.settings.completedPomoSessions || 0;
    if (timeEl) timeEl.textContent = `${state.settings.totalFocusMinutes || 0} mins`;
    if (dailySessionsEl) dailySessionsEl.textContent = state.settings.completedPomoSessions || 0;
  }

  // ----------------------------------------------------------------------------
  // RENDERING: PRODUCTIVITY ANALYTICS
  // ----------------------------------------------------------------------------
  function renderAnalyticsView() {
    const metrics = calculateMetrics();

    // Radial Score
    const scoreVal = document.getElementById('analyticsProductivityScore');
    const scorePath = document.getElementById('analyticsScorePath');
    const rateBadge = document.getElementById('analyticsRateBadge');
    const statusBadge = document.getElementById('analyticsStatusBadge');
    const headlineEl = document.getElementById('analyticsHeadline');
    const descEl = document.getElementById('analyticsSummaryText');

    if (scoreVal) scoreVal.textContent = `${metrics.productivityScore}%`;
    if (scorePath) scorePath.setAttribute('stroke-dasharray', `${metrics.productivityScore}, 100`);
    if (rateBadge) rateBadge.textContent = `Completion Rate: ${metrics.completionRate}%`;

    if (headlineEl && descEl && statusBadge) {
      if (metrics.total === 0) {
        headlineEl.textContent = 'Welcome to TaskNest Analytics';
        descEl.textContent = 'Add tasks to start tracking your completion velocity and productivity score.';
        statusBadge.textContent = 'Status: Clean Slate';
      } else if (metrics.productivityScore >= 80) {
        headlineEl.textContent = 'High Productivity Velocity!';
        descEl.textContent = 'Excellent performance! You are completing tasks and hitting targets on time.';
        statusBadge.textContent = 'Status: High Performer';
      } else if (metrics.productivityScore >= 50) {
        headlineEl.textContent = 'Steady Productivity Momentum';
        descEl.textContent = 'Good progress! Knock out pending items to boost your overall completion score.';
        statusBadge.textContent = 'Status: On Track';
      } else {
        headlineEl.textContent = 'Action Required';
        descEl.textContent = 'You have pending or overdue tasks. Clear the highest priority items today.';
        statusBadge.textContent = 'Status: Focus Needed';
      }
    }

    // 4 Summary Counters
    const totalEl = document.getElementById('analyticsTotalCount');
    const compEl = document.getElementById('analyticsCompletedCount');
    const pendEl = document.getElementById('analyticsPendingCount');
    const overEl = document.getElementById('analyticsOverdueCount');

    if (totalEl) totalEl.textContent = metrics.total;
    if (compEl) compEl.textContent = metrics.completed;
    if (pendEl) pendEl.textContent = metrics.pending;
    if (overEl) overEl.textContent = metrics.overdue;

    // Daily Summary Card
    const dueTodayEl = document.getElementById('dailyDueTodayCount');
    const compTodayEl = document.getElementById('dailyCompletedTodayCount');
    const pendTodayEl = document.getElementById('dailyPendingTodayCount');
    const pomoTodayEl = document.getElementById('dailyPomodoroSessions');

    if (dueTodayEl) dueTodayEl.textContent = metrics.todayCount;
    if (compTodayEl) compTodayEl.textContent = metrics.completedToday;
    if (pendTodayEl) pendTodayEl.textContent = Math.max(0, metrics.todayCount - metrics.completedToday);
    if (pomoTodayEl) pomoTodayEl.textContent = state.settings.completedPomoSessions || 0;

    // Category Breakdown Bars
    renderCategoryBreakdown(metrics.total);

    // Priority Breakdown Bars
    renderPriorityBreakdown(metrics.total);

    // Weekly Productivity Report Bars
    renderWeeklyVelocityReport();
  }

  function renderCategoryBreakdown(totalTasks) {
    const listEl = document.getElementById('analyticsCategoryList');
    if (!listEl) return;

    const counts = {};
    CATEGORIES.forEach(c => counts[c] = 0);
    state.tasks.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });

    let html = '';
    CATEGORIES.forEach(cat => {
      const count = counts[cat] || 0;
      const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

      let color = 'var(--cat-other)';
      if (cat === 'College') color = 'var(--cat-college)';
      else if (cat === 'Personal') color = 'var(--cat-personal)';
      else if (cat === 'Projects') color = 'var(--cat-projects)';
      else if (cat === 'Internship') color = 'var(--cat-internship)';
      else if (cat === 'Work') color = 'var(--cat-work)';

      html += `
        <div class="breakdown-item-row">
          <div class="breakdown-header">
            <span class="breakdown-name" style="color: ${color}">${cat}</span>
            <span class="breakdown-stats">${count} tasks (${pct}%)</span>
          </div>
          <div class="breakdown-track">
            <div class="breakdown-fill" style="width: ${pct}%; background-color: ${color};"></div>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  }

  function renderPriorityBreakdown(totalTasks) {
    const listEl = document.getElementById('analyticsPriorityList');
    if (!listEl) return;

    const counts = { High: 0, Medium: 0, Low: 0 };
    state.tasks.forEach(t => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });

    let html = '';
    PRIORITIES.forEach(prio => {
      const count = counts[prio] || 0;
      const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

      let color = 'var(--prio-medium)';
      if (prio === 'High') color = 'var(--prio-high)';
      else if (prio === 'Low') color = 'var(--prio-low)';

      html += `
        <div class="breakdown-item-row">
          <div class="breakdown-header">
            <span class="breakdown-name" style="color: ${color}">${prio} Priority</span>
            <span class="breakdown-stats">${count} tasks (${pct}%)</span>
          </div>
          <div class="breakdown-track">
            <div class="breakdown-fill" style="width: ${pct}%; background-color: ${color};"></div>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  }

  function renderWeeklyVelocityReport() {
    const chartEl = document.getElementById('weeklyVelocityChart');
    if (!chartEl) return;

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = formatDateKey(d);
      const dayName = dayNames[d.getDay()];

      const completedCount = state.tasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(dateKey)).length;
      days.push({ name: dayName, count: completedCount });
    }

    const maxCount = Math.max(1, ...days.map(d => d.count));

    let html = '';
    days.forEach(d => {
      const heightPct = Math.round((d.count / maxCount) * 100);
      html += `
        <div class="velocity-bar-col">
          <div class="velocity-bar-wrap" title="${d.count} tasks completed">
            <div class="velocity-bar" style="height: ${Math.max(6, heightPct)}%;"></div>
          </div>
          <span class="velocity-label">${d.name} (${d.count})</span>
        </div>
      `;
    });

    chartEl.innerHTML = html;
  }

  // ----------------------------------------------------------------------------
  // THEMES & SETTINGS FORM
  // ----------------------------------------------------------------------------
  function applyTheme(themeClass) {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(themeClass);
    state.settings.theme = themeClass;
    saveSettingsToStorage();

    const darkCard = document.getElementById('themeCardDark');
    const lightCard = document.getElementById('themeCardLight');
    if (darkCard && lightCard) {
      darkCard.classList.toggle('active', themeClass === 'theme-dark');
      lightCard.classList.toggle('active', themeClass === 'theme-light');
    }
  }

  function toggleQuickTheme() {
    const nextTheme = state.settings.theme === 'theme-dark' ? 'theme-light' : 'theme-dark';
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'theme-dark' ? 'Dark Navy' : 'Light'} theme`, 'info');
  }

  function applySettingsToForm() {
    const nameInput = document.getElementById('settingsDisplayName');
    const toastToggle = document.getElementById('settingsToastToggle');
    const soundToggle = document.getElementById('pomoSoundToggle');
    const sidebarName = document.getElementById('sidebarUserName');
    const sidebarAvatar = document.getElementById('sidebarAvatar');

    if (nameInput) nameInput.value = state.settings.displayName || '';
    if (toastToggle) toastToggle.checked = !!state.settings.showToasts;
    if (soundToggle) soundToggle.checked = !!state.settings.pomoSound;

    if (sidebarName) sidebarName.textContent = state.settings.displayName || 'Productive User';
    if (sidebarAvatar) {
      const name = (state.settings.displayName || 'TN').trim();
      const initials = name.split(' ').map(n => n[0]).join('').substr(0, 2).toUpperCase();
      sidebarAvatar.textContent = initials || 'TN';
    }
  }

  // ----------------------------------------------------------------------------
  // EXPORT & IMPORT BACKUP (JSON)
  // ----------------------------------------------------------------------------
  function exportTasksJson() {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.tasks, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `tasknest_backup_${getTodayDateString()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
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
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          const existingIds = new Set(state.tasks.map(t => t.id));
          let count = 0;
          imported.forEach(t => {
            if (t.id && (t.title || t.text)) {
              if (!existingIds.has(t.id)) {
                state.tasks.push({
                  id: t.id,
                  title: t.title || t.text,
                  description: t.description || '',
                  category: CATEGORIES.includes(t.category) ? t.category : 'Work',
                  priority: PRIORITIES.includes(t.priority) ? t.priority : 'Medium',
                  dueDate: t.dueDate || '',
                  completed: !!t.completed,
                  createdAt: t.createdAt || new Date().toISOString(),
                  completedAt: t.completedAt || null
                });
                existingIds.add(t.id);
                count++;
              }
            }
          });
          saveTasksToStorage();
          renderAllViews();
          showToast(`Imported ${count} tasks successfully!`, 'success');
        } else {
          showToast('Invalid JSON file format.', 'danger');
        }
      } catch (err) {
        console.error(err);
        showToast('Error parsing backup file.', 'danger');
      }
    };
    reader.readAsText(file);
  }

  // ----------------------------------------------------------------------------
  // MODALS: ADD & EDIT
  // ----------------------------------------------------------------------------
  function openAddModal(prefilledDueDate = null) {
    const modal = document.getElementById('addTaskModal');
    const titleInput = document.getElementById('modalTaskTitle');
    const descInput = document.getElementById('modalTaskDesc');
    const catSelect = document.getElementById('modalTaskCategory');
    const prioSelect = document.getElementById('modalTaskPriority');
    const dueInput = document.getElementById('modalTaskDueDate');
    const errorEl = document.getElementById('modalTitleError');

    if (!modal) return;

    titleInput.value = '';
    titleInput.classList.remove('is-invalid');
    if (errorEl) errorEl.textContent = '';
    descInput.value = '';
    catSelect.value = 'Internship';
    prioSelect.value = 'Medium';
    dueInput.value = prefilledDueDate || getTodayDateString();

    modal.classList.add('active');
    setTimeout(() => titleInput.focus(), 150);
  }

  function closeAddModal() {
    const modal = document.getElementById('addTaskModal');
    if (modal) modal.classList.remove('active');
  }

  function openEditModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.getElementById('editTaskModal');
    const idInput = document.getElementById('editTaskId');
    const titleInput = document.getElementById('editTaskTitle');
    const descInput = document.getElementById('editTaskDesc');
    const catSelect = document.getElementById('editTaskCategory');
    const prioSelect = document.getElementById('editTaskPriority');
    const dueInput = document.getElementById('editTaskDueDate');
    const statusSelect = document.getElementById('editTaskStatus');
    const errorEl = document.getElementById('editTitleError');

    if (!modal) return;

    idInput.value = task.id;
    titleInput.value = task.title;
    titleInput.classList.remove('is-invalid');
    if (errorEl) errorEl.textContent = '';
    descInput.value = task.description || '';
    catSelect.value = task.category;
    prioSelect.value = task.priority;
    dueInput.value = task.dueDate || '';
    statusSelect.value = task.completed ? 'completed' : 'pending';

    modal.classList.add('active');
    setTimeout(() => titleInput.focus(), 150);
  }

  function closeEditModal() {
    const modal = document.getElementById('editTaskModal');
    if (modal) modal.classList.remove('active');
  }

  // ----------------------------------------------------------------------------
  // MOBILE DRAWER
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
  // ALL VIEWS RENDER TRIGGER
  // ----------------------------------------------------------------------------
  function renderAllViews() {
    renderDashboardView();
    renderMyTasksView();
    renderCalendarView();
    renderAnalyticsView();
    updatePomodoroFooterStats();
  }

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
  // EVENT BINDINGS
  // ----------------------------------------------------------------------------
  function setupEventListeners() {
    // 1. Navigation items
    document.querySelectorAll('.nav-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        switchView(view);
      });
    });

    // 2. Mobile drawer
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileSidebar);
    if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileSidebar);

    // 3. Quick Theme Toggle
    const quickThemeBtn = document.getElementById('quickThemeBtn');
    if (quickThemeBtn) quickThemeBtn.addEventListener('click', toggleQuickTheme);

    const darkCard = document.getElementById('themeCardDark');
    const lightCard = document.getElementById('themeCardLight');
    if (darkCard) darkCard.addEventListener('click', () => applyTheme('theme-dark'));
    if (lightCard) lightCard.addEventListener('click', () => applyTheme('theme-light'));

    // 4. Modal Triggers
    const openAddBtn = document.getElementById('openAddModalBtn');
    const viewAllBtn = document.getElementById('viewAllFromDashBtn');
    if (openAddBtn) openAddBtn.addEventListener('click', () => openAddModal());
    if (viewAllBtn) viewAllBtn.addEventListener('click', () => switchView('tasks'));

    // 5. Dashboard Quick Add Form
    const dashForm = document.getElementById('dashQuickAddForm');
    const dashTitle = document.getElementById('dashTaskTitle');
    const dashError = document.getElementById('dashTitleError');
    const dashCancel = document.getElementById('dashCancelBtn');

    if (dashTitle) {
      dashTitle.addEventListener('input', () => {
        dashTitle.classList.remove('is-invalid');
        if (dashError) dashError.textContent = '';
      });
    }

    if (dashCancel) {
      dashCancel.addEventListener('click', () => {
        dashForm.reset();
        dashTitle.classList.remove('is-invalid');
        if (dashError) dashError.textContent = '';
        document.getElementById('dashTaskDueDate').value = getTodayDateString();
      });
    }

    if (dashForm) {
      dashForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = dashTitle.value.trim();
        if (!title) {
          dashTitle.classList.add('is-invalid');
          if (dashError) dashError.textContent = 'Please enter a task title.';
          dashTitle.focus();
          showToast('Please enter a task title.', 'danger');
          return;
        }

        const success = addTask({
          title,
          description: document.getElementById('dashTaskDesc').value,
          category: document.getElementById('dashTaskCategory').value,
          priority: document.getElementById('dashTaskPriority').value,
          dueDate: document.getElementById('dashTaskDueDate').value
        });

        if (success) {
          dashForm.reset();
          document.getElementById('dashTaskDueDate').value = getTodayDateString();
        }
      });
    }

    // 6. Modal Add Form
    const modalAddForm = document.getElementById('modalAddTaskForm');
    const modalTitle = document.getElementById('modalTaskTitle');
    const modalError = document.getElementById('modalTitleError');
    const closeAddBtn = document.getElementById('closeAddModalBtn');
    const cancelAddBtn = document.getElementById('cancelAddModalBtn');

    if (closeAddBtn) closeAddBtn.addEventListener('click', closeAddModal);
    if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeAddModal);

    if (modalTitle) {
      modalTitle.addEventListener('input', () => {
        modalTitle.classList.remove('is-invalid');
        if (modalError) modalError.textContent = '';
      });
    }

    if (modalAddForm) {
      modalAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = modalTitle.value.trim();
        if (!title) {
          modalTitle.classList.add('is-invalid');
          if (modalError) modalError.textContent = 'Please enter a task title.';
          modalTitle.focus();
          showToast('Please enter a task title.', 'danger');
          return;
        }

        const success = addTask({
          title,
          description: document.getElementById('modalTaskDesc').value,
          category: document.getElementById('modalTaskCategory').value,
          priority: document.getElementById('modalTaskPriority').value,
          dueDate: document.getElementById('modalTaskDueDate').value
        });

        if (success) closeAddModal();
      });
    }

    // 7. Modal Edit Form
    const editForm = document.getElementById('editTaskForm');
    const editTitle = document.getElementById('editTaskTitle');
    const editError = document.getElementById('editTitleError');
    const closeEditBtn = document.getElementById('closeEditModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditModalBtn');

    if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

    if (editTitle) {
      editTitle.addEventListener('input', () => {
        editTitle.classList.remove('is-invalid');
        if (editError) editError.textContent = '';
      });
    }

    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editTaskId').value;
        const title = editTitle.value.trim();
        if (!title) {
          editTitle.classList.add('is-invalid');
          if (editError) editError.textContent = 'Please enter a task title.';
          editTitle.focus();
          showToast('Please enter a task title.', 'danger');
          return;
        }

        const success = updateTask(id, {
          title,
          description: document.getElementById('editTaskDesc').value,
          category: document.getElementById('editTaskCategory').value,
          priority: document.getElementById('editTaskPriority').value,
          dueDate: document.getElementById('editTaskDueDate').value,
          status: document.getElementById('editTaskStatus').value
        });

        if (success) closeEditModal();
      });
    }

    // 8. Confirmation Dialog Buttons
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const confirmOkBtn = document.getElementById('confirmOkBtn');

    if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', hideConfirmDialog);
    if (confirmOkBtn) {
      confirmOkBtn.addEventListener('click', () => {
        if (typeof state.pendingConfirmAction === 'function') {
          state.pendingConfirmAction();
        }
        hideConfirmDialog();
      });
    }

    // 9. Search & Sort in My Tasks
    const searchInput = document.getElementById('taskSearchInput');
    const searchClear = document.getElementById('searchClearBtn');
    const sortSelect = document.getElementById('taskSortSelect');
    const clearFiltersBtn = document.getElementById('clearAllFiltersBtn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.filters.search = e.target.value;
        renderMyTasksView();
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        state.filters.search = '';
        renderMyTasksView();
        searchInput.focus();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.filters.sortBy = e.target.value;
        renderMyTasksView();
      });
    }

    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);

    // 10. Filter Pills: Status, Category, Priority
    document.querySelectorAll('#statusFilterPills .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#statusFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.filters.status = pill.getAttribute('data-status');
        renderMyTasksView();
      });
    });

    document.querySelectorAll('#categoryFilterPills .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#categoryFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.filters.category = pill.getAttribute('data-category');
        renderMyTasksView();
      });
    });

    document.querySelectorAll('#priorityFilterPills .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#priorityFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.filters.priority = pill.getAttribute('data-priority');
        renderMyTasksView();
      });
    });

    // 11. Calendar Controls
    const calPrev = document.getElementById('calPrevMonthBtn');
    const calNext = document.getElementById('calNextMonthBtn');
    const calToday = document.getElementById('calTodayBtn');
    const calAddBtn = document.getElementById('calQuickAddBtn');

    if (calPrev) calPrev.addEventListener('click', () => changeCalendarMonth(-1));
    if (calNext) calNext.addEventListener('click', () => changeCalendarMonth(1));
    if (calToday) calToday.addEventListener('click', jumpToTodayCal);
    if (calAddBtn) {
      calAddBtn.addEventListener('click', () => {
        openAddModal(state.calendar.selectedDate);
      });
    }

    // 12. Pomodoro Controls
    document.querySelectorAll('.pomo-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setPomodoroMode(btn.getAttribute('data-mode'));
      });
    });

    const pomoStartBtn = document.getElementById('pomoStartBtn');
    const pomoResetBtn = document.getElementById('pomoResetBtn');
    const soundToggle = document.getElementById('pomoSoundToggle');

    if (pomoStartBtn) pomoStartBtn.addEventListener('click', startPomodoro);
    if (pomoResetBtn) pomoResetBtn.addEventListener('click', resetPomodoro);
    if (soundToggle) {
      soundToggle.addEventListener('change', (e) => {
        state.settings.pomoSound = e.target.checked;
        saveSettingsToStorage();
      });
    }

    // 13. Settings Form & Data Actions
    const profileForm = document.getElementById('settingsProfileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = document.getElementById('settingsDisplayName').value.trim();
        state.settings.displayName = val || 'Productive User';
        saveSettingsToStorage();
        applySettingsToForm();
        renderDashboardView();
        showToast('Profile updated successfully!', 'success');
      });
    }

    const toastToggle = document.getElementById('settingsToastToggle');
    if (toastToggle) {
      toastToggle.addEventListener('change', (e) => {
        state.settings.showToasts = e.target.checked;
        saveSettingsToStorage();
        showToast(`Toasts ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
      });
    }

    const exportBtn = document.getElementById('exportDataBtn');
    const importInput = document.getElementById('importDataInput');
    const clearAllBtn = document.getElementById('clearAllTasksBtn');
    const resetAppBtn = document.getElementById('resetAppBtn');

    if (exportBtn) exportBtn.addEventListener('click', exportTasksJson);
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importTasksJson(e.target.files[0]);
          importInput.value = '';
        }
      });
    }
    if (clearAllBtn) clearAllBtn.addEventListener('click', promptClearAllTasks);
    if (resetAppBtn) resetAppBtn.addEventListener('click', promptResetApp);

    // Escape Key Modal Dismiss
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAddModal();
        closeEditModal();
        hideConfirmDialog();
      }
    });

    // Backdrop Click Dismiss
    [document.getElementById('addTaskModal'), document.getElementById('editTaskModal')].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('active');
        });
      }
    });
  }

  // ----------------------------------------------------------------------------
  // LIVE CLOCK
  // ----------------------------------------------------------------------------
  function startLiveClock() {
    function updateClock() {
      const now = new Date();
      const clockEl = document.getElementById('liveClockText');
      const dateEl = document.getElementById('liveDateText');

      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
      }

      if (dateEl) {
        dateEl.textContent = formatDateFriendly(now);
      }
    }

    updateClock();
    setInterval(updateClock, 1000);
  }

  // ----------------------------------------------------------------------------
  // INITIALIZATION
  // ----------------------------------------------------------------------------
  function initApp() {
    loadDataFromStorage();

    // Default dates on forms
    const todayStr = getTodayDateString();
    const dashDue = document.getElementById('dashTaskDueDate');
    if (dashDue) dashDue.value = todayStr;

    // Daily quote
    const quoteEl = document.getElementById('dailyQuote');
    if (quoteEl) {
      const idx = Math.floor(Math.random() * DAILY_QUOTES.length);
      quoteEl.textContent = DAILY_QUOTES[idx];
    }

    applyTheme(state.settings.theme || 'theme-dark');
    applySettingsToForm();
    setupEventListeners();
    startLiveClock();
    updatePomodoroDisplay();
    renderAllViews();
  }

  // ----------------------------------------------------------------------------
  // EXPOSE GLOBAL API
  // ----------------------------------------------------------------------------
  window.TaskNestApp = {
    toggleTask: toggleTaskStatus,
    openEditModal: openEditModal,
    deleteTask: promptDeleteTask,
    openAddModal: openAddModal,
    selectCalDate: selectCalDate,
    clearFilters: clearFilters
  };

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();

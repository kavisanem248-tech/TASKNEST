# TASKNEST – SMART TASK MANAGEMENT APP

> **"Organize Tasks. Stay Productive."**  
> Developed as part of **EdBytes Full Stack Development – TASK-FSD-02**

TASKNEST is a professional, modern productivity and task management web application built completely from scratch using **HTML5**, **CSS3**, and **pure Vanilla JavaScript**. It integrates a glassmorphic dashboard, full task CRUD capabilities, compound multi-filtering, a monthly calendar, an interactive Pomodoro Focus Timer, comprehensive analytics, and persistent browser storage via `localStorage`.

---

## 🌟 Key Features

### 1. Professional UI Design
- **Theme**: Dark Navy (`#0B1020`) and Purple gradient theme (`#8B5CF6` to `#3B82F6`) with glassmorphism cards and smooth transitions.
- **Light & Dark Mode**: One-click theme switcher that smoothly re-styles the entire interface and persists in `localStorage`.
- **Responsive Layout**: Tailored for Desktop, Tablet, and Mobile screens with an off-canvas collapsible sidebar drawer.
- **Typography & Icons**: Modern typography paired with inline SVG icons for instant offline rendering.

### 2. Dashboard Overview
- **Welcome Banner**: Personalized greeting, current live digital clock and date, and daily productivity quotes.
- **5 Dynamic Statistics Cards**:
  - **Total Tasks**: All tracked items.
  - **Completed Tasks**: Completed items with dynamic completion percentage.
  - **Pending Tasks**: Active items awaiting action.
  - **Overdue Tasks**: Tasks past their target deadline.
  - **Today's Tasks**: Tasks scheduled specifically for today.
- **Productivity Progress Bar**: Animated gradient bar tracking the overall completion ratio.
- **Quick Add Task Form**: Inline task creator directly on the dashboard.
- **Recent Urgent Tasks**: Quick-access preview of top urgent items with direct action buttons.

### 3. Complete Task Management (CRUD)
- **Add Task**: Title (required), description, category, priority, and due date.
- **Edit Task**: Dedicated modal allowing edits to all task attributes including status.
- **Delete Task**: Safe deletion protected by an in-app confirmation modal.
- **Complete & Undo**: Instant checkbox/button toggle with strikethrough styling and completed badge indicators.
- **Categories**: *College*, *Personal*, *Projects*, *Internship*, *Work*, *Other*.
- **Priority Levels**: *High* (Red), *Medium* (Orange), *Low* (Green).
- **Validation**: Strict prevention of empty or whitespace-only submissions with inline error alerts.

### 4. Search, Compound Filters & Sorting
- **Live Search**: Real-time search across task titles and descriptions.
- **Status Filters**: *All Tasks*, *Pending*, *Completed*, *Overdue*.
- **Category Filters**: *All Categories*, *College*, *Personal*, *Projects*, *Internship*, *Work*, *Other*.
- **Priority Filters**: *All Priorities*, *High*, *Medium*, *Low*.
- **Multi-Filter Support**: All filters work simultaneously (compound `AND` logic).
- **Sorting Options**:
  - Due Date (Earliest First)
  - Due Date (Latest First)
  - Recently Added
  - Priority (High to Low)
- **Clear Filters**: One-click reset for all active filters and search terms.

### 5. Interactive Monthly Calendar
- Month navigation (Previous, Next, and Today quick jump).
- Displays color-coded task indicator pills on days with scheduled tasks.
- Clicking any date displays all tasks due on that day in a side details panel.
- Direct "+ Add Task" shortcut pre-filling the selected date.

### 6. Pomodoro Focus Timer
- **Modes**:
  - Focus Session (25 minutes)
  - Short Break (5 minutes)
  - Long Break (15 minutes)
- **Controls**: Start, Pause, Resume, and Reset buttons.
- **Visual Progress**: Circular SVG progress ring tracking remaining time.
- **Session Tracking**: Automatic counter for completed focus sprints and total minutes focused.
- **Audio Chime**: Synthesized chime (Web Audio API) alerting upon session completion without external audio files.

### 7. Productivity Analytics
- **Radial Productivity Score**: SVG progress ring calculating performance based on completion velocity and timeliness.
- **Summary Cards**: Total created, completed, pending, and overdue.
- **Category Breakdown**: Task allocation progress bars by functional area.
- **Priority Breakdown**: Urgency distribution progress bars.
- **Daily Summary**: Snapshot of tasks due today vs. completed today.
- **Weekly Report**: 7-day completion velocity bar chart.

### 8. Settings & Data Management
- Customizable display name.
- Theme preference (Dark Navy / Light Mode).
- In-app toast notification toggle.
- **Export / Import**: Backup all tasks to a `.json` file or restore from a backup file.
- **Clear All Tasks**: Wipe all tasks with safety confirmation.
- **Reset Application**: Reset to default configuration with starter demo tasks.

---

## 📂 Folder Structure

```
INTERN/
│
├── index.html        # Main HTML5 application structure for TaskNest
├── style.css         # Modern glassmorphism stylesheet & themes
├── script.js         # Core task management, Pomodoro timer, calendar & analytics
├── README.md         # Project documentation and submission guide
└── FocusFlow/        # Advanced productivity manager workspace (preserved)
```

---

## 🛠️ Technologies Used

- **HTML5**: Semantic document structure, accessibility attributes, and modal dialogs.
- **CSS3**: Custom properties (variables), Flexbox, CSS Grid, animations, and glassmorphism.
- **Vanilla JavaScript (ES6+)**: Modular application state, DOM event listeners, Pomodoro interval timer, and Web Audio API synthesizer.
- **Browser LocalStorage**: Zero-backend persistent client storage.

---

## 🚀 How to Run

1. Clone or download this repository.
2. Open the project folder in your file explorer.
3. Open `index.html` in any web browser (Chrome, Edge, Firefox, Safari).
4. Start adding and managing your tasks!

---

## 🧪 Testing Checklist

- [x] **Add Task**: Validates title; adds task with priority, category, and date.
- [x] **Empty Input**: Rejects empty strings and spaces; displays inline alert.
- [x] **Edit Task**: Opens modal pre-populated; updates data on save.
- [x] **Delete Task**: Prompts confirmation; removes task from list and storage.
- [x] **Status Toggle**: Changes state between pending and completed; recalculates progress.
- [x] **Compound Filtering**: Status, category, and priority filters work simultaneously.
- [x] **Live Search**: Filters tasks dynamically as you type.
- [x] **Sorting**: Accurately sorts tasks by due date, creation date, or priority.
- [x] **Calendar View**: Renders days; shows task badges; date click filters tasks.
- [x] **Pomodoro Timer**: Accurately counts down; switches modes; triggers completion chime.
- [x] **Theme Switch**: Toggles between Dark Navy and Light Mode; persists across refresh.
- [x] **Analytics**: Accurately computes totals, completion rate, and chart bars.
- [x] **Data Persistence**: Refreshing the browser preserves all tasks and preferences.
- [x] **Responsive Layout**: Verified for mobile (375px), tablet (768px), and desktop.

---

## 📄 License & Attribution

Developed for **EdBytes Full Stack Development – TASK-FSD-02**. Open for educational and personal productivity use.

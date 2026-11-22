# FocusFlow – Smart Productivity Manager

> **"Plan Smart. Stay Focused. Achieve More."**

FocusFlow is a modern, responsive, and glassmorphic productivity dashboard designed to streamline task organization, deadline tracking, calendar scheduling, and performance analytics. Built with pure HTML5, CSS3, and Vanilla JavaScript, FocusFlow delivers a lightning-fast native web experience with zero external dependencies and persistent offline data storage via browser LocalStorage.

---

## 🌟 Key Highlights & Design

- **Aesthetic**: Premium Dark Navy Theme (`#0B1020`) with vibrant purple and blue gradient accents (`#8B5CF6`, `#3B82F6`), soft glowing shadows, and backdrop-filter glassmorphism cards.
- **Light / Dark Mode**: Full one-click theme switcher that smoothly re-themes every component and persists across browser refreshes.
- **Responsive Layout**: Fluid design tailored for 4K desktop, laptops, tablets, and mobile smartphones (with a collapsible off-canvas sidebar drawer and touch-friendly controls).
- **Zero Dependencies**: Pure Vanilla JS, semantic HTML5, and CSS3 custom properties—no build tools, Node.js, React, or third-party CSS libraries required.

---

## 📂 Folder Structure

```
FocusFlow/
│
├── index.html        # Semantic HTML5 single-page application structure
├── style.css         # Responsive glassmorphism CSS3 design system & themes
├── script.js         # Pure Vanilla JavaScript state, logic, filters & analytics
└── README.md         # Full project documentation, setup, and testing guide
```

---

## 🚀 Main Features

### 1. Modern Sidebar Navigation
- Fast switching between **Dashboard**, **My Tasks**, **Calendar**, **Analytics**, and **Settings**.
- Real-time pending task counter badge.
- Quick theme switcher button and user profile status indicator.
- Responsive mobile drawer with backdrop overlay and smooth slide-in transitions.

### 2. Comprehensive Dashboard
- **Welcome Hero Section**: Personalized greeting ("Welcome Back, [User]!"), live formatted current date, and inspiring daily productivity quotes.
- **Dynamic Metric Cards**:
  - **Total Tasks**: Total count of all managed items.
  - **Completed Tasks**: Completed count with real-time completion percentage.
  - **Pending Tasks**: Active tasks awaiting action.
  - **Overdue Tasks**: Immediate alert count for tasks past due.
- **Animated Progress Bar**: Visual completion percentage track with count breakdown.
- **Inline Quick Add Task Form**: Fast creation form directly on the dashboard.
- **Recent Urgent Tasks**: Interactive preview of the top 5 urgent tasks with instant toggle, edit, and delete actions.

### 3. "My Tasks" Management & Compound Filters
- **Interactive Task Cards**:
  - Priority indicators: High (Red), Medium (Orange), Low (Green).
  - Category tags: College, Projects, Internship, Personal, Other.
  - Smart due date tags: "Due Today", "Due Tomorrow", "Overdue (Date)", or short formatted date.
  - Completed state styling with strikethrough typography and subdued glassmorphism.
- **Search & Compound Filtering Engine**:
  - Live search bar searching across title and description simultaneously.
  - Status filters: *All Tasks*, *Pending*, *Completed*, *Overdue*.
  - Category filters: *All Categories*, *College*, *Projects*, *Internship*, *Personal*, *Other*.
  - Priority filters: *All Priorities*, *High*, *Medium*, *Low*.
  - All filters work simultaneously (AND logic).
  - One-click **"Clear Filters"** button.

### 4. Interactive Task Calendar
- Dynamically rendered month view with weekday headers (Sun–Sat).
- Previous Month, Next Month, and "Today" quick-jump buttons.
- Today date highlight ring.
- Color-coded indicator dots and task count badges on dates with scheduled items.
- Selecting any date displays a dedicated tasks panel for that specific day with complete/edit/delete options and a "+ Add Task" button pre-filled with the selected date.

### 5. Productivity Analytics Dashboard
- **Productivity Score**: Dynamic visual SVG radial ring calculator factoring completed vs. overdue tasks.
- **Summary Metrics**: Total created, completed, pending, and overdue.
- **Category Breakdown**: Task distribution across *College*, *Projects*, *Internship*, *Personal*, and *Other* with animated percentage bars.
- **Priority Breakdown**: High, Medium, and Low urgency distribution bars.
- **Dynamic Coaching Feedback**: Intelligent coaching messages based on your current task workload.

### 6. Settings, Customization & Data Management
- **Display Name**: Editable username displayed in greetings and headers.
- **Theme Selection**: Instant toggle between Dark Navy and Clean Light Mode.
- **Toast Notifications**: Toggle in-app notifications on or off.
- **Backup & Restore**: Export all tasks to a `.json` backup file or restore tasks from any backup file.
- **Clear All Tasks**: Permanently wipe all tasks with a safety confirmation modal.
- **Reset Application**: Restore default initial settings and starter tasks.

### 7. In-App Toast Notification System
- Non-blocking, stacked notifications for:
  - Task added successfully
  - Task updated successfully
  - Task deleted successfully
  - Task completed / marked pending
  - Form validation warnings
  - Backup and theme changes

---

## 💾 How LocalStorage Works

All application data is automatically serialized to JSON and stored directly in your browser's persistent `localStorage`.

### Stored Keys:
1. `focusflow_tasks`: Stores an array of task objects:
```json
[
  {
    "id": "task_1732270000000_a1b2c3",
    "title": "Complete AI Internship Report",
    "description": "Summarize sprint milestones and pull requests.",
    "category": "Internship",
    "priority": "High",
    "dueDate": "2026-11-22",
    "completed": false,
    "createdAt": "2026-11-22T10:00:00.000Z",
    "completedAt": null
  }
]
```
2. `focusflow_settings`: Stores user preferences:
```json
{
  "displayName": "Productive User",
  "theme": "theme-dark",
  "showToasts": true
}
```

### Safety & Persistence Guarantees:
- **Instant Save**: Every mutation (add, edit, toggle status, delete, clear) immediately triggers `saveTasksToStorage()`.
- **Safe Parsing**: Uses `try...catch` blocks to protect against corrupted storage or quota exceptions.
- **First-Run Seeding**: If `localStorage` is empty upon the first visit, the app seeds 5 realistic sample tasks across multiple categories and priorities so users can test the dashboard immediately.

---

## 🖥️ How to Run the Project

No web servers, Node.js packages, or compilers are needed!

### Option 1: Direct File Launch
Double click `FocusFlow/index.html` in your file explorer, or right-click and choose **Open with > Google Chrome** (or any modern browser: Firefox, Edge, Safari, Brave).

### Option 2: VS Code Live Server
1. Open the project folder in VS Code.
2. Right click `FocusFlow/index.html` and select **"Open with Live Server"**.
3. Access at `http://127.0.0.1:5500/FocusFlow/index.html`.

### Option 3: Python Built-In HTTP Server (Terminal)
```bash
# Navigate to the folder
cd FocusFlow

# Run Python 3 HTTP server
python -m http.server 8080
```
Open `http://localhost:8080` in your web browser.

---

## 🧪 Testing Performed

All 14 required test cases were executed and verified:

| # | Test Scenario | Steps Executed | Expected Result | Result |
|---|---|---|---|:---:|
| **TEST 1** | Add Normal Task | Filled title, description, category, priority, due date; clicked Add Task. | Task added, toast displayed, dashboard counters incremented. | **PASS** |
| **TEST 2** | Add Empty Task | Clicked Add Task with an empty title input. | Input highlighted in red, friendly validation message displayed, task not created. | **PASS** |
| **TEST 3** | Spaces-Only Input | Entered `"   "` as title and submitted. | String trimmed, validation rejected, no task created. | **PASS** |
| **TEST 4** | Add Multiple Tasks | Added 5 distinct tasks across College, Projects, Internship, Personal. | All tasks rendered correctly in list and dashboard. | **PASS** |
| **TEST 5** | Edit Existing Task | Opened edit modal for a task, changed title, priority, and date; saved. | Updated details reflected immediately across all views. | **PASS** |
| **TEST 6** | Mark Task Completed | Clicked the checkbox / complete action on a task. | Strikethrough style applied, completion rate and progress bar animated up. | **PASS** |
| **TEST 7** | Delete Task | Clicked delete icon; confirmed modal dialog. | Task removed from array and LocalStorage; toast notification shown. | **PASS** |
| **TEST 8** | Refresh Browser | Refreshed browser tab with F5. | All tasks, completed statuses, and user settings remained intact. | **PASS** |
| **TEST 9** | Search for a Task | Typed search keywords into the search box on My Tasks view. | Live filtering updated results instantly matching title or description. | **PASS** |
| **TEST 10** | Compound Filtering | Selected Status: "Pending" + Priority: "High" + Category: "Internship". | Displayed only tasks satisfying all 3 filters simultaneously. | **PASS** |
| **TEST 11** | Calendar View | Navigated to Calendar page; navigated months and clicked dates with tasks. | Calendar highlighted today; dates showed badge indicators; side panel listed tasks for that day. | **PASS** |
| **TEST 12** | Analytics Calculations | Checked analytics metrics against active tasks. | Total, Completed, Pending, Overdue, category bars, and priority bars calculated accurately. | **PASS** |
| **TEST 13** | Switch Theme | Toggled between Dark Navy and Light Mode; refreshed page. | Theme applied immediately; persisted in LocalStorage upon browser reload. | **PASS** |
| **TEST 14** | Mobile Responsiveness | Tested at 375px, 480px, 768px, and 1024px viewport widths. | Sidebar collapsed to hamburger menu; cards stacked cleanly; zero horizontal scrollbar. | **PASS** |

---

## 📄 License & Credits
Designed and developed for **FocusFlow – Smart Productivity Manager**. Free for educational and commercial productivity use.

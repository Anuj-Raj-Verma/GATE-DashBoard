/* ===============================================================================================
                                    GATE DASHBOARD - MAIN SCRIPT
                         Comprehensive exam preparation tracking system
   =============================================================================================== */

/* ================= GLOBAL CONSTANTS & DATE UTILITIES ================= */

const MS_PER_DAY = 1000 * 60 * 60 * 24; // Milliseconds in a day

/* Helper: Get today's date at midnight (local timezone) */
function getTodayMidnight() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/* Helper: Format date as YYYY-MM-DD string for localStorage keys */
function getLocalDateKey() {
    const d = getTodayMidnight();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
}

const today = getTodayMidnight();
const todayKey = getLocalDateKey();

/* ================= GATE PREPARATION PROGRESS TRACKER ================= */
/* Purpose: Calculate days left and progress percentage until exam
   Exam Date: February 10, 2028
   Start Date: February 1, 2026 */

const startDate = new Date(2026, 1, 1);   // Feb 1, 2026 (Months are 0-based)
const endDate   = new Date(2028, 1, 10);  // Feb 10, 2028

const totalDays = Math.round((endDate - startDate) / MS_PER_DAY);

let passedDays;
if (today < startDate) {
    passedDays = 0;
} else if (today > endDate) {
    passedDays = totalDays;
} else {
    passedDays = Math.round((today - startDate) / MS_PER_DAY);
}

const daysLeft = totalDays - passedDays;
const progress = Math.round((passedDays / totalDays) * 100);

// Update UI with progress information
document.getElementById("daysLeft").textContent = daysLeft;
document.getElementById("progressPercent").textContent = progress;
document.getElementById("timeProgress").style.width = progress + "%";

/* ================= TODAY'S FOCUS: DAILY TASK MANAGEMENT ================= */
/* Purpose: Manage daily tasks (max 3 per day)
   Features: Auto-reset at midnight, localStorage persistence
   Related HTML elements: taskList, taskInput, addTaskBtn, taskInfo */

const taskList   = document.getElementById("taskList");
const taskInput  = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskInfo   = document.getElementById("taskInfo");

/* Load today's tasks or create new daily entry */
let dailyData = JSON.parse(localStorage.getItem("dailyTasks")) || {
    date: todayKey,
    tasks: []
};

// Auto-reset daily data if date changed
if (dailyData.date !== todayKey) {
    dailyData = { date: todayKey, tasks: [] };
    localStorage.setItem("dailyTasks", JSON.stringify(dailyData));
}

/* Render task list on UI */
function renderTasks() {
    taskList.innerHTML = "";
    dailyData.tasks.forEach(t => {
        const li = document.createElement("li");
        li.textContent = "• " + t;
        taskList.appendChild(li);
    });
    taskInfo.textContent = `${dailyData.tasks.length} / 3 tasks set for today`;
}

/* Add new task (max 3 per day) */
addTaskBtn.addEventListener("click", () => {
    const task = taskInput.value.trim();
    if (!task) return;

    if (dailyData.tasks.length >= 3) {
        alert("Only 3 tasks allowed per day.");
        return;
    }

    dailyData.tasks.push(task);
    localStorage.setItem("dailyTasks", JSON.stringify(dailyData));
    taskInput.value = "";
    renderTasks();
});

// Initial render
renderTasks();

/* ================= WEEKLY WEAK AREAS TRACKER ================= */
/* Purpose: Identify and track weak topics across the week
   Features: Auto-reset every Sunday, age-based warnings (3+ days = warning, 5+ days = critical)
   Max: 5 weak areas per week
   Related HTML elements: weakList, weakInput, addWeakBtn, weakStatus */

const weakList   = document.getElementById("weakList");
const weakInput  = document.getElementById("weakInput");
const addWeakBtn = document.getElementById("addWeakBtn");
const weakStatus = document.getElementById("weakStatus");

/* Helper: Get the start of current week (Sunday) */
function getWeekStart(date) {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/* Load this week's weak areas or create new week entry */
let weakData = JSON.parse(localStorage.getItem("weeklyWeak")) || {
    weekStart: getWeekStart(today).getTime(),
    topics: []
};

// Auto-reset weak data if new week started
if (weakData.weekStart !== getWeekStart(today).getTime()) {
    weakData = {
        weekStart: getWeekStart(today).getTime(),
        topics: []
    };
    localStorage.setItem("weeklyWeak", JSON.stringify(weakData));
}

/* Helper: Calculate days passed in current week */
function daysPassedInWeek() {
    return Math.floor((today - new Date(weakData.weekStart)) / MS_PER_DAY);
}

/* Render weak areas with age-based color coding */
function renderWeakAreas() {
    weakList.innerHTML = "";
    weakData.topics.forEach(item => {
        const li = document.createElement("li");
        const age = Math.floor((today - new Date(item.addedOn)) / MS_PER_DAY);

        li.textContent = "• " + item.text;

        // Color coding: 5+ days = critical (red), 3+ days = warning (orange)
        if (age >= 5) {
            li.classList.add("weak-critical");
        } else if (age >= 3) {
            li.classList.add("weak-warning");
        }

        weakList.appendChild(li);
    });

    const weeklyWeakCard = document.querySelector(".weekly-weak");

    // Remove previous status classes
    weeklyWeakCard.classList.remove("weak-safe", "weak-warning", "weak-critical");

    // Only apply color coding and alerts if there are weak areas in the list
    if (weakData.topics.length > 0) {
        // Calculate and display days remaining
        const daysLeft = 7 - daysPassedInWeek();

        // Apply color-coded class based on days remaining until Sunday
        if (daysLeft >= 5) {
            weeklyWeakCard.classList.add("weak-safe"); // Green: 5-6 days
        } else if (daysLeft >= 3) {
            weeklyWeakCard.classList.add("weak-warning"); // Orange: 3-4 days
        } else if (daysLeft >= 1) {
            weeklyWeakCard.classList.add("weak-critical"); // Red: 1-2 days
        }

        // Display status with color coding
        if (daysLeft > 1) {
            weakStatus.textContent = `${daysLeft} days left to fix weak areas`;
        } else if (daysLeft === 1) {
            weakStatus.innerHTML = `<strong style="color: #ef4444;">⚠ Only 1 day left to complete weak topics</strong>`;
            // Show alert if it's the last day
            setTimeout(() => {
                alert("🚨 ALERT: Only 1 day left to fix weak areas! Work on them today!");
            }, 800);
        } else {
            weakStatus.textContent = "Week over. Add new weak areas.";
        }
    } else {
        // No weak areas in list
        weakStatus.textContent = "No weak areas identified yet.";
    }
}

/* Add new weak area (max 5 per week) */
addWeakBtn.addEventListener("click", () => {
    const topic = weakInput.value.trim();
    if (!topic) return;

    if (weakData.topics.length >= 5) {
        alert("Maximum 5 weak areas per week.");
        return;
    }

    weakData.topics.push({
        text: topic,
        addedOn: todayKey
    });

    localStorage.setItem("weeklyWeak", JSON.stringify(weakData));
    weakInput.value = "";
    renderWeakAreas();
});

// Initial render
renderWeakAreas();

/* ================= REVISION LOG: TRACK COMPLETED REVISIONS ================= */
/* Purpose: Keep record of all revision sessions
   Features: Stores last 5 revisions with dates, unlimited total history
   Related HTML elements: revisionList, revisionInput, addRevisionBtn, clearRevisionBtn, revisionStatus */

const revisionList     = document.getElementById("revisionList");
const revisionInput    = document.getElementById("revisionInput");
const addRevisionBtn   = document.getElementById("addRevisionBtn");
const clearRevisionBtn = document.getElementById("clearRevisionBtn");
const revisionStatus   = document.getElementById("revisionStatus");

let revisionData = JSON.parse(localStorage.getItem("revisionLog")) || [];

/* Render last 5 revisions in reverse chronological order */
function renderRevisions() {
    revisionList.innerHTML = "";

    revisionData.slice(-5).reverse().forEach(e => {
        const li = document.createElement("li");
        li.textContent = `✓ ${e.topic} — ${e.date}`;
        revisionList.appendChild(li);
    });

    revisionStatus.textContent =
        revisionData.length === 0
            ? "No revisions logged yet."
            : `Total revisions logged: ${revisionData.length}`;
}

/* Add new revision entry */
addRevisionBtn.addEventListener("click", () => {
    const topic = revisionInput.value.trim();
    if (!topic) return;

    revisionData.push({ topic, date: todayKey });
    localStorage.setItem("revisionLog", JSON.stringify(revisionData));
    revisionInput.value = "";
    renderRevisions();
});

/* Clear entire revision history (with confirmation) */
clearRevisionBtn.addEventListener("click", () => {
    if (!confirm("Clear entire revision log?")) return;
    revisionData = [];
    localStorage.removeItem("revisionLog");
    renderRevisions();
});

// Initial render
renderRevisions();

/* ================= MOCK TEST ANALYSIS TRACKER ================= */
/* Purpose: Track performance metrics from mock exams
   Metrics: Score, Accuracy percentage, Common mistakes, Improvement fixes
   Warning: Alerts if no mock analysis in last 7 days
   Related HTML elements: mockScore, mockAccuracy, mockMistakes, mockFixes, saveMockBtn, mockStatus */

const mockScore    = document.getElementById("mockScore");
const mockAccuracy = document.getElementById("mockAccuracy");
const mockMistakes = document.getElementById("mockMistakes");
const mockFixes    = document.getElementById("mockFixes");
const saveMockBtn  = document.getElementById("saveMockBtn");
const mockStatus   = document.getElementById("mockStatus");

let mockData = JSON.parse(localStorage.getItem("lastMock"));

/* Render saved mock analysis data */
function renderMock() {
    if (!mockData) {
        mockStatus.textContent = "No mock analysis saved yet.";
        return;
    }

    mockScore.value    = mockData.score;
    mockAccuracy.value = mockData.accuracy;
    mockMistakes.value = mockData.mistakes;
    mockFixes.value    = mockData.fixes;

    const gap = Math.floor((today - new Date(mockData.date)) / MS_PER_DAY);

    mockStatus.textContent =
        gap >= 7
            ? "⚠ No mock analyzed in the last 7 days."
            : `Last analyzed on ${mockData.date}`;
}

/* Save new mock analysis */
saveMockBtn.addEventListener("click", () => {
    if (!mockScore.value || !mockAccuracy.value) {
        alert("Score and accuracy are mandatory.");
        return;
    }

    mockData = {
        score: mockScore.value,
        accuracy: mockAccuracy.value,
        mistakes: mockMistakes.value.trim(),
        fixes: mockFixes.value.trim(),
        date: todayKey
    };

    localStorage.setItem("lastMock", JSON.stringify(mockData));
    renderMock();
});

// Initial render
renderMock();

/* ================= MISTAKE LOG: COLLECT LEARNING POINTS ================= */
/* Purpose: Maintain a growing list of mistakes for future reference
   Features: Unlimited entries, no auto-reset
   Related HTML elements: mistakeList, mistakeInput, addMistakeBtn */

const mistakeList   = document.getElementById("mistakeList");
const mistakeInput  = document.getElementById("mistakeInput");
const addMistakeBtn = document.getElementById("addMistakeBtn");

let mistakes = JSON.parse(localStorage.getItem("mistakes")) || [];

/* Render all logged mistakes */
function renderMistakes() {
    mistakeList.innerHTML = "";
    mistakes.forEach(m => {
        const li = document.createElement("li");
        li.textContent = "• " + m;
        mistakeList.appendChild(li);
    });
}

/* Add new mistake entry */
addMistakeBtn.addEventListener("click", () => {
    const m = mistakeInput.value.trim();
    if (!m) return;

    mistakes.push(m);
    localStorage.setItem("mistakes", JSON.stringify(mistakes));
    mistakeInput.value = "";
    renderMistakes();
});

// Initial render
renderMistakes();

/* ================= FOOTER DATE UPDATE ================= */
/* Purpose: Display current date in footer for reference */

document.getElementById("lastUpdated").textContent = todayKey;

/* ================= DARK MODE SYSTEM: HUMAN-RESPECTING THEME SWITCHER ================= */
/* Purpose: Auto/Manual theme selection based on time of day or user preference
   Features: Auto mode (dark 7pm-6am), Manual toggle, Persistent preference
   Related HTML elements: themeToggle */

const themeToggle = document.getElementById("themeToggle");
const THEME_KEY = "gate-theme"; // Stored values: "light" | "dark" | "auto"

/* Apply theme to UI */
function applyTheme(mode) {
    if (mode === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "☀️"; // Sun icon = light mode available
    } else {
        document.body.classList.remove("dark");
        themeToggle.textContent = "🌙"; // Moon icon = dark mode available
    }
}

/* Auto theme based on current time (7pm - 6am = dark) */
function autoThemeByTime() {
    const hour = new Date().getHours();
    return (hour >= 19 || hour < 6) ? "dark" : "light";
}

// Load saved theme preference
let savedTheme = localStorage.getItem(THEME_KEY);

if (!savedTheme) {
    savedTheme = "auto";
    localStorage.setItem(THEME_KEY, "auto");
}

// Apply saved or auto theme
if (savedTheme === "auto") {
    applyTheme(autoThemeByTime());
} else {
    applyTheme(savedTheme);
}

/* Manual theme toggle */
themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
});

/* Auto-update theme every 5 minutes (only if auto mode enabled) */
setInterval(() => {
    if (localStorage.getItem(THEME_KEY) === "auto") {
        applyTheme(autoThemeByTime());
    }
}, 5 * 60 * 1000);



/* ================= DAILY OUTPUT ENGINE: PLANNED VS EXECUTED TASKS ================= */
/* Purpose: Track which planned tasks were actually completed each day
   Features: Separate from dailyTasks (which stores plan), auto-reset at midnight
   Related HTML elements: outputList, outputStats */

const outputList  = document.getElementById("outputList");
const outputStats = document.getElementById("outputStats");

/* Separate execution log from daily task plan */
let executionLog = JSON.parse(localStorage.getItem("executionLog")) || {
    date: todayKey,
    completed: {}
};

// Auto-reset execution log at midnight
if (executionLog.date !== todayKey) {
    executionLog = { date: todayKey, completed: {} };
    localStorage.setItem("executionLog", JSON.stringify(executionLog));
}

/* Render output: show plan vs execution */
function renderOutput() {
    outputList.innerHTML = "";

    const tasks = dailyData.tasks;
    let completedCount = 0;

    tasks.forEach(task => {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!executionLog.completed[task];

        const label = document.createElement("span");
        label.textContent = task;

        if (checkbox.checked) {
            label.classList.add("done");
            completedCount++;
        }

        /* Toggle task completion */
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                executionLog.completed[task] = {
                    time: new Date().toLocaleTimeString()
                };
            } else {
                delete executionLog.completed[task];
            }

            localStorage.setItem("executionLog", JSON.stringify(executionLog));
            renderOutput();
            updateFocusStrip(); // Update color when completion status changes
        });

        li.appendChild(checkbox);
        li.appendChild(label);
        outputList.appendChild(li);
    });

    // Display plan vs execution summary
    outputStats.textContent =
        `Planned: ${tasks.length} | Executed: ${completedCount}`;
}

// Initial render
renderOutput();



/* ================= ANTI-PROCRASTINATION LOCK SYSTEM ================= */
/* Purpose: Motivational enforcement
   Rule A: Morning lock if no tasks set by 10am (prevent lazy mornings)
   Rule B: Read-only mode after midnight (reflect on day's work)
   Related HTML elements: lockOverlay */

const lockOverlay = document.getElementById("lockOverlay");

/* Check if current time is past midnight (00:00) */
function isAfterMidnight() {
    const now = new Date();
    return now.getHours() === 0 && now.getMinutes() >= 0;
}

/* Check if current time is 10am or later */
function isAfterTenAM() {
    const now = new Date();
    return now.getHours() >= 10;
}

/* ---- Rule B: Read-only mode after midnight (force reflection) ---- */
if (isAfterMidnight()) {
    document.body.classList.add("read-only");
    document.querySelectorAll("input, textarea, button").forEach(el => {
        el.disabled = true;
    });
}

/* ---- Rule A: Morning lock enforcement (10am with no tasks set) ---- */
function checkMorningLock() {
    if (isAfterTenAM() && dailyData.tasks.length === 0) {
        lockOverlay.style.display = "flex";
    } else {
        lockOverlay.style.display = "none";
    }
}

// Uncomment to enable morning lock enforcement
// checkMorningLock();
// addTaskBtn.addEventListener("click", () => {
//     setTimeout(checkMorningLock, 100);
// });


/* ================= BACK TO TOP SCROLL BUTTON ================= */
/* Purpose: Quick navigation to top of page for long content
   Features: Auto-shows when scrolled > 800px, smooth scroll animation
   Related HTML elements: backToTop */

const backToTopBtn = document.getElementById("backToTop");

/* Show/hide back-to-top button based on scroll position */
window.addEventListener("scroll", () => {
    if (window.scrollY > 800) {
        backToTopBtn.classList.add("show");
    } else {
        backToTopBtn.classList.remove("show");
    }
});

/* Scroll to top with smooth animation */
backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});



/* ================= TODAY VISUAL MARKER & FOCUS STRIP ================= */
/* Purpose: Highlight today's focus section and track daily progress visually
   Features: Color-coded status, real-time updates based on task completion
   Status states: idle (no tasks) → planned → progress → complete
   Related HTML elements: focusStrip */

const todayFocusSection = document.querySelector(".today-focus");

/* Mark today's focus section with special styling */
if (todayFocusSection) {
    todayFocusSection.classList.add("today-marker");
}

const focusStrip = document.getElementById("focusStrip");

/* Update focus strip color based on daily completion status */
function updateFocusStrip() {
    const total = dailyData.tasks.length;
    const done = Object.keys(executionLog.completed).length;

    // Ensure the element has the base class
    focusStrip.className = "focus-strip";

    // No tasks planned = idle (gray)
    if (total === 0) {
        focusStrip.classList.add("focus-idle");
        return;
    }

    // Tasks planned but none started = planned (blue)
    if (done === 0) {
        focusStrip.classList.add("focus-planned");
        return;
    }

    // Some tasks completed = in progress (orange)
    if (done < total) {
        focusStrip.classList.add("focus-progress");
        return;
    }

    // All tasks completed = complete (green)
    focusStrip.classList.add("focus-complete");
}

// Initial render
updateFocusStrip();

// Update whenever tasks change
addTaskBtn.addEventListener("click", () => {
    setTimeout(updateFocusStrip, 50);
});


/* ================= MOBILE NAVIGATION TOGGLE ================= */
/* Purpose: Handle mobile menu toggle for responsive navigation
   Features: Toggle nav-links visibility on small screens
   Related HTML elements: menuToggle, navLinks */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");
    });
}

/* ================= END OF SCRIPT ================= */
/* All modules loaded and initialized. Application ready. */










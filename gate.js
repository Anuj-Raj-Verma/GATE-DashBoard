/* ======================================================
   CONSTANTS
====================================================== */
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/* ======================================================
   LOCAL DATE HELPERS (MIDNIGHT ONLY)
====================================================== */
function getTodayMidnight() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getLocalDateKey() {
    const d = getTodayMidnight();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
}

const today = getTodayMidnight();
const todayKey = getLocalDateKey();

/* ======================================================
   GATE PREPARATION PROGRESS (FINAL FIX)
====================================================== */
// Months are 0-based
const startDate = new Date(2026, 1, 1);   // Feb 1, 2026
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

document.getElementById("daysLeft").textContent = daysLeft;
document.getElementById("progressPercent").textContent = progress;
document.getElementById("timeProgress").style.width = progress + "%";

/* ======================================================
   TODAY'S FOCUS (DAILY RESET)
====================================================== */
const taskList   = document.getElementById("taskList");
const taskInput  = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskInfo   = document.getElementById("taskInfo");

let dailyData = JSON.parse(localStorage.getItem("dailyTasks")) || {
    date: todayKey,
    tasks: []
};

if (dailyData.date !== todayKey) {
    dailyData = { date: todayKey, tasks: [] };
    localStorage.setItem("dailyTasks", JSON.stringify(dailyData));
}

function renderTasks() {
    taskList.innerHTML = "";
    dailyData.tasks.forEach(t => {
        const li = document.createElement("li");
        li.textContent = "• " + t;
        taskList.appendChild(li);
    });
    taskInfo.textContent = `${dailyData.tasks.length} / 3 tasks set for today`;
}

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

renderTasks();

/* ======================================================
   WEEKLY WEAK AREAS (RESET ON SUNDAY)
====================================================== */
function getWeekStart(date) {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const weakList   = document.getElementById("weakList");
const weakInput  = document.getElementById("weakInput");
const addWeakBtn = document.getElementById("addWeakBtn");
const weakStatus = document.getElementById("weakStatus");

let weakData = JSON.parse(localStorage.getItem("weeklyWeak")) || {
    weekStart: getWeekStart(today).getTime(),
    topics: []
};

if (weakData.weekStart !== getWeekStart(today).getTime()) {
    weakData = {
        weekStart: getWeekStart(today).getTime(),
        topics: []
    };
    localStorage.setItem("weeklyWeak", JSON.stringify(weakData));
}

function daysPassedInWeek() {
    return Math.floor(
        (today - new Date(weakData.weekStart)) / MS_PER_DAY
    );
}

function renderWeakAreas() {
    weakList.innerHTML = "";
    weakData.topics.forEach(item => {
    const li = document.createElement("li");

    const age =
        Math.floor(
            (today - new Date(item.addedOn)) / MS_PER_DAY
        );

    li.textContent = "• " + item.text;

    if (age >= 5) {
        li.classList.add("weak-critical");
    } else if (age >= 3) {
        li.classList.add("weak-warning");
    }

    weakList.appendChild(li);
});


    const remaining = 7 - daysPassedInWeek();

    if (remaining > 1) {
        weakStatus.textContent = `${remaining} days left to fix weak areas`;
    } else if (remaining === 1) {
        weakStatus.textContent = "⚠ Only 1 day left to complete weak topics";
    } else {
        weakStatus.textContent = "Week over. Add new weak areas.";
    }
}

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

renderWeakAreas();

/* ======================================================
   REVISION LOG (LAST 5 + CLEAR)
====================================================== */
const revisionList     = document.getElementById("revisionList");
const revisionInput    = document.getElementById("revisionInput");
const addRevisionBtn   = document.getElementById("addRevisionBtn");
const clearRevisionBtn = document.getElementById("clearRevisionBtn");
const revisionStatus   = document.getElementById("revisionStatus");

let revisionData = JSON.parse(localStorage.getItem("revisionLog")) || [];

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

addRevisionBtn.addEventListener("click", () => {
    const topic = revisionInput.value.trim();
    if (!topic) return;

    revisionData.push({ topic, date: todayKey });
    localStorage.setItem("revisionLog", JSON.stringify(revisionData));
    revisionInput.value = "";
    renderRevisions();
});

clearRevisionBtn.addEventListener("click", () => {
    if (!confirm("Clear entire revision log?")) return;
    revisionData = [];
    localStorage.removeItem("revisionLog");
    renderRevisions();
});

renderRevisions();

/* ======================================================
   MOCK ANALYSIS
====================================================== */
const mockScore    = document.getElementById("mockScore");
const mockAccuracy = document.getElementById("mockAccuracy");
const mockMistakes = document.getElementById("mockMistakes");
const mockFixes    = document.getElementById("mockFixes");
const saveMockBtn  = document.getElementById("saveMockBtn");
const mockStatus   = document.getElementById("mockStatus");

let mockData = JSON.parse(localStorage.getItem("lastMock"));

function renderMock() {
    if (!mockData) {
        mockStatus.textContent = "No mock analysis saved yet.";
        return;
    }

    mockScore.value    = mockData.score;
    mockAccuracy.value = mockData.accuracy;
    mockMistakes.value = mockData.mistakes;
    mockFixes.value    = mockData.fixes;

    const gap = Math.floor(
        (today - new Date(mockData.date)) / MS_PER_DAY
    );

    mockStatus.textContent =
        gap >= 7
            ? "⚠ No mock analyzed in the last 7 days."
            : `Last analyzed on ${mockData.date}`;
}

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

renderMock();

/* ======================================================
   MISTAKE LOG
====================================================== */
const mistakeList   = document.getElementById("mistakeList");
const mistakeInput  = document.getElementById("mistakeInput");
const addMistakeBtn = document.getElementById("addMistakeBtn");

let mistakes = JSON.parse(localStorage.getItem("mistakes")) || [];

function renderMistakes() {
    mistakeList.innerHTML = "";
    mistakes.forEach(m => {
        const li = document.createElement("li");
        li.textContent = "• " + m;
        mistakeList.appendChild(li);
    });
}

addMistakeBtn.addEventListener("click", () => {
    const m = mistakeInput.value.trim();
    if (!m) return;

    mistakes.push(m);
    localStorage.setItem("mistakes", JSON.stringify(mistakes));
    mistakeInput.value = "";
    renderMistakes();
});

renderMistakes();

/* ======================================================
   FOOTER DATE
====================================================== */
document.getElementById("lastUpdated").textContent = todayKey;



/* =====================   New Changes   ======================== */

/* ======================================================
   DARK MODE (HUMAN-RESPECTING)
====================================================== */
const themeToggle = document.getElementById("themeToggle");
const THEME_KEY = "gate-theme"; // "light" | "dark" | "auto"

function applyTheme(mode) {
    if (mode === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "☀️";
    } else {
        document.body.classList.remove("dark");
        themeToggle.textContent = "🌙";
    }
}

function autoThemeByTime() {
    const hour = new Date().getHours();
    return (hour >= 19 || hour < 6) ? "dark" : "light";
}

// Load saved preference
let savedTheme = localStorage.getItem(THEME_KEY);

if (!savedTheme) {
    savedTheme = "auto";
    localStorage.setItem(THEME_KEY, "auto");
}

if (savedTheme === "auto") {
    applyTheme(autoThemeByTime());
} else {
    applyTheme(savedTheme);
}

// Manual toggle overrides auto
themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
});

// Auto update theme every 5 minutes (if auto)
setInterval(() => {
    if (localStorage.getItem(THEME_KEY) === "auto") {
        applyTheme(autoThemeByTime());
    }
}, 5 * 60 * 1000);





/*================    Part 3    ===============*/

/* ======================================================
   DAILY OUTPUT ENGINE (PLANNED vs EXECUTED)
====================================================== */

const outputList  = document.getElementById("outputList");
const outputStats = document.getElementById("outputStats");

// separate execution log (do NOT mix with tasks)
let executionLog = JSON.parse(localStorage.getItem("executionLog")) || {
    date: todayKey,
    completed: {}
};

// reset at midnight
if (executionLog.date !== todayKey) {
    executionLog = { date: todayKey, completed: {} };
    localStorage.setItem("executionLog", JSON.stringify(executionLog));
}

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

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                executionLog.completed[task] = {
                    time: new Date().toLocaleTimeString()
                };
            } else {
                delete executionLog.completed[task];
            }

            localStorage.setItem(
                "executionLog",
                JSON.stringify(executionLog)
            );

            renderOutput();
        });

        li.appendChild(checkbox);
        li.appendChild(label);
        outputList.appendChild(li);
    });

    outputStats.textContent =
        `Planned: ${tasks.length} | Executed: ${completedCount}`;
}

// keep output synced with tasks
renderOutput();




/*====================PART 4=================== */

/* ======================================================
   ANTI-PROCRASTINATION LOCK
====================================================== */

const lockOverlay = document.getElementById("lockOverlay");

function isAfterMidnight() {
    const now = new Date();
    return now.getHours() === 0 && now.getMinutes() >= 0;
}

function isAfterTenAM() {
    const now = new Date();
    return now.getHours() >= 10;
}

/* -------- Rule B: Read-only after midnight -------- */
if (isAfterMidnight()) {
    document.body.classList.add("read-only");

    document.querySelectorAll("input, textarea, button").forEach(el => {
        el.disabled = true;
    });
}

/* -------- Rule A: No task by 10 AM -------- */
function checkMorningLock() {
    if (isAfterTenAM() && dailyData.tasks.length === 0) {
        lockOverlay.style.display = "flex";
    } else {
        lockOverlay.style.display = "none";
    }
}

// checkMorningLock();

/* Recheck when a task is added */
// addTaskBtn.addEventListener("click", () => {
//     setTimeout(checkMorningLock, 100);
// });


/*********         SCROLL BUTTON         ************ */
/* ================= BACK TO TOP ================= */

const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
    if (window.scrollY > 800) {
        backToTopBtn.classList.add("show");
    } else {
        backToTopBtn.classList.remove("show");
    }
});

backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});



/* ======================================================
   TODAY VISUAL MARKER
====================================================== */

const todayFocusSection = document.querySelector(".today-focus");

// Always mark Today's Focus as active for today
if (todayFocusSection) {
    todayFocusSection.classList.add("today-marker");
}


const focusStrip = document.getElementById("focusStrip");

function updateFocusStrip() {
    const total = dailyData.tasks.length;
    const done = Object.keys(executionLog.completed).length;

    focusStrip.className = "";

    if (total === 0) {
        focusStrip.classList.add("focus-idle");
        return;
    }

    if (done === 0) {
        focusStrip.classList.add("focus-planned");
        return;
    }

    if (done < total) {
        focusStrip.classList.add("focus-progress");
        return;
    }

    focusStrip.classList.add("focus-complete");
}

// call whenever state changes
updateFocusStrip();

// hook into existing updates
addTaskBtn.addEventListener("click", () => {
    setTimeout(updateFocusStrip, 50);
});



/* ================= MOBILE NAV TOGGLE ================= */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}










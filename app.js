console.log("Meridian is running");

// ---- DATA ----
const events = [
  { date: "2026-05-26", time: "09:00", title: "AP Chemistry", subtask: "Lab quiz", color: "pink" },
  { date: "2026-05-26", time: "10:00", title: "AP Calculus BC", subtask: "6.7 video + notes", color: "lavender" },
  { date: "2026-05-26", time: "12:00", title: "British Literature", subtask: "Presentation 01/16", color: "peach" },
  { date: "2026-05-26", time: "16:00", title: "Swim Practice", subtask: "", color: "mint" },
  { date: "2026-05-28", time: "09:00", title: "Math Test", subtask: "", color: "lavender" },
  { date: "2026-05-30", time: "14:00", title: "Swim Meet", subtask: "", color: "mint" }
];

// ---- HOME SCHEDULE ----
const startHour = 0;
const endHour = 24;
const totalHours = endHour - startHour;

const scheduleDiv = document.getElementById("schedule");
const scheduleWrapper = document.createElement("div");
scheduleWrapper.className = "schedule-wrapper";
const scheduleInner = document.createElement("div");
scheduleInner.className = "schedule-inner";
scheduleWrapper.appendChild(scheduleInner);
scheduleDiv.appendChild(scheduleWrapper);

for (let h = startHour; h <= endHour; h++) {
  const topPercent = ((h - startHour) / totalHours) * 100;
  const hourLine = document.createElement("div");
  hourLine.style.position = "absolute";
  hourLine.style.top = topPercent + "%";
  hourLine.style.left = "0";
  hourLine.style.right = "0";
  hourLine.style.display = "flex";
  hourLine.style.alignItems = "center";
  hourLine.style.gap = "8px";
  hourLine.innerHTML = `
    <span style="font-size:10px; color:#b080a0; font-weight:600; min-width:36px;">${h}:00</span>
    <div style="flex:1; height:0.5px; background:#e8c9e0;"></div>
  `;
  scheduleInner.appendChild(hourLine);

  if (h < endHour) {
    const halfLine = document.createElement("div");
    const halfPercent = ((h - startHour + 0.5) / totalHours) * 100;
    halfLine.style.position = "absolute";
    halfLine.style.top = halfPercent + "%";
    halfLine.style.left = "44px";
    halfLine.style.right = "0";
    halfLine.style.height = "0.5px";
    halfLine.style.background = "#f0d5e8";
    scheduleInner.appendChild(halfLine);
  }
}

const todayStr = new Date().toISOString().split("T")[0];

events.filter(e => e.date === todayStr).forEach(function(event) {
  const hour = parseInt(event.time.split(":")[0]);
  const topPercent = ((hour - startHour) / totalHours) * 100;
  const block = document.createElement("div");
  block.className = "schedule-block";
  block.style.top = topPercent + "%";
  block.innerHTML = `
    <div class="event-card ${event.color}">
      ${event.title}
      ${event.subtask ? `<div class="event-subtask">• ${event.subtask}</div>` : ""}
    </div>
  `;
  scheduleInner.appendChild(block);
});

function drawCurrentTimeLine() {
  const existing = document.getElementById("time-line");
  if (existing) existing.remove();
  const now = new Date();
  const currentDecimalHour = now.getHours() + now.getMinutes() / 60;
  const topPercent = ((currentDecimalHour - startHour) / totalHours) * 100;
  const timeLine = document.createElement("div");
  timeLine.id = "time-line";
  timeLine.style.position = "absolute";
  timeLine.style.top = topPercent + "%";
  timeLine.style.left = "36px";
  timeLine.style.right = "0";
  timeLine.style.height = "2px";
  timeLine.style.background = "#c45c8a";
  timeLine.style.zIndex = "10";
  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.left = "-4px";
  dot.style.top = "-3px";
  dot.style.width = "8px";
  dot.style.height = "8px";
  dot.style.borderRadius = "50%";
  dot.style.background = "#c45c8a";
  timeLine.appendChild(dot);
  scheduleInner.appendChild(timeLine);
  const wrapperHeight = scheduleWrapper.clientHeight;
  const innerHeight = scheduleInner.clientHeight;
  const scrollTarget = (topPercent / 100) * innerHeight - wrapperHeight / 2;
  scheduleWrapper.scrollTop = Math.max(0, scrollTarget);
}

drawCurrentTimeLine();
setInterval(drawCurrentTimeLine, 60000);

// ---- HOME DATE ----
const now = new Date();
document.getElementById("home-date").textContent = now.toLocaleDateString("en-US", {
  weekday: "long", month: "long", day: "numeric"
});

// ---- TASKS & HABITS ----
let earnedPts = 0;

function updatePoints() {
  document.getElementById("points-display").textContent = "⭐ " + earnedPts + " pts today";
  document.getElementById("tab-points-display").textContent = "⭐ " + earnedPts + " pts";
}

function toggleTask(el) {
  const pts = parseInt(el.dataset.pts);
  const parentItem = el.parentElement;
  const textEl = el.nextElementSibling;
  const container = parentItem.parentElement;
  if (el.classList.contains("done")) {
    el.classList.remove("done");
    textEl.classList.remove("done");
    earnedPts -= pts;
    container.insertBefore(parentItem, container.firstChild);
  } else {
    el.classList.add("done");
    textEl.classList.add("done");
    earnedPts += pts;
    container.appendChild(parentItem);
  }
  updatePoints();
}

function toggleHabit(el) {
  const pts = parseInt(el.dataset.pts);
  const container = el.parentElement;
  const dot = el.querySelector(".habit-dot");
  if (el.classList.contains("done")) {
    el.classList.remove("done");
    dot.classList.remove("done");
    dot.classList.add("pending");
    earnedPts -= pts;
    container.insertBefore(el, container.firstChild);
  } else {
    el.classList.add("done");
    dot.classList.remove("pending");
    dot.classList.add("done");
    earnedPts += pts;
    container.appendChild(el);
  }
  updatePoints();
}

document.getElementById("tasks").innerHTML = `
  <div class="task-item">
    <div class="task-check" onclick="toggleTask(this)" data-pts="2"></div>
    <span class="task-text">Lab quiz prep</span>
    <span class="task-pts">2pts</span>
  </div>
  <div class="task-item">
    <div class="task-check" onclick="toggleTask(this)" data-pts="1"></div>
    <span class="task-text">Spanish quizlet</span>
    <span class="task-pts">1pt</span>
  </div>
`;

document.getElementById("habits").innerHTML = `
  <div class="habit-item" onclick="toggleHabit(this)" data-pts="1" style="cursor:pointer;">
    <div class="habit-dot pending"></div>
    <span class="habit-text">8 cups water</span>
    <span class="task-pts">1pt</span>
  </div>
  <div class="habit-item" onclick="toggleHabit(this)" data-pts="1" style="cursor:pointer;">
    <div class="habit-dot pending"></div>
    <span class="habit-text">Exercise</span>
    <span class="task-pts">1pt</span>
  </div>
`;

// ---- MINI CALENDAR ----
const monthNames = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const dayLabels = ["S","M","T","W","T","F","S"];

let calYear = now.getFullYear();
let calMonth = now.getMonth();
let selectedDateStr = todayStr;

function renderMiniCal() {
  document.getElementById("mini-cal-title").textContent =
    monthNames[calMonth].slice(0,3) + " " + calYear;

  const grid = document.getElementById("mini-cal-grid");
  grid.innerHTML = "";

  dayLabels.forEach(function(d) {
    const label = document.createElement("div");
    label.className = "day-label";
    label.textContent = d;
    grid.appendChild(label);
  });

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "day-num empty";
    empty.textContent = ".";
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayEl = document.createElement("div");
    dayEl.className = "day-num";
    dayEl.textContent = d;

    const thisDateStr = calYear + "-" +
      String(calMonth + 1).padStart(2,"0") + "-" +
      String(d).padStart(2,"0");

    if (thisDateStr === todayStr) dayEl.classList.add("today");
    if (thisDateStr === selectedDateStr) dayEl.classList.add("selected");

    dayEl.onclick = function() {
      selectedDateStr = thisDateStr;
      renderMiniCal();
      renderCalSchedule();
      renderUpcoming();
      document.getElementById("cal-selected-date").textContent =
        monthNames[calMonth] + " " + d + ", " + calYear;
    };

    grid.appendChild(dayEl);
  }
}

function changeCalMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderMiniCal();
}

// ---- CALENDAR SCHEDULE ----
function renderCalSchedule() {
  const container = document.getElementById("cal-schedule");
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "schedule-wrapper";
  const inner = document.createElement("div");
  inner.className = "schedule-inner";
  wrapper.appendChild(inner);
  container.appendChild(wrapper);

  for (let h = startHour; h <= endHour; h++) {
    const topPercent = ((h - startHour) / totalHours) * 100;
    const hourLine = document.createElement("div");
    hourLine.style.position = "absolute";
    hourLine.style.top = topPercent + "%";
    hourLine.style.left = "0";
    hourLine.style.right = "0";
    hourLine.style.display = "flex";
    hourLine.style.alignItems = "center";
    hourLine.style.gap = "8px";
    hourLine.innerHTML = `
      <span style="font-size:10px;color:#b080a0;font-weight:600;min-width:36px;">${h}:00</span>
      <div style="flex:1;height:0.5px;background:#e8c9e0;"></div>
    `;
    inner.appendChild(hourLine);

    for (let q = 1; q <= 3; q++) {
      const qLine = document.createElement("div");
      const qPercent = ((h - startHour + q * 0.25) / totalHours) * 100;
      qLine.style.position = "absolute";
      qLine.style.top = qPercent + "%";
      qLine.style.left = q === 2 ? "44px" : "54px";
      qLine.style.right = "0";
      qLine.style.height = "0.5px";
      qLine.style.background = q === 2 ? "#f0d5e8" : "#f8eef5";
      inner.appendChild(qLine);
    }
  }

  events.filter(e => e.date === selectedDateStr).forEach(function(event) {
    const hour = parseInt(event.time.split(":")[0]);
    const mins = parseInt(event.time.split(":")[1]);
    const topPercent = ((hour + mins / 60 - startHour) / totalHours) * 100;
    const block = document.createElement("div");
    block.className = "schedule-block";
    block.style.top = topPercent + "%";
    block.innerHTML = `
      <div class="event-card ${event.color}">
        ${event.title}
        ${event.subtask ? `<div class="event-subtask">• ${event.subtask}</div>` : ""}
      </div>
    `;
    inner.appendChild(block);
  });

  if (selectedDateStr === todayStr) {
    const currentDecimalHour = now.getHours() + now.getMinutes() / 60;
    const topPercent = ((currentDecimalHour - startHour) / totalHours) * 100;
    const timeLine = document.createElement("div");
    timeLine.style.position = "absolute";
    timeLine.style.top = topPercent + "%";
    timeLine.style.left = "36px";
    timeLine.style.right = "0";
    timeLine.style.height = "2px";
    timeLine.style.background = "#c45c8a";
    timeLine.style.zIndex = "10";
    const dot = document.createElement("div");
    dot.style.position = "absolute";
    dot.style.left = "-4px";
    dot.style.top = "-3px";
    dot.style.width = "8px";
    dot.style.height = "8px";
    dot.style.borderRadius = "50%";
    dot.style.background = "#c45c8a";
    timeLine.appendChild(dot);
    inner.appendChild(timeLine);

    const wrapperHeight = wrapper.clientHeight;
    const innerHeight = inner.clientHeight;
    const scrollTarget = (topPercent / 100) * innerHeight - wrapperHeight / 2;
    wrapper.scrollTop = Math.max(0, scrollTarget);
  }
}

// ---- UPCOMING ----
function renderUpcoming() {
  const list = document.getElementById("upcoming-list");
  list.innerHTML = "";
  const future = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  if (future.length === 0) {
    list.innerHTML = '<p style="font-size:11px;color:#b080a0;">Nothing upcoming!</p>';
    return;
  }

  future.forEach(function(event) {
    const d = new Date(event.date + "T00:00:00");
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const item = document.createElement("div");
    item.className = "upcoming-item";
    item.innerHTML = `
      ${event.title}
      <div class="upcoming-date">${label} · ${event.time}</div>
    `;
    list.appendChild(item);
  });
}

// ---- MODAL ----
function openModal() {
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("event-title").value = "";
  document.getElementById("event-time").value = "";
  document.getElementById("event-subtask").value = "";
}

function saveEvent() {
  const title = document.getElementById("event-title").value;
  const time = document.getElementById("event-time").value;
  const subtask = document.getElementById("event-subtask").value;
  const color = document.getElementById("event-color").value;
  if (!title || !time) return;

  const formattedTime = time.length === 5 ? time : time.slice(0,5);
  events.push({ date: selectedDateStr, time: formattedTime, title, subtask, color });

  renderCalSchedule();
  renderUpcoming();
  closeModal();
}

// ---- TAB SWITCHING ----
function switchTab(tab) {
  const tabs = ['home', 'calendar', 'habits', 'pet', 'focus'];
  tabs.forEach(function(t) {
    document.getElementById('tab-' + t).style.display = t === tab ? 'block' : 'none';
  });

  const tabOrder = ['calendar', 'habits', 'home', 'pet', 'focus'];
  const buttons = document.querySelectorAll('.bottom-nav button');
  buttons.forEach(function(btn, i) {
    btn.classList.toggle('active', tabOrder[i] === tab);
  });

  const titles = {
    calendar: 'Calendar',
    habits: 'Habits',
    pet: 'My Pet',
    focus: 'Focus'
  };

  if (tab === 'home') {
    document.getElementById('main-header').style.display = 'block';
    document.getElementById('tab-header').style.display = 'none';
  } else {
    document.getElementById('main-header').style.display = 'none';
    document.getElementById('tab-header').style.display = 'block';
    document.getElementById('tab-title').textContent = titles[tab];
  }

  if (tab === 'calendar') {
    renderMiniCal();
    renderCalSchedule();
    renderUpcoming();
    document.getElementById("cal-selected-date").textContent =
      monthNames[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear();
  }

  if (tab === 'habits') {
  renderHabitsTab();
}
}

// ---- HABITS DATA ----
const habits = [
  { id: 1, name: "Drink Water", frequency: "daily", pts: 1, completedDates: [] },
  { id: 2, name: "Exercise", frequency: "daily", pts: 1, completedDates: [] },
  { id: 3, name: "Brush Teeth", frequency: "daily", pts: 1, completedDates: [] },
  { id: 4, name: "Clean Room", frequency: "weekly", pts: 2, completedDates: [] },
  { id: 5, name: "Change Contacts", frequency: "biweekly", pts: 1, completedDates: [] },
  { id: 6, name: "Wash Car", frequency: "monthly", pts: 3, completedDates: [] }
];

const frequencyLabels = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  monthly: "Monthly"
};

const frequencyOrder = ["daily", "weekly", "biweekly", "monthly"];

function isHabitDoneToday(habit) {
  return habit.completedDates.includes(todayStr);
}

function renderHabitsTab() {
  frequencyOrder.forEach(function(freq) {
    const container = document.getElementById("habits-" + freq);
    container.innerHTML = "";

    const filtered = habits.filter(h => h.frequency === freq);
    if (filtered.length === 0) return;

    const label = document.createElement("p");
    label.className = "section-label";
    label.textContent = frequencyLabels[freq];
    container.appendChild(label);

    const done = filtered.filter(h => isHabitDoneToday(h));
    const notDone = filtered.filter(h => !isHabitDoneToday(h));

    [...notDone, ...done].forEach(function(habit) {
      const card = document.createElement("div");
      card.className = "habit-card" + (isHabitDoneToday(habit) ? " done" : "");
      card.innerHTML = `
        <div class="habit-card-dot"></div>
        <span class="habit-card-name">${habit.name}</span>
        <span class="habit-card-pts">${habit.pts}pt</span>
      `;
      card.onclick = function() {
  openHabitDetail(habit);
};
      container.appendChild(card);
    });
  });
}

function toggleHabitCard(habit, card) {
  if (isHabitDoneToday(habit)) {
    habit.completedDates = habit.completedDates.filter(d => d !== todayStr);
    earnedPts -= habit.pts;
  } else {
    habit.completedDates.push(todayStr);
    earnedPts += habit.pts;
  }
  updatePoints();
  renderHomeHabits();

  if (activeHabit) {
    openHabitDetail(habit);
  } else {
    renderHabitsTab();
  }
}

function renderHomeHabits() {
  const habitsDiv = document.getElementById("habits");
  habitsDiv.innerHTML = "";
  habits.filter(h => h.frequency === "daily").forEach(function(habit) {
    const item = document.createElement("div");
    item.className = "habit-item" + (isHabitDoneToday(habit) ? " done" : "");
    item.dataset.pts = habit.pts;
    item.style.cursor = "pointer";
    item.innerHTML = `
      <div class="habit-dot ${isHabitDoneToday(habit) ? "done" : "pending"}"></div>
      <span class="habit-text">${habit.name}</span>
      <span class="task-pts">${habit.pts}pt</span>
    `;
    item.onclick = function() {
      toggleHabitCard(habit, item);
    };
    habitsDiv.appendChild(item);
  });
}

function openHabitModal() {
  document.getElementById("habit-modal").style.display = "flex";
}

function closeHabitModal() {
  document.getElementById("habit-modal").style.display = "none";
  document.getElementById("habit-name").value = "";
  document.getElementById("habit-pts").value = "";
}

function saveHabit() {
  const name = document.getElementById("habit-name").value;
  const frequency = document.getElementById("habit-frequency").value;
  const pts = parseInt(document.getElementById("habit-pts").value) || 1;
  if (!name) return;

  habits.push({
    id: Date.now(),
    name,
    frequency,
    pts,
    completedDates: []
  });

  renderHabitsTab();
  renderHomeHabits();
  closeHabitModal();
}

renderHomeHabits();

let activeHabit = null;

function openHabitDetail(habit) {
  activeHabit = habit;
  document.getElementById("habit-detail").style.display = "flex";
  document.getElementById("detail-habit-name").textContent = habit.name;

  const isDone = isHabitDoneToday(habit);
  const btn = document.getElementById("detail-complete-btn");
  btn.textContent = isDone ? "✓ Completed Today!" : "Mark as Done Today";
  btn.style.background = isDone ? "#b080a0" : "#c45c8a";
  btn.onclick = function() {
    toggleHabitCard(habit, null);
  };

  document.getElementById("detail-total").textContent = habit.completedDates.length;
  document.getElementById("detail-pts-earned").textContent = habit.completedDates.length * habit.pts;
  document.getElementById("detail-points-display").textContent = "⭐ " + earnedPts + " pts";

  const streak = calculateStreak(habit);
  document.getElementById("detail-streak").textContent = streak;

  const streakLabel = document.querySelector("#detail-streak + .detail-stat-label") ||
    document.querySelectorAll(".detail-stat-label")[0];

  const labels = document.querySelectorAll(".detail-stat-label");
  if (habit.frequency === "daily") labels[0].textContent = "day streak";
  else if (habit.frequency === "weekly") labels[0].textContent = "week streak";
  else if (habit.frequency === "biweekly") labels[0].textContent = "period streak";
  else labels[0].textContent = "month streak";

  const lastCompleted = habit.completedDates.length > 0
    ? habit.completedDates.slice().sort().reverse()[0]
    : null;

  document.getElementById("detail-last-completed").textContent = lastCompleted
    ? "Last completed: " + new Date(lastCompleted + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Not completed yet";

  renderCompletionGrid(habit);
}

function calculateStreak(habit) {
  let streak = 0;

  if (habit.frequency === "daily") {
    const check = new Date();
    while (true) {
      const dateStr = check.toISOString().split("T")[0];
      if (habit.completedDates.includes(dateStr)) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else break;
    }

  } else if (habit.frequency === "weekly") {
    const getWeekStart = (date) => {
      const d = new Date(date);
      d.setDate(d.getDate() - d.getDay());
      return d.toISOString().split("T")[0];
    };
    const completedWeeks = new Set(habit.completedDates.map(d => getWeekStart(d)));
    const check = new Date();
    while (true) {
      const weekStart = getWeekStart(check);
      if (completedWeeks.has(weekStart)) {
        streak++;
        check.setDate(check.getDate() - 7);
      } else break;
    }

  } else if (habit.frequency === "biweekly") {
    const getBiweeklyPeriod = (date) => {
      const d = new Date(date);
      const weekOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
      return d.getFullYear() + "-" + Math.floor(weekOfYear / 2);
    };
    const completedPeriods = new Set(habit.completedDates.map(d => getBiweeklyPeriod(d)));
    const check = new Date();
    while (true) {
      const period = getBiweeklyPeriod(check);
      if (completedPeriods.has(period)) {
        streak++;
        check.setDate(check.getDate() - 14);
      } else break;
    }

  } else if (habit.frequency === "monthly") {
    const getMonth = (date) => date.slice(0, 7);
    const completedMonths = new Set(habit.completedDates.map(d => getMonth(d)));
    const check = new Date();
    while (true) {
      const month = check.toISOString().split("T")[0].slice(0, 7);
      if (completedMonths.has(month)) {
        streak++;
        check.setMonth(check.getMonth() - 1);
      } else break;
    }
  }

  return streak;
}

function renderCompletionGrid(habit) {
  const grid = document.getElementById("detail-grid");
  grid.innerHTML = "";

  const today = new Date();

  if (habit.frequency === "daily") {
    const dayLabelsShort = ["S","M","T","W","T","F","S"];
    dayLabelsShort.forEach(function(d) {
      const label = document.createElement("div");
      label.className = "completion-day-label";
      label.textContent = d;
      grid.appendChild(label);
    });

    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.className = "completion-cell empty";
      grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = year + "-" +
        String(month + 1).padStart(2, "0") + "-" +
        String(d).padStart(2, "0");
      const cell = document.createElement("div");
      cell.className = "completion-cell" + (habit.completedDates.includes(dateStr) ? " completed" : "");
      cell.title = d;

      const num = document.createElement("span");
      num.style.fontSize = "8px";
      num.style.color = habit.completedDates.includes(dateStr) ? "white" : "#b080a0";
      num.textContent = d;
      cell.appendChild(num);
      cell.style.display = "flex";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "center";

      grid.appendChild(cell);
    }

  } else if (habit.frequency === "weekly") {
    grid.style.gridTemplateColumns = "repeat(4, 1fr)";

    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() - w * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekStartStr = weekStart.toISOString().split("T")[0];
      const weekEndStr = weekEnd.toISOString().split("T")[0];

      const completed = habit.completedDates.some(d => d >= weekStartStr && d <= weekEndStr);

      const cell = document.createElement("div");
      cell.className = "completion-cell" + (completed ? " completed" : "");
      cell.style.display = "flex";
      cell.style.flexDirection = "column";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "center";
      cell.style.padding = "4px";
      cell.style.aspectRatio = "auto";
      cell.style.minHeight = "40px";
      cell.style.borderRadius = "8px";

      const dateLabel = document.createElement("span");
      dateLabel.style.fontSize = "8px";
      dateLabel.style.fontWeight = "700";
      dateLabel.style.color = completed ? "white" : "#b080a0";
      dateLabel.textContent = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      cell.appendChild(dateLabel);

      grid.appendChild(cell);
    }

  } else if (habit.frequency === "biweekly") {
    grid.style.gridTemplateColumns = "repeat(3, 1fr)";

    for (let p = 11; p >= 0; p--) {
      const periodStart = new Date(today);
      periodStart.setDate(today.getDate() - today.getDay() - p * 14);
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 13);

      const periodStartStr = periodStart.toISOString().split("T")[0];
      const periodEndStr = periodEnd.toISOString().split("T")[0];

      const completed = habit.completedDates.some(d => d >= periodStartStr && d <= periodEndStr);

      const cell = document.createElement("div");
      cell.className = "completion-cell" + (completed ? " completed" : "");
      cell.style.display = "flex";
      cell.style.flexDirection = "column";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "center";
      cell.style.padding = "6px 4px";
      cell.style.aspectRatio = "auto";
      cell.style.minHeight = "44px";
      cell.style.borderRadius = "8px";

      const dateLabel = document.createElement("span");
      dateLabel.style.fontSize = "8px";
      dateLabel.style.fontWeight = "700";
      dateLabel.style.color = completed ? "white" : "#b080a0";
      dateLabel.textContent = periodStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const dateLabel2 = document.createElement("span");
      dateLabel2.style.fontSize = "7px";
      dateLabel2.style.color = completed ? "white" : "#c0a0b0";
      dateLabel2.textContent = "– " + periodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      cell.appendChild(dateLabel);
      cell.appendChild(dateLabel2);
      grid.appendChild(cell);
    }

  } else if (habit.frequency === "monthly") {
    grid.style.gridTemplateColumns = "repeat(4, 1fr)";

    for (let m = 11; m >= 0; m--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
      const monthStr = monthDate.toISOString().split("T")[0].slice(0, 7);
      const completed = habit.completedDates.some(d => d.startsWith(monthStr));

      const cell = document.createElement("div");
      cell.className = "completion-cell" + (completed ? " completed" : "");
      cell.style.display = "flex";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "center";
      cell.style.aspectRatio = "auto";
      cell.style.minHeight = "44px";
      cell.style.borderRadius = "8px";

      const label = document.createElement("span");
      label.style.fontSize = "9px";
      label.style.fontWeight = "700";
      label.style.color = completed ? "white" : "#b080a0";
      label.textContent = monthDate.toLocaleDateString("en-US", { month: "short" });
      cell.appendChild(label);
      grid.appendChild(cell);
    }
  }
}

function closeHabitDetail() {
  document.getElementById("habit-detail").style.display = "none";
  activeHabit = null;
}
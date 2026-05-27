console.log("Meridian is running");

// ---- DATA ----
const defaultEvents = [
  { id: "e1", date: "2026-05-27", time: "09:00", timeEnd: "10:00", title: "AP Chemistry", subtask: "Lab quiz", color: "pink", recur: "none", recurStart: "2026-05-27", exceptions: [] },
  { id: "e2", date: "2026-05-27", time: "10:00", timeEnd: "11:00", title: "AP Calculus BC", subtask: "6.7 video + notes", color: "lavender", recur: "none", recurStart: "2026-05-27", exceptions: [] },
  { id: "e3", date: "2026-05-27", time: "12:00", timeEnd: "13:00", title: "British Literature", subtask: "Presentation 01/16", color: "peach", recur: "none", recurStart: "2026-05-27", exceptions: [] },
  { id: "e4", date: "2026-05-27", time: "16:00", timeEnd: "18:00", title: "Swim Practice", subtask: "", color: "mint", recur: "none", recurStart: "2026-05-27", exceptions: [] }
];

const defaultHabits = [
  { id: 1, name: "Drink Water", frequency: "daily", pts: 1, completedDates: [] },
  { id: 2, name: "Exercise", frequency: "daily", pts: 1, completedDates: [] },
  { id: 3, name: "Brush Teeth", frequency: "daily", pts: 1, completedDates: [] },
  { id: 4, name: "Clean Room", frequency: "weekly", pts: 2, completedDates: [] },
  { id: 5, name: "Change Contacts", frequency: "biweekly", pts: 1, completedDates: [] },
  { id: 6, name: "Wash Car", frequency: "monthly", pts: 3, completedDates: [] }
];

const savedEvents = localStorage.getItem("meridian-events");
const savedHabits = localStorage.getItem("meridian-habits");
const savedPts = localStorage.getItem("meridian-pts");

const events = savedEvents ? JSON.parse(savedEvents) : defaultEvents;
const habits = savedHabits ? JSON.parse(savedHabits) : defaultHabits;
let earnedPts = savedPts ? parseInt(savedPts) : 0;

function saveData() {
  localStorage.setItem("meridian-events", JSON.stringify(events));
  localStorage.setItem("meridian-habits", JSON.stringify(habits));
  localStorage.setItem("meridian-pts", earnedPts);
}

// ---- RECURRING LOGIC ----
function eventOccursOnDate(event, dateStr) {
  if (event.exceptions && event.exceptions.includes(dateStr)) return false;
  if (event.recurEnd && dateStr > event.recurEnd) return false;
  if (dateStr < event.recurStart) return false;

  if (event.recur === "none") return event.date === dateStr;
  if (event.recur === "daily") return true;

  if (event.recur === "specific") {
    const checkDate = new Date(dateStr + "T00:00:00");
    const dayOfWeek = checkDate.getDay().toString();
    return event.specificDays && event.specificDays.includes(dayOfWeek);
  }

  const eventDate = new Date(event.recurStart + "T00:00:00");
  const checkDate = new Date(dateStr + "T00:00:00");
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksDiff = Math.round((checkDate - eventDate) / msPerWeek);

  if (event.recur === "weekly") return weeksDiff >= 0 && weeksDiff % 1 === 0;
  if (event.recur === "biweekly") return weeksDiff >= 0 && weeksDiff % 2 === 0;
  if (event.recur === "triweekly") return weeksDiff >= 0 && weeksDiff % 3 === 0;
  if (event.recur === "quadweekly") return weeksDiff >= 0 && weeksDiff % 4 === 0;

  if (event.recur === "monthly") {
    const checkDate = new Date(dateStr + "T00:00:00");
    const eventDate = new Date(event.recurStart + "T00:00:00");
    return checkDate.getDate() === eventDate.getDate() && checkDate >= eventDate;
  }

  return false;
}

// ---- SCHEDULE SETUP ----
const startHour = 0;
const endHour = 24;
const totalHours = endHour - startHour;
const now = new Date();
const todayStr = new Date().toISOString().split("T")[0];

const scheduleDiv = document.getElementById("schedule");
const scheduleWrapper = document.createElement("div");
scheduleWrapper.className = "schedule-wrapper";
const scheduleInner = document.createElement("div");
scheduleInner.className = "schedule-inner";
scheduleWrapper.appendChild(scheduleInner);
scheduleDiv.appendChild(scheduleWrapper);

function buildTimeGrid(inner) {
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

    if (h < endHour) {
      const halfLine = document.createElement("div");
      const halfPercent = ((h - startHour + 0.5) / totalHours) * 100;
      halfLine.style.position = "absolute";
      halfLine.style.top = halfPercent + "%";
      halfLine.style.left = "44px";
      halfLine.style.right = "0";
      halfLine.style.height = "0.5px";
      halfLine.style.background = "#f0d5e8";
      inner.appendChild(halfLine);
    }
  }
}

function buildEventBlocks(inner, dateStr, allowDelete) {
  getEventsForDate(dateStr).forEach(function(event) {
    const hour = parseInt(event.time.split(":")[0]);
    const mins = parseInt(event.time.split(":")[1]);
    const topPercent = ((hour + mins / 60 - startHour) / totalHours) * 100;

    let heightPercent = (1 / totalHours) * 100;
    if (event.timeEnd) {
      const eH = parseInt(event.timeEnd.split(":")[0]);
      const eM = parseInt(event.timeEnd.split(":")[1]);
      const duration = (eH + eM / 60) - (hour + mins / 60);
      if (duration > 0) heightPercent = (duration / totalHours) * 100;
    }

    const block = document.createElement("div");
    block.className = "schedule-block";
    block.style.top = topPercent + "%";
    block.style.height = heightPercent + "%";
    block.style.overflow = "hidden";

    const deleteBtn = allowDelete
      ? `<div class="event-delete" onclick="promptDeleteEvent('${event.id}', '${dateStr}')">✕</div>`
      : "";

    block.innerHTML = `
      <div class="event-card ${event.color}" style="height:100%;box-sizing:border-box;position:relative;">
        ${event.title}
        ${event.subtask ? `<div class="event-subtask">• ${event.subtask}</div>` : ""}
        ${deleteBtn}
      </div>
    `;
    inner.appendChild(block);
  });
}

buildTimeGrid(scheduleInner);
buildEventBlocks(scheduleInner, todayStr, false);

function drawCurrentTimeLine() {
  const existing = document.getElementById("time-line");
  if (existing) existing.remove();
  const now = new Date();
  const currentDecimalHour = now.getHours() + now.getMinutes() / 60;
  const topPercent = ((currentDecimalHour - startHour) / totalHours) * 100;
  const timeLine = document.createElement("div");
  timeLine.id = "time-line";
  timeLine.style.cssText = `position:absolute;top:${topPercent}%;left:36px;right:0;height:2px;background:#c45c8a;z-index:10;`;
  const dot = document.createElement("div");
  dot.style.cssText = "position:absolute;left:-4px;top:-3px;width:8px;height:8px;border-radius:50%;background:#c45c8a;";
  timeLine.appendChild(dot);
  scheduleInner.appendChild(timeLine);
  const scrollTarget = (topPercent / 100) * scheduleInner.clientHeight - scheduleWrapper.clientHeight / 2;
  scheduleWrapper.scrollTop = Math.max(0, scrollTarget);
}

drawCurrentTimeLine();
setInterval(drawCurrentTimeLine, 60000);

// ---- HOME DATE ----
document.getElementById("home-date").textContent = now.toLocaleDateString("en-US", {
  weekday: "long", month: "long", day: "numeric"
});

// ---- POINTS ----
function updatePoints() {
  document.getElementById("points-display").textContent = "⭐ " + earnedPts + " pts today";
  document.getElementById("tab-points-display").textContent = "⭐ " + earnedPts + " pts";
  saveData();
}

updatePoints();

// ---- TASKS ----
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
  saveData();
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

// ---- HABITS ----
const frequencyLabels = { daily: "Daily", weekly: "Weekly", biweekly: "Bi-Weekly", monthly: "Monthly" };
const frequencyOrder = ["daily", "weekly", "biweekly", "monthly"];

function isHabitDoneToday(habit) { return habit.completedDates.includes(todayStr); }

function renderHomeHabits() {
  const habitsDiv = document.getElementById("habits");
  habitsDiv.innerHTML = "";
  habits.filter(h => h.frequency === "daily").forEach(function(habit) {
    const item = document.createElement("div");
    item.className = "habit-item";
    item.dataset.pts = habit.pts;
    item.style.cursor = "pointer";
    item.innerHTML = `
      <div class="habit-dot ${isHabitDoneToday(habit) ? "done" : "pending"}"></div>
      <span class="habit-text">${habit.name}</span>
      <span class="task-pts">${habit.pts}pt</span>
    `;
    item.onclick = function() { toggleHabitCard(habit, item); };
    habitsDiv.appendChild(item);
  });
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
      card.onclick = function() { openHabitDetail(habit); };
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
  saveData();
  updatePoints();
  renderHomeHabits();
  if (activeHabit) { openHabitDetail(habit); } else { renderHabitsTab(); }
}

function openHabitModal() { document.getElementById("habit-modal").style.display = "flex"; }

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
  habits.push({ id: Date.now(), name, frequency, pts, completedDates: [] });
  saveData();
  renderHabitsTab();
  renderHomeHabits();
  closeHabitModal();
}

renderHomeHabits();

// ---- HABIT DETAIL ----
let activeHabit = null;

function openHabitDetail(habit) {
  activeHabit = habit;
  document.getElementById("habit-detail").style.display = "flex";
  document.getElementById("detail-habit-name").textContent = habit.name;
  const isDone = isHabitDoneToday(habit);
  const btn = document.getElementById("detail-complete-btn");
  btn.textContent = isDone ? "✓ Completed Today!" : "Mark as Done Today";
  btn.style.background = isDone ? "#b080a0" : "#c45c8a";
  btn.onclick = function() { toggleHabitCard(habit, null); };
  document.getElementById("detail-total").textContent = habit.completedDates.length;
  document.getElementById("detail-pts-earned").textContent = habit.completedDates.length * habit.pts;
  document.getElementById("detail-points-display").textContent = "⭐ " + earnedPts + " pts";
  const streak = calculateStreak(habit);
  document.getElementById("detail-streak").textContent = streak;
  const labels = document.querySelectorAll(".detail-stat-label");
  if (habit.frequency === "daily") labels[0].textContent = "day streak";
  else if (habit.frequency === "weekly") labels[0].textContent = "week streak";
  else if (habit.frequency === "biweekly") labels[0].textContent = "period streak";
  else labels[0].textContent = "month streak";
  const lastCompleted = habit.completedDates.length > 0
    ? habit.completedDates.slice().sort().reverse()[0] : null;
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
      if (habit.completedDates.includes(dateStr)) { streak++; check.setDate(check.getDate() - 1); }
      else break;
    }
  } else if (habit.frequency === "weekly") {
    const getWeekStart = (date) => { const d = new Date(date); d.setDate(d.getDate() - d.getDay()); return d.toISOString().split("T")[0]; };
    const completedWeeks = new Set(habit.completedDates.map(d => getWeekStart(d)));
    const check = new Date();
    while (true) {
      const weekStart = getWeekStart(check);
      if (completedWeeks.has(weekStart)) { streak++; check.setDate(check.getDate() - 7); } else break;
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
      if (completedPeriods.has(period)) { streak++; check.setDate(check.getDate() - 14); } else break;
    }
  } else if (habit.frequency === "monthly") {
    const completedMonths = new Set(habit.completedDates.map(d => d.slice(0, 7)));
    const check = new Date();
    while (true) {
      const month = check.toISOString().split("T")[0].slice(0, 7);
      if (completedMonths.has(month)) { streak++; check.setMonth(check.getMonth() - 1); } else break;
    }
  }
  return streak;
}

function renderCompletionGrid(habit) {
  const grid = document.getElementById("detail-grid");
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = "repeat(7, 1fr)";
  const today = new Date();

  if (habit.frequency === "daily") {
    ["S","M","T","W","T","F","S"].forEach(function(d) {
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
      const dateStr = year + "-" + String(month + 1).padStart(2,"0") + "-" + String(d).padStart(2,"0");
      const cell = document.createElement("div");
      cell.className = "completion-cell" + (habit.completedDates.includes(dateStr) ? " completed" : "");
      const num = document.createElement("span");
      num.style.fontSize = "8px";
      num.style.color = habit.completedDates.includes(dateStr) ? "white" : "#b080a0";
      num.textContent = d;
      cell.appendChild(num);
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
      cell.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4px;aspect-ratio:auto;min-height:40px;border-radius:8px;";
      const dateLabel = document.createElement("span");
      dateLabel.style.cssText = `font-size:8px;font-weight:700;color:${completed ? "white" : "#b080a0"};`;
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
      cell.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px 4px;aspect-ratio:auto;min-height:44px;border-radius:8px;";
      const l1 = document.createElement("span");
      l1.style.cssText = `font-size:8px;font-weight:700;color:${completed ? "white" : "#b080a0"};`;
      l1.textContent = periodStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const l2 = document.createElement("span");
      l2.style.cssText = `font-size:7px;color:${completed ? "white" : "#c0a0b0"};`;
      l2.textContent = "– " + periodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      cell.appendChild(l1);
      cell.appendChild(l2);
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
      cell.style.cssText = "display:flex;align-items:center;justify-content:center;aspect-ratio:auto;min-height:44px;border-radius:8px;";
      const label = document.createElement("span");
      label.style.cssText = `font-size:9px;font-weight:700;color:${completed ? "white" : "#b080a0"};`;
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

// ---- MINI CALENDAR ----
const monthNames = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const dayLabels = ["S","M","T","W","T","F","S"];

let calYear = now.getFullYear();
let calMonth = now.getMonth();
let selectedDateStr = todayStr;

function renderMiniCal() {
  document.getElementById("mini-cal-title").textContent = monthNames[calMonth].slice(0,3) + " " + calYear;
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
    const thisDateStr = calYear + "-" + String(calMonth + 1).padStart(2,"0") + "-" + String(d).padStart(2,"0");
    if (thisDateStr === todayStr) dayEl.classList.add("today");
    if (thisDateStr === selectedDateStr) dayEl.classList.add("selected");
    dayEl.onclick = function() {
      selectedDateStr = thisDateStr;
      renderMiniCal();
      renderCalSchedule();
      renderUpcoming();
      document.getElementById("cal-selected-date").textContent = monthNames[calMonth] + " " + d + ", " + calYear;
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

  buildTimeGrid(inner);
  buildEventBlocks(inner, selectedDateStr, true);

  if (selectedDateStr === todayStr) {
    const currentDecimalHour = now.getHours() + now.getMinutes() / 60;
    const topPercent = ((currentDecimalHour - startHour) / totalHours) * 100;
    const timeLine = document.createElement("div");
    timeLine.style.cssText = `position:absolute;top:${topPercent}%;left:36px;right:0;height:2px;background:#c45c8a;z-index:10;`;
    const dot = document.createElement("div");
    dot.style.cssText = "position:absolute;left:-4px;top:-3px;width:8px;height:8px;border-radius:50%;background:#c45c8a;";
    timeLine.appendChild(dot);
    inner.appendChild(timeLine);
    const scrollTarget = (topPercent / 100) * inner.clientHeight - wrapper.clientHeight / 2;
    wrapper.scrollTop = Math.max(0, scrollTarget);
  }
}

// ---- UPCOMING ----
function renderUpcoming() {
  const list = document.getElementById("upcoming-list");
  list.innerHTML = "";
  const next7Days = [];
  for (let i = 0; i <= 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    getEventsForDate(dateStr).forEach(e => next7Days.push({ ...e, date: dateStr }));
  }
  const sorted = next7Days.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).slice(0, 4);
  if (sorted.length === 0) {
    list.innerHTML = '<p style="font-size:11px;color:#b080a0;">Nothing upcoming!</p>';
    return;
  }
  sorted.forEach(function(event) {
    const d = new Date(event.date + "T00:00:00");
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const item = document.createElement("div");
    item.className = "upcoming-item";
    item.innerHTML = `${event.title}<div class="upcoming-date">${label} · ${event.time}</div>`;
    list.appendChild(item);
  });
}

// ---- EVENT MODAL ----
document.getElementById("event-recur").addEventListener("change", function() {
  document.getElementById("specific-days-wrap").style.display =
    this.value === "specific" ? "block" : "none";
  document.getElementById("recur-end-wrap").style.display =
    this.value === "none" ? "none" : "block";
});

function openModal() { document.getElementById("modal").style.display = "flex"; }

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("event-title").value = "";
  document.getElementById("event-time").value = "";
  document.getElementById("event-time-end").value = "";
  document.getElementById("event-subtask").value = "";
  document.getElementById("event-recur").value = "none";
  document.getElementById("event-recur-end").value = "";
  document.getElementById("recur-end-wrap").style.display = "none";
  document.getElementById("specific-days-wrap").style.display = "none";
  document.querySelectorAll("#specific-days-wrap input").forEach(cb => cb.checked = false);
}
function saveEvent() {
  const title = document.getElementById("event-title").value;
  const time = document.getElementById("event-time").value;
  const timeEnd = document.getElementById("event-time-end").value;
  const subtask = document.getElementById("event-subtask").value;
  const color = document.getElementById("event-color").value;
  const recur = document.getElementById("event-recur").value;
  if (!title || !time) return;

  const specificDays = recur === "specific"
    ? Array.from(document.querySelectorAll("#specific-days-wrap input:checked")).map(cb => cb.value)
    : [];

  const formattedTime = time.slice(0,5);
  const formattedEnd = timeEnd ? timeEnd.slice(0,5) : "";

  events.push({
    id: "e" + Date.now(),
    date: selectedDateStr,
    recurStart: selectedDateStr,
    time: formattedTime,
    timeEnd: formattedEnd,
    title, subtask, color,
    recur,
    specificDays,
    recurEnd: document.getElementById("event-recur-end").value || null,
    exceptions: []
  });

  saveData();
  renderCalSchedule();
  renderUpcoming();
  closeModal();
}

// ---- DELETE EVENT ----
let pendingDeleteId = null;
let pendingDeleteDate = null;

function promptDeleteEvent(eventId, dateStr) {
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  pendingDeleteId = eventId;
  pendingDeleteDate = dateStr;

  if (event.recur === "none") {
    const idx = events.findIndex(e => e.id === eventId);
    if (idx !== -1) events.splice(idx, 1);
    saveData();
    renderCalSchedule();
    renderUpcoming();
  } else {
    document.getElementById("delete-modal").style.display = "flex";
    document.getElementById("delete-this-btn").onclick = function() {
      const ev = events.find(e => e.id === pendingDeleteId);
      if (ev) ev.exceptions.push(pendingDeleteDate);
      saveData();
      renderCalSchedule();
      renderUpcoming();
      closeDeleteModal();
    };
    document.getElementById("delete-future-btn").onclick = function() {
      const ev = events.find(e => e.id === pendingDeleteId);
      if (ev) {
        const yesterday = new Date(pendingDeleteDate + "T00:00:00");
        yesterday.setDate(yesterday.getDate() - 1);
        ev.recurEnd = yesterday.toISOString().split("T")[0];
      }
      saveData();
      renderCalSchedule();
      renderUpcoming();
      closeDeleteModal();
    };
  }
}

function closeDeleteModal() {
  document.getElementById("delete-modal").style.display = "none";
  pendingDeleteId = null;
  pendingDeleteDate = null;
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
  const titles = { calendar: 'Calendar', habits: 'Habits', pet: 'My Pet', focus: 'Focus' };
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
  if (tab === 'habits') { renderHabitsTab(); }
}
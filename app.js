console.log("Meridian is running");

const events = [
  { time: "9:00", title: "AP Chemistry", subtask: "Lab quiz", color: "pink" },
  { time: "10:00", title: "AP Calculus BC", subtask: "6.7 video + notes", color: "lavender" },
  { time: "12:00", title: "British Literature", subtask: "Presentation 01/16", color: "peach" },
  { time: "16:00", title: "Swim Practice", subtask: "", color: "mint" }
];

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

events.forEach(function(event) {
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

let earnedPts = 0;

function updatePoints() {
  document.getElementById("points-display").textContent = "⭐ " + earnedPts + " pts today";
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

const tasksDiv = document.getElementById("tasks");
tasksDiv.innerHTML = `
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

const habitsDiv = document.getElementById("habits");
habitsDiv.innerHTML = `
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

function openModal(type) {
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

  const hour = parseInt(time.split(":")[0]);
  const minutes = parseInt(time.split(":")[1]);
  const topPercent = ((hour + minutes / 60 - startHour) / totalHours) * 100;

  const block = document.createElement("div");
  block.className = "schedule-block";
  block.style.top = topPercent + "%";
  block.innerHTML = `
    <div class="event-card ${color}">
      ${title}
      ${subtask ? `<div class="event-subtask">• ${subtask}</div>` : ""}
    </div>
  `;
  scheduleInner.appendChild(block);

  closeModal();
}

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
    calendar: 'Calendar 📅',
    habits: 'Habits ✅',
    pet: 'My Pet 🐾',
    focus: 'Focus ⏱'
  };

  if (tab === 'home') {
    document.getElementById('main-header').style.display = 'block';
    document.getElementById('tab-header').style.display = 'none';
  } else {
    document.getElementById('main-header').style.display = 'none';
    document.getElementById('tab-header').style.display = 'block';
    document.getElementById('tab-title').textContent = titles[tab];
  }
}

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

const yearView = document.getElementById("year-view");

months.forEach(function(month, index) {
  const card = document.createElement("div");
  card.className = "month-card";
  card.textContent = month;
  card.onclick = function() {
    showMonth(index);
  };
  yearView.appendChild(card);
});
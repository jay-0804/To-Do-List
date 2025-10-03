/* script.js - Advanced To-Do App
 Features:
 - LocalStorage persistence
 - Tasks tied to dates
 - Categories and priorities
 - Modal for view / edit / complete / delete
 - Points system (+10 per completion)
 - Progress bar per selected date
 - Dark mode toggle (persisted)
 - Confetti + completion animation
 - Show/Hide completed tasks
*/

// ---------- Constants & State ----------
const STORAGE_KEY = "todoApp_v1";
let state = {
  tasks: [],        // { id, text, date, category, priority, completed, createdAt }
  points: 0,
  showHistory: false,
  selectedDate: new Date().toISOString().split("T")[0],
  darkMode: false
};

// ---------- DOM Refs ----------
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const toggleHistoryBtn = document.getElementById("toggleHistory");
const pointsDisplay = document.getElementById("points");
const calendar = document.getElementById("calendar");
const categorySelect = document.getElementById("category");
const prioritySelect = document.getElementById("priority");
const progressBar = document.getElementById("progress");
const darkModeToggle = document.getElementById("darkModeToggle");

// Modal
const modal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalCategory = document.getElementById("modalCategory");
const modalPriority = document.getElementById("modalPriority");
const editTaskInput = document.getElementById("editTaskInput");
const completeTaskBtn = document.getElementById("completeTask");
const saveEditBtn = document.getElementById("saveEdit");
const deleteTaskBtn = document.getElementById("deleteTask");
const closeModalBtn = document.querySelector(".close");

// Animation & Confetti
const animationBox = document.getElementById("animation");
const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext && confettiCanvas.getContext("2d");

// internal modal pointer
let currentTaskId = null;

// ---------- Helpers ----------
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      // validate shape minimally
      state.tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
      state.points = typeof parsed.points === "number" ? parsed.points : 0;
      state.showHistory = !!parsed.showHistory;
      state.selectedDate = parsed.selectedDate || state.selectedDate;
      state.darkMode = !!parsed.darkMode;
    } catch (e) {
      console.warn("Could not parse storage, resetting.");
    }
  }
}

function uid() {
  return "t_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function formatDate(d) {
  // input is YYYY-MM-DD
  return d;
}

function getTasksForSelectedDate() {
  return state.tasks.filter(t => t.date === state.selectedDate);
}

function updatePointsDisplay() {
  pointsDisplay.textContent = state.points;
}

function updateProgress() {
  const tasksForDay = getTasksForSelectedDate();
  if (tasksForDay.length === 0) {
    progressBar.style.width = "0%";
    return;
  }
  const completedCount = tasksForDay.filter(t => t.completed).length;
  const pct = Math.round((completedCount / tasksForDay.length) * 100);
  progressBar.style.width = pct + "%";
}

function applyDarkMode() {
  if (state.darkMode) {
    document.body.classList.add("dark");
    darkModeToggle.textContent = "☀️ Light Mode";
  } else {
    document.body.classList.remove("dark");
    darkModeToggle.textContent = "🌙 Dark Mode";
  }
}

// ---------- Rendering ----------
function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = "task-card" + (task.completed ? " completed" : "");
  card.dataset.id = task.id;

  // Title
  const title = document.createElement("div");
  title.textContent = task.text;
  title.style.fontWeight = "600";
  title.style.marginBottom = "6px";

  // Meta row
  const metaRow = document.createElement("div");
  metaRow.style.display = "flex";
  metaRow.style.justifyContent = "space-between";
  metaRow.style.alignItems = "center";

  // Left meta (category & priority)
  const leftMeta = document.createElement("div");
  leftMeta.style.display = "flex";
  leftMeta.style.alignItems = "center";
  leftMeta.style.gap = "8px";

  const tag = document.createElement("div");
  tag.className = "tag " + (task.category || "General");
  tag.textContent = task.category || "General";
  leftMeta.appendChild(tag);

  const pri = document.createElement("div");
  pri.textContent = task.priority || "Low";
  pri.style.fontSize = "12px";
  pri.style.padding = "4px 8px";
  pri.style.borderRadius = "8px";
  pri.style.background = task.priority === "High" ? "#fee2e2" : (task.priority === "Medium" ? "#fffbeb" : "#ecfdf5");
  pri.style.color = task.priority === "High" ? "#991b1b" : (task.priority === "Medium" ? "#92400e" : "#166534");
  leftMeta.appendChild(pri);

  metaRow.appendChild(leftMeta);

  // Right meta (date)
  const dateDiv = document.createElement("div");
  dateDiv.textContent = task.date;
  dateDiv.style.fontSize = "12px";
  dateDiv.style.color = "rgba(0,0,0,0.6)";
  metaRow.appendChild(dateDiv);

  card.appendChild(title);
  card.appendChild(metaRow);

  // click opens modal
  card.addEventListener("click", () => openModal(task.id));

  return card;
}

function renderTasks() {
  taskList.innerHTML = "";

  const tasksToShow = state.tasks
    .filter(t => t.date === state.selectedDate)
    .filter(t => (state.showHistory ? true : !t.completed))
    .sort((a, b) => {
      // High priority first, then createdAt
      const prioValue = { "High": 3, "Medium": 2, "Low": 1 };
      return (prioValue[b.priority] - prioValue[a.priority]) || (a.createdAt - b.createdAt);
    });

  if (tasksToShow.length === 0) {
    const empty = document.createElement("div");
    empty.style.gridColumn = "1 / -1";
    empty.style.padding = "20px";
    empty.style.textAlign = "center";
    empty.style.color = "rgba(0,0,0,0.6)";
    empty.textContent = state.showHistory ? "No tasks in history for this date." : "No tasks for this date. Add one!";
    taskList.appendChild(empty);
  } else {
    tasksToShow.forEach(t => {
      const card = createTaskCard(t);
      taskList.appendChild(card);
    });
  }

  updateProgress();
  updatePointsDisplay();
  saveState();
}

// ---------- CRUD & Actions ----------
function addTask() {
  const text = taskInput.value.trim();
  const category = categorySelect.value || "General";
  const priority = prioritySelect.value || "Low";
  if (!text) return flashInput(taskInput);

  const newTask = {
    id: uid(),
    text,
    date: state.selectedDate,
    category,
    priority,
    completed: false,
    createdAt: Date.now()
  };
  state.tasks.push(newTask);
  taskInput.value = "";
  renderTasks();
  // subtle highlight + store
  pulseNewTask();
}

function flashInput(el) {
  el.animate([{ boxShadow: "0 0 0 0 rgba(255,82,82,0.6)" }, { boxShadow: "0 0 0 8px rgba(255,82,82,0)" }], { duration: 400 });
}

function pulseNewTask() {
  // little animation on the task-list to show new item
  taskList.animate([{ transform: "scale(0.995)" }, { transform: "scale(1)" }], { duration: 180 });
}

function openModal(taskId) {
  currentTaskId = taskId;
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  modalTitle.textContent = task.text;
  modalDate.textContent = "📅 " + task.date;
  modalCategory.textContent = task.category;
  modalPriority.textContent = task.priority;
  editTaskInput.value = task.text;
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
  currentTaskId = null;
}

function completeTask() {
  if (!currentTaskId) return;
  const task = state.tasks.find(t => t.id === currentTaskId);
  if (!task) return;

  if (!task.completed) {
    task.completed = true;
    state.points += 10;
    animateCompletion();
    fireConfetti();
  } else {
    // if marking undone via modal (if allowed), deduct points
    task.completed = false;
    state.points = Math.max(0, state.points - 10);
  }

  updatePointsDisplay();
  renderTasks();
  closeModal();
}

function saveEdit() {
  if (!currentTaskId) return;
  const task = state.tasks.find(t => t.id === currentTaskId);
  if (!task) return;

  const newText = editTaskInput.value.trim();
  if (!newText) return flashInput(editTaskInput);

  task.text = newText;
  renderTasks();
  closeModal();
}

function deleteTask() {
  if (!currentTaskId) return;
  const idx = state.tasks.findIndex(t => t.id === currentTaskId);
  if (idx === -1) return;
  const confirmDelete = confirm("Delete this task? This cannot be undone.");
  if (!confirmDelete) return;
  // if task was completed, remove points (optional)
  if (state.tasks[idx].completed) {
    state.points = Math.max(0, state.points - 10);
  }
  state.tasks.splice(idx, 1);
  renderTasks();
  closeModal();
}

// ---------- Animations ----------
function animateCompletion() {
  // show toast animation
  animationBox.style.display = "block";
  animationBox.animate([{ transform: "translateY(30px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-30px)", opacity: 0 }], { duration: 1400 });
  setTimeout(() => { animationBox.style.display = "none"; }, 1400);
}

// ---------- Confetti ----------
let confettiParticles = [];
let confettiAnimationFrame = null;

function resizeConfettiCanvas() {
  if (!confettiCtx) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

function fireConfetti() {
  if (!confettiCtx) return;
  // create many particles
  const count = 80;
  const colors = ["#ef4444", "#f97316", "#facc15", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -6 - 2,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      gravity: 0.2 + Math.random() * 0.1,
      life: 80 + Math.floor(Math.random() * 40)
    });
  }
  if (!confettiAnimationFrame) runConfetti();
}

function runConfetti() {
  if (!confettiCtx) return;
  resizeConfettiCanvas();
  confettiAnimationFrame = requestAnimationFrame(runConfetti);
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.vx * 4;
    p.life--;

    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    confettiCtx.restore();

    if (p.y > confettiCanvas.height + 50 || p.life <= 0) {
      confettiParticles.splice(i, 1);
    }
  }

  if (confettiParticles.length === 0) {
    cancelAnimationFrame(confettiAnimationFrame);
    confettiAnimationFrame = null;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

// ---------- UI Wiring ----------
addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => { if (e.key === "Enter") addTask(); });

toggleHistoryBtn.addEventListener("click", () => {
  state.showHistory = !state.showHistory;
  toggleHistoryBtn.textContent = state.showHistory ? "Hide Completed" : "Show Completed";
  renderTasks();
});

calendar.addEventListener("change", (e) => {
  state.selectedDate = e.target.value;
  renderTasks();
});

completeTaskBtn.addEventListener("click", completeTask);
saveEditBtn.addEventListener("click", saveEdit);
deleteTaskBtn.addEventListener("click", deleteTask);
closeModalBtn.addEventListener("click", closeModal);

window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// dark mode toggle
darkModeToggle.addEventListener("click", () => {
  state.darkMode = !state.darkMode;
  applyDarkMode();
  saveState();
});

// responsiveness for confetti canvas
window.addEventListener("resize", resizeConfettiCanvas);

// ---------- Init ----------
function init() {
  loadState();

  // ensure calendar default is selectedDate
  calendar.value = state.selectedDate;
  // points show
  updatePointsDisplay();
  applyDarkMode();

  // if no tasks exist, add a tiny demo (optional)
  // (we won't add demo automatically to avoid clutter)

  renderTasks();
  resizeConfettiCanvas();
}

// call init on load
init();

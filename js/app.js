const API_URL = "/api/tasks";

async function loadTasks() {
  const res = await fetch(API_URL);
  const data = await res.json();
  return data.tasks || [];
}

async function saveTask(task) {
  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
}

async function deleteTask(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
}

async function updateTaskStatus(id, newStatus) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });
}

// ----------------------------------------

function detectDepartment(comment) {
  const keywords = {
    "дороги": "Транспорт",
    "освещение": "Благоустройство",
    "интернет": "Цифровизация",
    "свет": "Благоустройство",
    "мусор": "Экология"
  };
  for (const word in keywords) {
    if (comment.toLowerCase().includes(word)) {
      return keywords[word];
    }
  }
  return "Общие вопросы";
}

// ----------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("taskForm");
  const list = document.getElementById("taskList");
  const departmentsStats = document.getElementById("departmentsStats");
  const analyticsPanel = document.getElementById("analyticsPanel");
  const taskManagerList = document.getElementById("taskManagerList");
  const statusSummary = document.getElementById("statusSummary");

  // Отрисовка задач на главной
  if (form && list) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const commentInput = document.getElementById("comment");
      const comment = commentInput.value.trim();
      if (!comment) return;

      const task = {
        id: Date.now(),
        comment,
        department: detectDepartment(comment),
        status: "в процессе",
        date: new Date().toLocaleDateString()
      };

      await saveTask(task);
      commentInput.value = "";
      renderTaskList();
    });

    async function renderTaskList() {
      const tasks = await loadTasks();
      list.innerHTML = "";
      tasks.forEach(task => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>[${task.department}]</strong> ${task.comment} — <em>${task.status}</em>`;
        list.appendChild(div);
      });
    }

    renderTaskList();
  }

  // Статистика по отделам
  if (departmentsStats) {
    const tasks = await loadTasks();
    const stats = {};

    tasks.forEach(task => {
      if (!stats[task.department]) {
        stats[task.department] = { total: 0, done: 0, overdue: 0 };
      }
      stats[task.department].total++;
      if (task.status === "выполнена") stats[task.department].done++;
      if (task.status === "просрочена") stats[task.department].overdue++;
    });

    for (const dept in stats) {
      const el = document.createElement("div");
      el.innerHTML = `
        <h3>${dept}</h3>
        <p>Всего задач: ${stats[dept].total}</p>
        <p>Выполнено: ${stats[dept].done}</p>
        <p>Просрочено: ${stats[dept].overdue}</p>
      `;
      departmentsStats.appendChild(el);
    }
  }

  // Общая аналитика
  if (analyticsPanel) {
    const tasks = await loadTasks();
    const total = tasks.length;
    const done = tasks.filter(t => t.status === "выполнена").length;
    const overdue = tasks.filter(t => t.status === "просрочена").length;

    analyticsPanel.innerHTML = `
      <h2>Общая статистика</h2>
      <p>Всего обращений: ${total}</p>
      <p>Выполнено: ${done}</p>
      <p>Просрочено: ${overdue}</p>
    `;
  }

  // Управление задачами
  if (taskManagerList && statusSummary) {
    async function updateSummary(tasks) {
      const total = tasks.length;
      const done = tasks.filter(t => t.status === "выполнена").length;
      const overdue = tasks.filter(t => t.status === "просрочена").length;
      const active = total - done - overdue;

      statusSummary.innerHTML = `
        <strong>Всего:</strong> ${total} |
        <strong>Выполнено:</strong> ${done} |
        <strong>Просрочено:</strong> ${overdue} |
        <strong>В процессе:</strong> ${active}
      `;
    }

    async function renderManagerTasks() {
      const tasks = await loadTasks();
      taskManagerList.innerHTML = "";
      await updateSummary(tasks);

      tasks.forEach(task => {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";

        const info = document.createElement("div");
        info.innerHTML = `<strong>[${task.department}]</strong> ${task.comment} — <em>${task.status}</em>`;

        const actions = document.createElement("div");

        const doneBtn = document.createElement("button");
        doneBtn.textContent = "✅ Выполнено";
        doneBtn.onclick = async () => {
          await updateTaskStatus(task.id, "выполнена");
          renderManagerTasks();
        };

        const lateBtn = document.createElement("button");
        lateBtn.textContent = "⚠️ Просрочена";
        lateBtn.onclick = async () => {
          await updateTaskStatus(task.id, "просрочена");
          renderManagerTasks();
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑️ Удалить";
        deleteBtn.onclick = async () => {
          await deleteTask(task.id);
          renderManagerTasks();
        };

        [doneBtn, lateBtn, deleteBtn].forEach(btn => {
          btn.style.marginLeft = "5px";
          btn.style.padding = "5px";
          btn.style.border = "none";
          btn.style.borderRadius = "4px";
          btn.style.cursor = "pointer";
        });

        actions.appendChild(doneBtn);
        actions.appendChild(lateBtn);
        actions.appendChild(deleteBtn);

        div.appendChild(info);
        div.appendChild(actions);
        div.classList.add("task-item");
        taskManagerList.appendChild(div);
      });
    }

    renderManagerTasks();
  }

  // Навигация активная
  document.querySelectorAll(".nav-link").forEach(link => {
    if (window.location.href.includes(link.getAttribute("href"))) {
      link.style.background = "rgba(255, 255, 255, 0.3)";
    }
  });
});
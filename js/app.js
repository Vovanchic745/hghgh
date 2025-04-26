function loadTasks() {
    return JSON.parse(localStorage.getItem("tasks") || "[]");
  }
  
  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  
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
  
  if (document.getElementById("taskForm")) {
    const form = document.getElementById("taskForm");
    const list = document.getElementById("taskList");
  
    form.addEventListener("submit", function (e) {
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
  
      const tasks = loadTasks();
      tasks.push(task);
      saveTasks(tasks);
      commentInput.value = "";
      renderTaskList();
    });
  
    function renderTaskList() {
      const tasks = loadTasks();
      list.innerHTML = "";
      tasks.forEach(task => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>[${task.department}]</strong> ${task.comment} — <em>${task.status}</em>`;
        list.appendChild(div);
      });
    }
  
    renderTaskList();
  }
  
  if (document.getElementById("departmentsStats")) {
    const container = document.getElementById("departmentsStats");
    const tasks = loadTasks();
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
      container.appendChild(el);
    }
  }
  
  if (document.getElementById("analyticsPanel")) {
    const panel = document.getElementById("analyticsPanel");
    const tasks = loadTasks();
  
    const total = tasks.length;
    const done = tasks.filter(t => t.status === "выполнена").length;
    const overdue = tasks.filter(t => t.status === "просрочена").length;
  
    panel.innerHTML = `
      <h2>Общая статистика</h2>
      <p>Всего обращений: ${total}</p>
      <p>Выполнено: ${done}</p>
      <p>Просрочено: ${overdue}</p>
    `;
  }
  
  if (document.getElementById("taskManagerList")) {
    const container = document.getElementById("taskManagerList");
    const statusSummary = document.getElementById("statusSummary");
  
    function updateSummary(tasks) {
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
  
    function renderManagerTasks() {
      const tasks = loadTasks();
      container.innerHTML = "";
      updateSummary(tasks);
  
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
        doneBtn.onclick = () => updateTaskStatus(task.id, "выполнена");
  
        const lateBtn = document.createElement("button");
        lateBtn.textContent = "⚠️ Просрочена";
        lateBtn.onclick = () => updateTaskStatus(task.id, "просрочена");
  
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑️ Удалить";
        deleteBtn.onclick = () => deleteTask(task.id);
  
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
        container.appendChild(div);
      });
    }
  
    function updateTaskStatus(id, newStatus) {
      const tasks = loadTasks().map(task =>
        task.id === id ? { ...task, status: newStatus } : task
      );
      saveTasks(tasks);
      renderManagerTasks();
    }
  
    function deleteTask(id) {
      const tasks = loadTasks().filter(task => task.id !== id);
      saveTasks(tasks);
      renderManagerTasks();
    }
  
    renderManagerTasks();
  }
  document.querySelectorAll(".nav-link").forEach(link => {
    if (window.location.href.includes(link.getAttribute("href"))) {
      link.style.background = "rgba(255, 255, 255, 0.3)";
    }
  });
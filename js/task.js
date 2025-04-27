const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  const taskId = Date.now();
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push({ id: taskId, text: taskText, completed: false });
  localStorage.setItem("tasks", JSON.stringify(tasks));

  displayTask(taskText, taskId, false);
  taskInput.value = "";
}

function displayTask(taskText, id, completed) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.classList.add(completed ? "completed" : "pending"); // Add class based on completion status

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = completed;
  checkbox.addEventListener("change", () => toggleCompletion(id));

  const taskSpan = document.createElement("span");
  taskSpan.textContent = taskText;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "×"; // Cross symbol for delete
  deleteBtn.addEventListener("click", () => deleteTask(id));

  li.appendChild(checkbox);
  li.appendChild(taskSpan);
  li.appendChild(deleteBtn);

  // Append completed tasks to the end, and pending tasks to the top
  if (completed) {
    taskList.appendChild(li); // Add to the end for completed tasks
  } else {
    taskList.prepend(li); // Add to the top for pending tasks
  }
}

function toggleCompletion(id) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const updatedTasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));

  // Clear and reload the task list to reflect the updated status
  taskList.innerHTML = "";
  updatedTasks.forEach((task) => {
    displayTask(task.text, task.id, task.completed);
  });
}

function deleteTask(id) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const updatedTasks = tasks.filter((task) => task.id !== id);
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  taskList.innerHTML = "";
  updatedTasks.forEach((task) =>
    displayTask(task.text, task.id, task.completed)
  );
}

addTaskBtn.addEventListener("click", addTask);

// Load tasks from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach((task) => displayTask(task.text, task.id, task.completed));
});

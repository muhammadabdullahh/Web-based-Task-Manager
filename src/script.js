document.addEventListener('DOMContentLoaded', function() {
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');
  const filterButtons = document.getElementById('filter-buttons');
  const clearCompletedButton = document.getElementById('clear-completed-btn');
  const undoContainer = document.getElementById('undo-container');
  const undoButton = document.getElementById('undo-btn');

  let tasks = [];
  let deletedTask = null;

  taskForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const description = taskInput.value.trim();

    if (description !== '') {
      const task = {
        id: Date.now(),
        description,
        completed: false
      };

      tasks.push(task);
      taskList.appendChild(createTaskItem(task));
      saveTasks();
      updateTaskCount();

      taskInput.value = '';
      taskInput.focus();
    }
  });

  taskList.addEventListener('click', function(event) {
    const target = event.target;

    if (target.classList.contains('delete-button')) {
      const taskItem = target.closest('.task-item');
      const taskId = +taskItem.getAttribute('data-id');

      deleteTask(taskId);
    } else if (target.classList.contains('complete-checkbox')) {
      const taskItem = target.closest('.task-item');
      const taskId = +taskItem.getAttribute('data-id');
      const completed = target.checked;

      updateTaskCompletion(taskId, completed);
    }
  });

  filterButtons.addEventListener('click', function(event) {
    const target = event.target;

    if (target.tagName === 'BUTTON') {
      const filter = target.getAttribute('data-filter');
      filterTasks(filter);
    }
  });

  clearCompletedButton.addEventListener('click', function() {
    tasks = tasks.filter(task => !task.completed);
    taskList.innerHTML = '';
    saveTasks();
    updateTaskCount();
  });

  undoButton.addEventListener('click', function() {
    if (deletedTask) {
      tasks.push(deletedTask);
      taskList.appendChild(createTaskItem(deletedTask));
      deletedTask = null;
      undoButton.disabled = true;
      saveTasks();
      updateTaskCount();
    }
  });

  function createTaskItem(task) {
    const taskItem = document.createElement('li');
    taskItem.classList.add('task-item');
    taskItem.setAttribute('data-id', task.id);

    const descriptionElement = document.createElement('span');
    descriptionElement.classList.add('task-description');
    descriptionElement.textContent = task.description;

    const actionsElement = document.createElement('div');
    actionsElement.classList.add('task-actions');

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.textContent = 'Delete';

    const completeCheckbox = document.createElement('input');
    completeCheckbox.type = 'checkbox';
    completeCheckbox.classList.add('complete-checkbox');
    completeCheckbox.checked = task.completed;

    actionsElement.appendChild(completeCheckbox);
    actionsElement.appendChild(deleteButton);

    taskItem.appendChild(descriptionElement);
    taskItem.appendChild(actionsElement);

    if (task.completed) {
      taskItem.classList.add('completed');
    }

    return taskItem;
  }

  function deleteTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
      const [task] = tasks.splice(taskIndex, 1);
      const taskItem = taskList.querySelector(`[data-id="${task.id}"]`);

      deletedTask = task;
      taskList.removeChild(taskItem);
      undoButton.disabled = false;

      saveTasks();
      updateTaskCount();
    }
  }

  function updateTaskCompletion(taskId, completed) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
      tasks[taskIndex].completed = completed;
      const taskItem = taskList.querySelector(`[data-id="${taskId}"]`);

      if (completed) {
        taskItem.classList.add('completed');
      } else {
        taskItem.classList.remove('completed');
      }

      saveTasks();
      updateTaskCount();
    }
  }

  function filterTasks(filter) {
    const taskItems = taskList.getElementsByClassName('task-item');

    Array.from(taskItems).forEach(taskItem => {
      const completed = taskItem.classList.contains('completed');

      switch (filter) {
        case 'all':
          taskItem.style.display = 'flex';
          break;
        case 'active':
          taskItem.style.display = completed ? 'none' : 'flex';
          break;
        case 'completed':
          taskItem.style.display = completed ? 'flex' : 'none';
          break;
        default:
          taskItem.style.display = 'flex';
      }
    });
  }

  function saveTasks() {
    localStorage.setItem('task_manager_tasks', JSON.stringify(tasks));
  }

  function loadTasks() {
    const savedTasks = localStorage.getItem('task_manager_tasks');

    if (savedTasks) {
      tasks = JSON.parse(savedTasks);

      tasks.forEach(task => {
        const taskItem = createTaskItem(task);
        taskList.appendChild(taskItem);
      });
    }
  }

  function updateTaskCount() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    const taskCountElement = document.getElementById('task-count');

    taskCountElement.textContent = `Total tasks: ${tasks.length} | Active tasks: ${activeTasks}`;
  }

  loadTasks();
  updateTaskCount();
});

//Selectors
(() => {
  const createTodoInput = document.querySelector("#todo-input");
  const createTaskButton = document.querySelector("#todo-add-button");
  const todoListUL = document.querySelector("#todo-list-ul");
  const checkAllTasksButton = document.querySelector("#all-tasks-done");
  const deleteAllTasksButton = document.querySelector("#delete-all-done");
  const filterBtnsContainer = document.querySelector("#filter-btns-container");
  const paginationContainer = document.querySelector("#pagination-container");
  const alertMessageContainer = document.querySelector(
    "#alert-message-container"
  );

  // Constants

  let TODOS = [];
  let CURRENT_PAGE = 1;
  let FILTER_QUERY = "all";
  const API_BASE = "/api/";
  const URLS = {
    todos: `${API_BASE}todos/`,
    completeAll: `${API_BASE}todos/complete_all/`
  };
  const TODOS_PER_PAGE = 5;
  const BUTTON_KEYS = {
    enter: "Enter",
    escape: "Escape",
  };
  const TODO_ITEM_ELEMENTS = {
    container: {
      tag: "li",
      class: ["list-group-item", "task"],
      name: "todo-item",
    },
    text: {
      tag: "span",
      class: ["form-check-label", "task-text"],
      name: "todo-text",
    },
    check: {
      tag: "input",
      class: ["form-check-input", "check-task-done"],
      name: "todo-check",
    },
    delete: {
      tag: "button",
      class: ["btn", "btn-danger", "btn-sm", "delete-button"],
      name: "todo-delete",
    },
    change: {
      tag: "input",
      class: [],
      name: "todo-change",
    },
  };

  const FILTER_BUTTONS = {
    all: {
      tag: "button",
      class: ["btn", "btn-outline-primary"],
      name: "all",
    },
    active: {
      tag: "button",
      class: ["btn", "btn-outline-primary"],
      name: "active",
    },
    completed: {
      tag: "button",
      class: ["btn", "btn-outline-primary"],
      name: "completed",
    },
  };

  //Functions

  const showAlertMessage = (message) => {
    alertMessageContainer.textContent = message;
    alertMessageContainer.classList.remove("fade");
    setTimeout(() => {
      alertMessageContainer.textContent = "";
      alertMessageContainer.classList.add("fade");
    }, 3000);
  };

  const trimText = (string) => {
    return string.trim().replace(/\s+/g, " ");
  };

  const createItem = (obj) => {
    const element = document.createElement(obj.tag);

    element.setAttribute("data-name", obj.name);
    element.classList.add(...obj.class);

    return element;
  };

  const filterTasks = () => {
    switch (FILTER_QUERY) {
    case FILTER_BUTTONS.all.name:
      return [...TODOS];
    case FILTER_BUTTONS.active.name:
      return TODOS.filter((item) => !item.is_completed);
    case FILTER_BUTTONS.completed.name:
      return TODOS.filter((item) => item.is_completed);
    default:
      return [...TODOS];
    }
  };

  const getPagesTotalNumber = () => {
    const filteredTodos = filterTasks();
    return Math.ceil(filteredTodos.length / TODOS_PER_PAGE);
  };

  const changePageNumber = () => {
    const pagesTotalNumber = getPagesTotalNumber();

    if (CURRENT_PAGE >= pagesTotalNumber) {
      CURRENT_PAGE = pagesTotalNumber;
    } else CURRENT_PAGE = 1;
  };

  const renderPages = () => {
    const pagesTotalNumber = getPagesTotalNumber();
    const pagesArray = Array.from(
      { length: pagesTotalNumber },
      (_, index) => index + 1
    );

    paginationContainer.innerHTML = "";
    pagesArray.map((number) => {
      const page = createItem({
        tag: "li",
        class: ["page-item", "page-link"],
        name: "page",
      });

      page.id = number;
      Number(page.id) === CURRENT_PAGE
        ? page.classList.add("active")
        : page.classList.remove("active");
      page.innerHTML = number;
      paginationContainer.append(page);
    });
  };

  const getPageSlice = (todosArray) => {
    const lastIndex = CURRENT_PAGE * TODOS_PER_PAGE;
    const firstIndex = lastIndex - TODOS_PER_PAGE;
    return todosArray.slice(firstIndex, lastIndex);
  };

  const renderFilterButtons = () => {
    const allTodosBtn = createItem(FILTER_BUTTONS.all);
    const activeTodosBtn = createItem(FILTER_BUTTONS.active);
    const completedTodosBtn = createItem(FILTER_BUTTONS.completed);
    const all = TODOS.length;
    const active = TODOS.reduce((total, item) => total + !item.is_completed, 0);
    const completed = all - active;

    allTodosBtn.innerText = `All(${all})`;
    activeTodosBtn.innerText = `Active(${active})`;
    completedTodosBtn.innerText = `Completed(${completed})`;

    switch (FILTER_QUERY) {
    case FILTER_BUTTONS.all.name:
      allTodosBtn.classList.add("active");
      break;
    case FILTER_BUTTONS.active.name:
      activeTodosBtn.classList.add("active");
      break;
    case FILTER_BUTTONS.completed.name:
      completedTodosBtn.classList.add("active");
      break;
    }

    filterBtnsContainer.innerHTML = "";
    filterBtnsContainer.append(allTodosBtn, activeTodosBtn, completedTodosBtn);
  };

  const changeStateAll = () => {
    if (TODOS.length && !!TODOS.every((item) => item.is_completed)) {
      checkAllTasksButton.checked = true;
    } else checkAllTasksButton.checked = false;
  };

  const renderTodoItems = () => {
    todoListUL.innerHTML = "";
    const filteredTodos = filterTasks();
    const slicedTodos = getPageSlice(filteredTodos);

    slicedTodos.map((item) => {
      const todoItem = createItem(TODO_ITEM_ELEMENTS.container);
      todoItem.setAttribute("id", item.id);
      const text = createItem(TODO_ITEM_ELEMENTS.text);
      text.innerText = item.title;
      const checkBox = createItem(TODO_ITEM_ELEMENTS.check);
      checkBox.setAttribute("type", "checkbox");
      if (item.is_completed) checkBox.checked = true;
      const deleteButton = createItem(TODO_ITEM_ELEMENTS.delete);
      deleteButton.setAttribute("type", "button");
      deleteButton.innerHTML = "X";
      todoItem.append(checkBox, text, deleteButton);
      todoListUL.append(todoItem);
    });

    changeStateAll();
    renderFilterButtons();
    renderPages();
  };

  const getData = async () => {
    await fetch(URLS.todos, {
      method: "GET",
    })
      .then((response) => {
        const answer = response.json();
        if (response.status === 200) {
          return answer;
        } else {
          throw new Error(answer);
        }
      })
      .then((data) => {
        TODOS = data;
        CURRENT_PAGE = getPagesTotalNumber();
        changePageNumber();
        renderTodoItems();
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  const postData = async (data) => {
    await fetch(URLS.todos, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((answer) => {
        if (!answer.id) {
          throw new Error(answer.title[0]);
        }
      })
      .catch((error) => {
        showAlertMessage(error);
      })
      .then(() => getData());
  };

  const deleteData = async (id) => {
    await fetch(`${URLS.todos}${id}/`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.status !== 204) throw new Error(response.json());
      })
      .then(() => getData())
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  const patchData = async (id, data) => {
    await fetch(`${URLS.todos}${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        console.log(response.status);
        if (response.status !== 200 && response.status !==204) {
          return response.json();
        }
      })
      .then((answer) => {
        if (answer && !answer.id) {
          throw new Error(answer.title[0]);
        }
      })
      .catch((error) => {
        showAlertMessage(error);
      })
      .then(() => getData());
  };

  const createTask = () => {
    const text = trimText(createTodoInput.value);
    if (!text) return;
    postData({
      title: text,
      is_completed: false,
    });
    createTodoInput.value = "";
    FILTER_QUERY = FILTER_BUTTONS.all.name;

    renderFilterButtons();
  };

  const checkEnter = (e) => {
    if (e.key === BUTTON_KEYS.enter) {
      createTask(e);
    }
  };

  const checkDoneTask = (taskId) => {
    const item = TODOS.find((item) => item.id === taskId);
    patchData(taskId, { is_completed: !item.is_completed });
  };

  const deleteTask = (taskId) => {
    deleteData(taskId);
  };

  const editTask = (e) => {
    e.preventDefault;
    if (e.target.dataset.name === TODO_ITEM_ELEMENTS.text.name) {
      const span = e.target;
      const li = span.parentNode;
      const text = span.innerText;
      const input = createItem(TODO_ITEM_ELEMENTS.change);

      input.setAttribute("maxlength", "255");
      input.style.width = `${span.scrollWidth}px`;
      input.value = text;
      li.innerHTML = "";
      li.append(input);
      input.focus();
    }
  };

  const checkTarget = (e) => {
    const taskId = Number(e.target.closest("li").id);
    switch (e.target.dataset.name) {
    case TODO_ITEM_ELEMENTS.check.name:
      checkDoneTask(taskId);
      break;
    case TODO_ITEM_ELEMENTS.delete.name:
      deleteTask(taskId);
      break;
    case TODO_ITEM_ELEMENTS.text.name:
      if (e.detail === 2) editTask(e);
      break;
    }
  };

  const checkDoneAllTasks = async () => {
    const state = checkAllTasksButton.checked;
    await fetch(URLS.completeAll, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ is_completed: state })
})
  };

  const changeText = (taskId, text) => {
    const trimedText = trimText(text);
    const item = TODOS.find((item) => item.id === taskId);

    if (!trimedText || trimedText === item.title) {
      renderTodoItems();
      return;
    } else patchData(taskId, { title: text });
  };

  const deleteAllDoneTasks = () => {
    deleteData("delete");
  };

  const submitChanges = (e) => {
    if (e.target.dataset.name === TODO_ITEM_ELEMENTS.change.name) {
      const text = e.target.value;
      const taskId = Number(e.target.closest("li").id);

      switch (e.key) {
      case BUTTON_KEYS.enter:
        changeText(taskId, text);
        break;
      case BUTTON_KEYS.escape:
        renderTodoItems();
        break;
      }

      if (e.type === "blur" && e.sourceCapabilities) {
        changeText(taskId, text);
      }
    }
  };

  const changeFilterQuery = (e) => {
    FILTER_QUERY = e.target.dataset.name;
    renderFilterButtons();
    CURRENT_PAGE = 1;
    renderTodoItems();
  };

  const setPage = (e) => {
    if (e.target.dataset.name === "page") {
      CURRENT_PAGE = Number(e.target.innerHTML);
      renderTodoItems();
    }
  };

  //EventListeners
  document.addEventListener("DOMContentLoaded", getData);
  createTaskButton.addEventListener("click", createTask);
  createTodoInput.addEventListener("keydown", checkEnter);
  todoListUL.addEventListener("click", checkTarget);
  todoListUL.addEventListener("blur", submitChanges, true);
  todoListUL.addEventListener("keydown", submitChanges);
  checkAllTasksButton.addEventListener("click", checkDoneAllTasks);
  deleteAllTasksButton.addEventListener("click", deleteAllDoneTasks);
  filterBtnsContainer.addEventListener("click", changeFilterQuery);
  paginationContainer.addEventListener("click", setPage);
})();

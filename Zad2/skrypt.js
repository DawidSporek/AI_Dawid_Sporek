const STORAGE_KEY = 'todo_tasks_v1';

function addTask(event) {
    event.preventDefault(); 
    
    const taskInput = document.getElementById("task");
    const dueDateInput = document.getElementById("due-date");
    const taskList = document.getElementById("task-list");

    const taskText = taskInput.value.trim();
    const dueDateVal = dueDateInput.value; 
    
    if (taskText.length < 3 || taskText.length > 255) {
        alert("Zadanie musi mieć od 3 do 255 znaków.");
        return;
    }

    if (dueDateVal) {
        const dueIso = localInputToISO(dueDateVal);
        if (new Date(dueIso) <= new Date()) {
            alert("Termin musi być w przyszłości.");
            return;
        }
 
        var dueIsoFinal = dueIso;
    } else {
        var dueIsoFinal = null;
    }

    const taskObj = {
        id: Date.now(),
        text: taskText,
        dueDate: dueIsoFinal,
        completed: false
    };

    const li = createTaskElement(taskObj);
    taskList.appendChild(li);

    taskInput.value = "";
    dueDateInput.value = "";

    saveTasks();
}

function createTaskElement(task) {
    const li = document.createElement("li");
    li.dataset.id = task.id;

    const content = document.createElement("div");
    content.className = "task-content";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!task.completed;
    checkbox.addEventListener("change", (e) => {
        toggleTaskCompletion(li);
        e.stopPropagation();
    });

    const span = document.createElement("span");
    span.textContent = task.text;


    let small = null;
    if (task.dueDate) {
        small = document.createElement("small");
        small.dataset.iso = task.dueDate; 
        small.textContent = `  - ${new Date(task.dueDate).toLocaleString()}`;

        small.addEventListener("click", (e) => {
            e.stopPropagation();
            startEditingDate(li, small);
        });
    }

    const controls = document.createElement("div");
    controls.className = "task-controls";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.title = "Usuń zadanie";
    deleteBtn.textContent = "🗑️";
    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm("Usunąć to zadanie?")) {
            li.remove();
            saveTasks();
        }
    });

    content.appendChild(span);
    if (small) content.appendChild(small);

    li.appendChild(checkbox);
    li.appendChild(content);
    controls.appendChild(deleteBtn);
    li.appendChild(controls);

    if (task.completed) {
        li.classList.add("completed");
    }

    li.addEventListener("click", (e) => {
        if (e.target === checkbox || e.target === deleteBtn) return;
        startEditing(li, span);
    });

    return li;
}

function toggleTaskCompletion(li) {
    li.classList.toggle("completed");
    const cb = li.querySelector('input[type="checkbox"]');
    if (cb) cb.checked = li.classList.contains("completed");
    saveTasks();
}

function startEditing(li, span) {
    if (li.classList.contains("editing")) return;
    li.classList.add("editing");

    const originalText = span.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-input";
    input.value = originalText;
    input.maxLength = 255;

    const content = span.parentElement;
    content.replaceChild(input, span);
    input.focus();
    input.select();

    function save() {
        const newText = input.value.trim();
        if (newText.length < 3 || newText.length > 255) {
            alert("Zadanie musi mieć od 3 do 255 znaków.");
            input.focus();
            return false;
        }
        span.textContent = newText;
        content.replaceChild(span, input);
        li.classList.remove("editing");
        saveTasks();
        return true;
    }

    function cancel() {
        content.replaceChild(span, input);
        li.classList.remove("editing");
    }

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            save();
        } else if (e.key === "Escape") {
            e.preventDefault();
            cancel();
        }
    });

    input.addEventListener("blur", () => {
        setTimeout(() => {
            if (document.activeElement !== input) {
                save();
            }
        }, 0);
    });
}

function isoToLocalInput(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToISO(val) {
    if (!val) return null;
    const [datePart, timePart = '00:00'] = val.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm, ss] = (timePart.split(':').map(Number).concat([0,0,0])).slice(0,3);
    const dt = new Date(y, m - 1, d, hh, mm, ss);
    return dt.toISOString();
}

function startEditingDate(li, small) {
    if (li.classList.contains("editing-date")) return;
    li.classList.add("editing-date");

    const originalSmall = small || null; 
    const originalIso = originalSmall ? originalSmall.dataset.iso || '' : '';
    const input = document.createElement("input");
    input.type = "datetime-local";
    input.className = "edit-input";
    input.value = isoToLocalInput(originalIso);

    const content = (originalSmall ? originalSmall.parentElement : li.querySelector('.task-content'));
    if (originalSmall && content) {
        content.replaceChild(input, originalSmall);
    } else if (content) {
        content.appendChild(input);
    }

    input.focus();

    function save() {
        const val = input.value.trim();
        if (!val) {
            if (originalSmall && content.contains(input)) {
                content.removeChild(input);
            } else if (content.contains(input)) {
                content.removeChild(input);
            }
            li.classList.remove("editing-date");
            saveTasks();
            return;
        }
        const newIso = localInputToISO(val);
        if (newIso && new Date(newIso) <= new Date()) {
            alert("Termin musi być w przyszłości.");
            input.focus();
            return;
        }

        if (originalSmall) {
            originalSmall.dataset.iso = newIso;
            originalSmall.textContent = `  - ${new Date(newIso).toLocaleString()}`;
            if (content.contains(input)) content.replaceChild(originalSmall, input);
        } else {
            const newSmall = document.createElement("small");
            newSmall.dataset.iso = newIso;
            newSmall.textContent = `  - ${new Date(newIso).toLocaleString()}`;
            newSmall.addEventListener("click", (e) => {
                e.stopPropagation();
                startEditingDate(li, newSmall);
            });
            if (content.contains(input)) content.replaceChild(newSmall, input);
            else content.appendChild(newSmall);
        }

        li.classList.remove("editing-date");
        saveTasks();
    }

    function cancel() {
        if (originalSmall) {
            if (content.contains(input)) content.replaceChild(originalSmall, input);
        } else {
            if (content.contains(input)) content.removeChild(input);
        }
        li.classList.remove("editing-date");
    }

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            save();
        } else if (e.key === "Escape") {
            e.preventDefault();
            cancel();
        }
    });

    input.addEventListener("blur", () => {
        setTimeout(() => {
            if (document.activeElement !== input) {
                save();
            }
        }, 0);
    });
}
function searchTasks() {
    const raw = document.getElementById('search').value || '';
    const query = raw.trim();
    const tasks = document.querySelectorAll('#task-list li');

    if (query.length < 2) {
        tasks.forEach(task => {
            task.style.display = '';
            removeHighlight(task);
        });
        return;
    }

    const qLower = query.toLowerCase();

    tasks.forEach(task => {
        const span = task.querySelector('.task-content > span');
        const text = span ? span.textContent : '';
        const textLower = text.toLowerCase();

        if (textLower.includes(qLower)) {
            task.style.display = '';
            removeHighlight(task);
            highlightSearchText(task, query);
        } else {
            task.style.display = 'none';
            removeHighlight(task);
        }
    });
}

function highlightSearchText(task, searchInput) {
    const taskTextElement = task.querySelector('.task-content > span');
    if (!taskTextElement) return;
    const taskText = taskTextElement.textContent;

    if (!searchInput || searchInput.length < 2) {
        taskTextElement.innerHTML = taskText;
        return;
    }

    const regex = new RegExp(`(${escapeRegExp(searchInput)})`, 'gi');
    const highlightedText = taskText.replace(regex, '<mark>$1</mark>');
    
    taskTextElement.innerHTML = highlightedText; 
}
function removeHighlight(task) {
    const taskTextElement = task.querySelector('.task-content > span');
    if (!taskTextElement) return;
    const taskText = taskTextElement.textContent; 
    
    taskTextElement.innerHTML = taskText;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#task-list li').forEach(li => {
        const id = li.dataset.id ? Number(li.dataset.id) : Date.now();
        const span = li.querySelector('.task-content > span');
        const text = span ? span.textContent : '';
        const small = li.querySelector('.task-content > small');
        const dueDate = small ? (small.dataset.iso || null) : null;
        const completed = li.classList.contains('completed') || !!li.querySelector('input[type="checkbox"]')?.checked;
        tasks.push({ id, text, dueDate, completed });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    let tasks = [];
    try {
        tasks = JSON.parse(raw);
    } catch (e) {
        console.error('Błąd parsowania LocalStorage:', e);
        return;
    }
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = '';
    tasks.forEach(t => {
        const li = createTaskElement(t);
        taskList.appendChild(li);
    });
}


document.getElementById("task-form").addEventListener("submit", addTask);
document.addEventListener('DOMContentLoaded', loadTasks);

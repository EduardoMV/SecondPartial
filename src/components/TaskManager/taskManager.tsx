"use client";

import { useState, useEffect } from "react";
import styles from "./taskManager.module.scss";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  isEditing: boolean;
}

interface TaskList {
  id: number;
  name: string;
  tasks: Task[];
}

const TaskManager = () => {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [newTask, setNewTask] = useState<string>("");
  const [newListName, setNewListName] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [editingText, setEditingText] = useState<string>("");

  // Load task lists from localStorage on component mount
  useEffect(() => {
    const savedTaskLists = localStorage.getItem("taskLists");
    if (savedTaskLists) {
      try {
        setTaskLists(JSON.parse(savedTaskLists));
      } catch (error) {
        console.error("Failed to parse task lists from localStorage", error);
      }
    }
  }, []); // Runs only once when the component mounts

  // Save task lists to localStorage whenever they change
  useEffect(() => {
    if (taskLists.length > 0) {
      localStorage.setItem("taskLists", JSON.stringify(taskLists));
    }
  }, [taskLists]);

  const addTaskList = () => {
    if (newListName.trim()) {
      const newList = { id: Date.now(), name: newListName, tasks: [] };
      setTaskLists((prevTaskLists) => [...prevTaskLists, newList]);
      setNewListName("");
    }
  };

  const selectTaskList = (id: number) => {
    setSelectedListId(id);
  };

  const selectedTaskList = taskLists.find((list) => list.id === selectedListId);

  const addTask = () => {
    if (newTask.trim() && selectedListId !== null) {
      setTaskLists(
        taskLists.map((list) =>
          list.id === selectedListId
            ? {
                ...list,
                tasks: [
                  ...list.tasks,
                  {
                    id: Date.now(),
                    text: newTask,
                    completed: false,
                    isEditing: false,
                  },
                ],
              }
            : list
        )
      );
      setNewTask("");
    }
  };

  const filteredTasks =
    selectedTaskList?.tasks.filter((task) => {
      if (filter === "completed") return task.completed;
      if (filter === "pending") return !task.completed;
      return true;
    }) || [];

  const enableEditing = (listId: number, taskId: number, currentText: string) => {
    setTaskLists(
      taskLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.map((task) =>
                task.id === taskId ? { ...task, isEditing: true } : task
              ),
            }
          : list
      )
    );
    setEditingText(currentText); // Set initial value for editing
  };

  const saveTask = (listId: number, taskId: number) => {
    setTaskLists(
      taskLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, text: editingText, isEditing: false }
                  : task
              ),
            }
          : list
      )
    );
    setEditingText(""); // Clear editing state
  };

  const cancelEditing = (listId: number, taskId: number) => {
    setTaskLists(
      taskLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.map((task) =>
                task.id === taskId ? { ...task, isEditing: false } : task
              ),
            }
          : list
      )
    );
    setEditingText(""); // Clear editing state
  };

  const deleteTask = (listId: number, taskId: number) => {
    setTaskLists(
      taskLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.filter((task) => task.id !== taskId),
            }
          : list
      )
    );
  };

  const deleteTaskList = (listId: number) => {
    // Remove the task list with the specified ID
    setTaskLists(taskLists.filter((list) => list.id !== listId));

    // If the deleted list was selected, clear the selection
    if (selectedListId === listId) {
      setSelectedListId(null);
    }
  };

  const toggleCompletion = (listId: number, taskId: number) => {
    setTaskLists(
      taskLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
            }
          : list
      )
    );
  };

  const handleListNavigation = (e: React.KeyboardEvent<HTMLLIElement>, listId: number) => {
    const currentIndex = taskLists.findIndex((list) => list.id === listId);
  
    if (e.key === "ArrowUp") {
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        setSelectedListId(taskLists[prevIndex].id);
        document.querySelectorAll("li")[prevIndex]?.focus();
      }
    } else if (e.key === "ArrowDown") {
      const nextIndex = currentIndex + 1;
      if (nextIndex < taskLists.length) {
        setSelectedListId(taskLists[nextIndex].id);
        // Enfocar la siguiente lista
        document.querySelectorAll("li")[nextIndex]?.focus();
      }
    } else if(e.key === "Enter" || e.key === "ArrowRight") {
      selectTaskList(listId);

      console.log("entre en el if")

      setTimeout(() => {
        const firstTaskItem = document.querySelectorAll("ul." + styles.taskList + " li.taskItem")[0];
        if (firstTaskItem) {
          (firstTaskItem as HTMLElement)?.focus();
          console.log("entre en el enfoque");
        }
      }, 0); 
    }
  };
  
  const handleTaskNavigation = (e: React.KeyboardEvent<HTMLLIElement>, taskId: number) => {
    const tasks = selectedTaskList?.tasks || [];
    const currentIndex = tasks.findIndex((task) => task.id === taskId);
  
    // Seleccionar todos los elementos `li` que representan las tareas de la lista actual
    const taskItems = document.querySelectorAll("ul." + styles.taskItem + " li.taskItem");
  
    if (e.key === "ArrowUp") {
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        // Enfocar la tarea anterior
        (taskItems[prevIndex] as HTMLElement)?.focus();
        console.log("task", taskItems[prevIndex]);
      }
    } else if (e.key === "ArrowDown") {
      const nextIndex = currentIndex + 1;
      if (nextIndex < tasks.length) {
        // Enfocar la siguiente tarea
        (taskItems[nextIndex] as HTMLElement)?.focus();
        console.log("task", taskItems[nextIndex]);
      }
    }
  };  

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>Task Lists</h2>
        <ul>
          {taskLists.map((list) => (
            <li
            key={list.id}
            className={selectedListId === list.id ? styles.selectedList : ""}
            tabIndex={0}  // Hacer la lista enfocable
            onClick={() => selectTaskList(list.id)}
            onKeyDown={(e) => handleListNavigation(e, list.id)}
            >
              <span onClick={() => selectTaskList(list.id)}>{list.name}</span>
              <button
                onClick={() => deleteTaskList(list.id)}
                className={styles["button-delete-list"]}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="New List Name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTaskList();
            }
          }}
          className={styles.input}
        />
        <button onClick={addTaskList} className={styles.button}>
          Add List
        </button>
      </div>

      <div className={styles.taskManager}>
        <h1>{selectedTaskList?.name || "Select a List"}</h1>
        <div className={styles.taskInput}>
          <input
            type="text"
            placeholder="Enter a new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTask();
              }
            }}
            className={styles.input}
          />
          <button onClick={addTask} className={styles.button}>
            Add Task
          </button>
        </div>

        <div className={styles.filters}>
          <button onClick={() => setFilter("all")} className={styles.button}>
            All
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={styles.button}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={styles.button}
          >
            Pending
          </button>
        </div>

        <ul className={styles.taskList}>
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className={`${styles.taskItem} ${task.completed ? styles.completed : ""}`}
              tabIndex={0}  // Hacer la tarea enfocable
              onKeyDown={(e) => handleTaskNavigation(e, task.id)}  // Manejar la navegación
            >
              {task.isEditing ? (
                <>
                  <input
                    type="text"
                    value={editingText} // Bind to editingText state
                    onChange={(e) => setEditingText(e.target.value)} // Update editingText
                    className={styles.input}
                  />

                  <button
                    onClick={() => saveTask(selectedListId!, task.id)}
                    className={styles.button}
                  >
                    Save
                  </button>

                  <button
                    onClick={() => cancelEditing(selectedListId!, task.id)}
                    className={styles.button}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span>{task.text}</span>
                  <button
                    onClick={() =>
                      enableEditing(selectedListId!, task.id, task.text)
                    }
                    className={styles["button-edit"]}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleCompletion(selectedListId!, task.id)}
                    className={styles["button-complete"]}
                  >
                    {task.completed ? "Mark as Pending" : "Mark as Completed"}
                  </button>
                  <button
                    onClick={() => deleteTask(selectedListId!, task.id)}
                    className={styles["button-delete"]}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskManager;

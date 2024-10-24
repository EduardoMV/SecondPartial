"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./taskManager.module.scss";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  isEditing: boolean;
  dueDate: Date | null;
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
  const [newTaskDate, setNewTaskDate] = useState<Date | null>(null);
  const [newListName, setNewListName] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [editingText, setEditingText] = useState<string>("");
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTaskLists = localStorage.getItem("taskLists");
    if (savedTaskLists) {
      try {
        const parsedTaskLists: TaskList[] = JSON.parse(savedTaskLists);
  
        const taskListsWithDates = parsedTaskLists.map((list) => ({
          ...list,
          tasks: list.tasks.map((task) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
          })),
        }));
  
        setTaskLists(taskListsWithDates);
      } catch (error) {
        console.error("Failed to parse task lists from localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: { key: string; }) => {
      if (event.key === "1") {
        setTheme("light");
        document.body.classList.remove(styles.darkMode);
        document.body.classList.add(styles.lightMode);
      } else if (event.key === "2") {
        setTheme("dark");
        document.body.classList.remove(styles.lightMode);
        document.body.classList.add(styles.darkMode);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
                    dueDate: newTaskDate,
                  },
                ],
              }
            : list
        )
      );
      setNewTask("");
      setNewTaskDate(null);
    }
  };

  const filteredTasks =
  selectedTaskList?.tasks
    .filter((task) => {
      if (filter === "completed") return task.completed;
      if (filter === "pending") return !task.completed;
      return true;
    })
    .sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate) : null;
      const dateB = b.dueDate ? new Date(b.dueDate) : null;

      if (dateA && dateB) {
        return dateB.getTime() - dateA.getTime();
      } else if (dateA) {
        return -1;
      } else if (dateB) {
        return 1;
      } else {
        return 0;
      }
    }) || [];

  const enableEditing = (
    listId: number,
    taskId: number,
    currentText: string,
    currentDueDate: Date | null
  ) => {
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
    setEditingText(currentText);
    setEditingDate(currentDueDate);
  };

  const saveTask = (listId: number, taskId: number) => {
    setTaskLists(
      taskLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      text: editingText,
                      isEditing: false,
                      dueDate: editingDate,
                    }
                  : task
              ),
            }
          : list
      )
    );
    setEditingText("");
    setEditingDate(null);
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
    setEditingText("");
    setEditingDate(null);
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
    setTaskLists(taskLists.filter((list) => list.id !== listId));

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

  const handleListNavigation = (
    e: React.KeyboardEvent<HTMLLIElement>,
    listId: number
  ) => {
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
        document.querySelectorAll("li")[nextIndex]?.focus();
      }
    } else if (e.key === "Enter" || e.key === "ArrowRight") {
      selectTaskList(listId);

      console.log("entre en el if");

      setTimeout(() => {
        const firstTaskItem = document.querySelectorAll(
          "ul." + styles.taskList + " li.taskItem"
        )[0];
        if (firstTaskItem) {
          (firstTaskItem as HTMLElement)?.focus();
          console.log("entre en el enfoque");
        }
      }, 0);
    }
  };

  const handleTaskNavigation = (
    e: React.KeyboardEvent<HTMLLIElement>,
    taskId: number
  ) => {
    const tasks = selectedTaskList?.tasks || [];
    const currentIndex = tasks.findIndex((task) => task.id === taskId);

    const taskItems = document.querySelectorAll(
      "ul." + styles.taskItem + " li.taskItem"
    );

    if (e.key === "ArrowUp") {
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        (taskItems[prevIndex] as HTMLElement)?.focus();
        console.log("task", taskItems[prevIndex]);
      }
    } else if (e.key === "ArrowDown") {
      const nextIndex = currentIndex + 1;
      if (nextIndex < tasks.length) {
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
              tabIndex={0}
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
          <DatePicker
            selected={newTaskDate}
            onChange={(date) => setNewTaskDate(date)}
            placeholderText="📅"
            className={styles.datePicker}
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
              className={`${styles.taskItem} ${
                task.completed ? styles.completed : ""
              }`}
              tabIndex={0}
              onKeyDown={(e) => handleTaskNavigation(e, task.id)}
            >
              {task.isEditing ? (
                <>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className={styles.input}
                  />
                  <DatePicker
                    selected={editingDate}
                    onChange={(date) => setEditingDate(date)}
                    className={styles.datePicker}
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
                  <span
                    className={styles.taskText}
                    onClick={() => toggleCompletion(selectedListId!, task.id)}
                  >
                    {task.text} (Due:{" "}
                    {task.dueDate && task.dueDate instanceof Date
                      ? task.dueDate.toLocaleDateString()
                      : "No due date"}
                    )
                  </span>
                  <button
                    onClick={() =>
                      enableEditing(
                        selectedListId!,
                        task.id,
                        task.text,
                        task.dueDate
                      )
                    }
                    className={styles.button}
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

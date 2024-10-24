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
  dueDate: Date | null; // Add dueDate field
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
  const [newTaskDate, setNewTaskDate] = useState<Date | null>(null); // State for new task date
  const [newListName, setNewListName] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [editingText, setEditingText] = useState<string>("");
  const [editingDate, setEditingDate] = useState<Date | null>(null); // State for editing date

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
                    dueDate: newTaskDate, // Set the selected due date
                  },
                ],
              }
            : list
        )
      );
      setNewTask("");
      setNewTaskDate(null); // Clear the date after adding the task
    }
  };

  const enableEditing = (listId: number, taskId: number, currentText: string, currentDueDate: Date | null) => {
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
    setEditingDate(currentDueDate); // Set initial value for date editing
  };

  const saveTask = (listId: number, taskId: number) => {
    setTaskLists(
      taskLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, text: editingText, isEditing: false, dueDate: editingDate }
                  : task
              ),
            }
          : list
      )
    );
    setEditingText(""); // Clear editing state
    setEditingDate(null); // Clear date state
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
    setEditingDate(null); // Clear date state
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

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>Task Lists</h2>
        <ul>
          {taskLists.map((list) => (
            <li
              key={list.id}
              className={selectedListId === list.id ? styles.selectedList : ""}
              onClick={() => selectTaskList(list.id)}
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
            className={styles.input}
          />
          <DatePicker
            selected={newTaskDate}
            onChange={(date) => setNewTaskDate(date)} // Set the new task's date
            placeholderText="Select due date"
            className={styles.datePicker}
          />
          <button onClick={addTask} className={styles.button}>
            Add Task
          </button>
        </div>

        <ul className={styles.taskList}>
          {selectedTaskList?.tasks.map((task) => (
            <li
              key={task.id}
              className={`${styles.taskItem} ${task.completed ? styles.completed : ""}`}
            >
              {task.isEditing ? (
                <>
                  <input
                    type="text"
                    value={editingText} // Bind to editingText state
                    onChange={(e) => setEditingText(e.target.value)} // Update editingText
                    className={styles.input}
                  />
                  <DatePicker
                    selected={editingDate}
                    onChange={(date) => setEditingDate(date)} // Update the task's date
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
                    {task.text} (Due: {task.dueDate ? task.dueDate.toLocaleDateString() : "No due date"})
                  </span>
                  <button
                    onClick={() => enableEditing(selectedListId!, task.id, task.text, task.dueDate)}
                    className={styles.button}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteTask(selectedListId!, task.id)}
                    className={styles.button}
                  >
                    🗑️
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

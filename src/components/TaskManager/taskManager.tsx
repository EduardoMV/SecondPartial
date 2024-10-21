"use client";

import { useState } from 'react';
import styles from './taskManager.module.scss';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  isEditing: boolean; // Add a flag for edit mode
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Function to add a new task
  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false, isEditing: false }]);
      setNewTask(''); // Clear input field
    }
  };

  // Function to enable editing for a task
  const enableEditing = (id: number) => {
    setTasks(tasks.map(task => (task.id === id ? { ...task, isEditing: true } : task)));
  };

  // Function to edit and save task
  const saveTask = (id: number, newText: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, text: newText, isEditing: false } : task
    );
    setTasks(updatedTasks);
  };

  // Function to cancel editing
  const cancelEditing = (id: number) => {
    setTasks(tasks.map(task => (task.id === id ? { ...task, isEditing: false } : task)));
  };

  // Function to delete a task
  const deleteTask = (id: number) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
  };

  // Function to toggle task completion
  const toggleCompletion = (id: number) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  // Filter tasks based on status
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Task Manager</h1>
      <div className={styles.taskInput}>
        <input
          type="text"
          placeholder="Enter a new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className={styles.input}
        />
        <button onClick={addTask} className={styles.button}>Add Task</button>
      </div>

      <div className={styles.filters}>
        <button onClick={() => setFilter('all')} className={styles.button}>All</button>
        <button onClick={() => setFilter('completed')} className={styles.button}>Completed</button>
        <button onClick={() => setFilter('pending')} className={styles.button}>Pending</button>
      </div>

      <ul className={styles.taskList}>
        {filteredTasks.map(task => (
          <li key={task.id} className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}>
            {task.isEditing ? (
              <>
                <input
                  type="text"
                  value={task.text}
                  onChange={(e) => saveTask(task.id, e.target.value)}
                  className={styles.input}
                />
                <button onClick={() => saveTask(task.id, task.text)} className={styles.button}>Save</button>
                <button onClick={() => cancelEditing(task.id)} className={styles.button}>Cancel</button>
              </>
            ) : (
              <>
                <span>{task.text}</span>
                <button onClick={() => enableEditing(task.id)} className={styles['button-edit']}>Edit</button>
                <button onClick={() => toggleCompletion(task.id)} className={styles['button-complete']}>
                  {task.completed ? 'Mark as Pending' : 'Mark as Completed'}
                </button>
                <button onClick={() => deleteTask(task.id)} className={styles['button-delete']}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;

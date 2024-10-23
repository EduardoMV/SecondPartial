"use client";

import { useState } from 'react';
import styles from './taskManager.module.scss';

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
  const [newTask, setNewTask] = useState<string>('');
  const [newListName, setNewListName] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Función para agregar una nueva lista de tareas
  const addTaskList = () => {
    if (newListName.trim()) {
      setTaskLists([
        ...taskLists,
        { id: Date.now(), name: newListName, tasks: [] },
      ]);
      setNewListName('');
    }
  };

  // Función para cambiar la lista seleccionada
  const selectTaskList = (id: number) => {
    setSelectedListId(id);
  };

  // Obtener la lista seleccionada
  const selectedTaskList = taskLists.find(list => list.id === selectedListId);

  // Función para agregar una nueva tarea a la lista seleccionada
  const addTask = () => {
    if (newTask.trim() && selectedListId !== null) {
      setTaskLists(taskLists.map(list =>
        list.id === selectedListId
          ? {
              ...list,
              tasks: [
                ...list.tasks,
                { id: Date.now(), text: newTask, completed: false, isEditing: false }
              ]
            }
          : list
      ));
      setNewTask('');
    }
  };

  // Filtrar las tareas de la lista seleccionada según el estado
  const filteredTasks = selectedTaskList?.tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  }) || [];

  // Función para habilitar la edición de una tarea
  const enableEditing = (listId: number, taskId: number) => {
    setTaskLists(taskLists.map(list =>
      list.id === listId
        ? {
            ...list,
            tasks: list.tasks.map(task =>
              task.id === taskId ? { ...task, isEditing: true } : task
            )
          }
        : list
    ));
  };

  // Función para guardar una tarea editada
  const saveTask = (listId: number, taskId: number, newText: string) => {
    setTaskLists(taskLists.map(list =>
      list.id === listId
        ? {
            ...list,
            tasks: list.tasks.map(task =>
              task.id === taskId ? { ...task, text: newText, isEditing: false } : task
            )
          }
        : list
    ));
  };

  // Función para cancelar la edición de una tarea
  const cancelEditing = (listId: number, taskId: number) => {
    setTaskLists(taskLists.map(list =>
      list.id === listId
        ? {
            ...list,
            tasks: list.tasks.map(task =>
              task.id === taskId ? { ...task, isEditing: false } : task
            )
          }
        : list
    ));
  };

  // Función para eliminar una tarea
  const deleteTask = (listId: number, taskId: number) => {
    setTaskLists(taskLists.map(list =>
      list.id === listId
        ? {
            ...list,
            tasks: list.tasks.filter(task => task.id !== taskId)
          }
        : list
    ));
  };

  // Función para cambiar el estado de completado de una tarea
  const toggleCompletion = (listId: number, taskId: number) => {
    setTaskLists(taskLists.map(list =>
      list.id === listId
        ? {
            ...list,
            tasks: list.tasks.map(task =>
              task.id === taskId ? { ...task, completed: !task.completed } : task
            )
          }
        : list
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>Task Lists</h2>
        <ul>
          {taskLists.map(list => (
            <li
              key={list.id}
              className={selectedListId === list.id ? styles.selectedList : ''}
              onClick={() => selectTaskList(list.id)}
            >
              {list.name}
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
        <button onClick={addTaskList} className={styles.button}>Add List</button>
      </div>

      <div className={styles.taskManager}>
        <h1>{selectedTaskList?.name || 'Select a List'}</h1>
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
                    onChange={(e) => saveTask(selectedListId!, task.id, e.target.value)}
                    className={styles.input}
                  />
                  <button onClick={() => saveTask(selectedListId!, task.id, task.text)} className={styles.button}>Save</button>
                  <button onClick={() => cancelEditing(selectedListId!, task.id)} className={styles.button}>Cancel</button>
                </>
              ) : (
                <>
                  <span>{task.text}</span>
                  <button onClick={() => enableEditing(selectedListId!, task.id)} className={styles['button-edit']}>Edit</button>
                  <button onClick={() => toggleCompletion(selectedListId!, task.id)} className={styles['button-complete']}>
                    {task.completed ? 'Mark as Pending' : 'Mark as Completed'}
                  </button>
                  <button onClick={() => deleteTask(selectedListId!, task.id)} className={styles['button-delete']}>Delete</button>
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

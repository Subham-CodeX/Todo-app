import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/api";

import {
  scheduleTaskNotification
} from "../services/notificationService";
// Create Context
const TaskContext = createContext();

// Custom Hook
export const useTasks = () => useContext(TaskContext);

// Provider
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] =
    useState(true);

  // ==========================
  // LOAD TASKS
  // ==========================

  const loadTasks = async () => {
    try {
      setLoading(true);

      const data = await getTasks();

      setTasks(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Load Tasks Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // ==========================
  // ADD TASK
  // ==========================

    const addTask = async (task) => {
    try {
      const newTask =
        await createTask(task);

      setTasks((prev) => [
        ...prev,
        newTask,
      ]);

      // Schedule notification
      await scheduleTaskNotification(
        newTask
      );

      return newTask;
    } catch (error) {
      console.error(error);
    }
  };

  // ==========================
  // UPDATE TASK
  // ==========================

  const editTask = async (
    id,
    data
  ) => {
    try {
      const updated =
        await updateTask(
          id,
          data
        );

      setTasks((prev) =>
        prev.map((task) =>
          task._id === id
            ? updated
            : task
        )
      );

      return updated;
    } catch (error) {
      console.error(error);
    }
  };

  // ==========================
  // DELETE TASK
  // ==========================

  const removeTask =
    async (id) => {
      try {
        await deleteTask(id);

        setTasks((prev) =>
          prev.filter(
            (task) =>
              task._id !== id
          )
        );
      } catch (error) {
        console.error(error);
      }
    };

  // ==========================
  // TOGGLE COMPLETE
  // ==========================

  const toggleComplete =
    async (id) => {
      const task = tasks.find(
        (t) => t._id === id
      );

      if (!task) return;

      await editTask(id, {
        completed:
          !task.completed,
      });
    };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        loadTasks,
        addTask,
        editTask,
        removeTask,
        toggleComplete,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
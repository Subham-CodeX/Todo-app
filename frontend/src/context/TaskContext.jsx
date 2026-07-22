import {createContext,useContext, useEffect,useState,} from "react";

import {getTasks,createTask,updateTask,deleteTask,} from "../services/api";

import {
  scheduleTaskNotification,
} from "../services/notificationService";

// ==========================
// CREATE CONTEXT
// ==========================
const TaskContext = createContext();

// ==========================
// CUSTOM HOOK
// ==========================

export const useTasks = () =>
  useContext(TaskContext);

// ==========================
// PROVIDER
// ==========================

export const TaskProvider = ({
  children,
}) => {
  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ==========================
  // LOAD TASKS
  // ==========================

  const loadTasks = async () => {
    try {
      setLoading(true);

      const data =
        await getTasks();

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
  // CREATE TASK
  // ==========================

  const addTask = async (
    taskData
  ) => {
    try {
      const task =
        await createTask({
          ...taskData,

          // Always create a Task
          isTemplate: false,
        });

      setTasks((prev) => [
        task,
        ...prev,
      ]);

      await scheduleTaskNotification(
        task
      );

      return task;
    } catch (error) {
      console.error(
        "Create Task Error:",
        error
      );

      throw error;
    }
  };

  // ==========================
  // UPDATE TASK
  // ==========================

  const editTask = async (
    id,
    updatedData
  ) => {
    try {
      const updated =
        await updateTask(
          id,
          updatedData
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
      console.error(
        "Update Task Error:",
        error
      );

      throw error;
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
        console.error(
          "Delete Task Error:",
          error
        );

        throw error;
      }
    };

  // ==========================
  // TOGGLE COMPLETE
  // ==========================

  const toggleComplete =
    async (id) => {
      const task =
        tasks.find(
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

export default TaskContext;
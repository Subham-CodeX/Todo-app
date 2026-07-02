import React, { useEffect, useState } from "react";

import "../styles/style.css";
import "../styles/modal.css";
import "../styles/deleteModal.css";
import "../styles/navbar.css";

import TaskCard from "../components/TaskCard";
import AddTaskModal from "../components/AddTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import DeleteModal from "../components/DeleteModal";
// import Navbar from "../components/Navbar";

import {
  getTasks,
  deleteTask,
  updateTask,
} from "../services/api";

const Tasks = () => {
  // =========================
  // STATES
  // =========================

  const [tasks, setTasks] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [editModalOpen, setEditModalOpen] =
    useState(false);

  const [addModalOpen, setAddModalOpen] =
    useState(false);

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [taskToDelete, setTaskToDelete] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // =========================
  // LOAD TASKS
  // =========================

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);

      const data = await getTasks();

      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Load Tasks Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EDIT TASK
  // =========================

  const openEditModal = (task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedTask(null);
    setEditModalOpen(false);
  };

  // =========================
  // DELETE TASK
  // =========================

  const openDeleteModal = (id) => {
    setTaskToDelete(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setTaskToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete);

      setTasks((prev) =>
        prev.filter(
          (task) => task._id !== taskToDelete
        )
      );

      closeDeleteModal();
    } catch (error) {
      console.error(
        "Delete Error:",
        error
      );
    }
  };

  // =========================
  // TOGGLE COMPLETE
  // =========================

  const handleToggleTask = async (id) => {
  try {
    const currentTask = tasks.find(
      (task) => task._id === id
    );

    if (!currentTask) return;

    const updatedTask = await updateTask(id, {
      completed: !currentTask.completed,
    });

    setTasks((prev) =>
      prev.map((task) =>
        task._id === id ? updatedTask : task
      )
    );
  } catch (error) {
    console.error("Toggle Error:", error);
  }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredTasks = tasks.filter((task) => {
    const keyword = search.toLowerCase();

    return (
      task.title
        ?.toLowerCase()
        .includes(keyword) ||
      task.description
        ?.toLowerCase()
        .includes(keyword) ||
      task.category
        ?.toLowerCase()
        .includes(keyword)
    );
  });

  // =========================
  // STATS
  // =========================

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const workCount = tasks.filter(
    (task) => task.category === "Work"
  ).length;

  const studyCount = tasks.filter(
    (task) => task.category === "Study"
  ).length;

  const healthCount = tasks.filter(
    (task) => task.category === "Health"
  ).length;

  const personalCount = tasks.filter(
    (task) => task.category === "Personal"
  ).length;

  // =========================
  // UI
  // =========================

  return (
    <>
      <div className="app">
        {/* Header */}

        <header className="hero">
          <div className="welcome">
            <h3>Hello 👋</h3>
            <h1>Subham</h1>
          </div>

          <div className="profile">
            <img
              src="https://i.pravatar.cc/100"
              alt="Profile"
            />
          </div>
        </header>

        {/* Search */}

        <div className="search-box">
          <input
            type="text"
            placeholder="Search Tasks..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* Categories */}

        <section className="categories">
          <h2>Category</h2>

          <div className="category-container">
            <div className="category-card work">
              <h3>Work</h3>
              <p>{workCount} Task</p>
            </div>

            <div className="category-card study">
              <h3>Study</h3>
              <p>{studyCount} Task</p>
            </div>

            <div className="category-card health">
              <h3>Health</h3>
              <p>{healthCount} Task</p>
            </div>

            <div className="category-card personal">
              <h3>Personal</h3>
              <p>{personalCount} Task</p>
            </div>
          </div>
        </section>

        {/* Tasks */}

        <section className="task-section">
          <div className="sheet">
            <div className="task-header">
              <h2>Today's Tasks</h2>

              <div className="stats">
                <span>{totalTasks}</span> Tasks |
                <span> {completedTasks}</span> Done
              </div>
            </div>

            <div id="taskList">
              {loading ? (
                <p>Loading tasks...</p>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    {...task}
                    onEdit={() =>
                      openEditModal(task)
                    }
                    onDelete={() =>
                      openDeleteModal(task._id)
                    }
                    onToggle={() =>
                      handleToggleTask(
                        task._id
                      )
                    }
                  />
                ))
              ) : (
                <p>No tasks found.</p>
              )}
            </div>
          </div>
        </section>

        {/* Edit Modal */}

        <EditTaskModal
          isOpen={editModalOpen}
          onClose={closeEditModal}
          task={selectedTask}
          tasks={tasks}
          setTasks={setTasks}
        />
      </div>


      {/* Add Task */}

      <AddTaskModal
        isOpen={addModalOpen}
        onClose={() =>
          setAddModalOpen(false)
        }
        onTaskCreated={loadTasks}
        // tasks={tasks}
        // setTasks={setTasks}
      />

      {/* Delete Task */}

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteTask}
      />
    </>
  );
};

export default Tasks;
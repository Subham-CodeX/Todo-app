import { useState, useEffect } from "react";

import { useTasks } from "../context/TaskContext";

const EditTaskModal = ({
  isOpen,
  onClose,
  task,
}) => {

  const { editTask } = useTasks();

  const initialState = {
    title: "",
    description: "",
    category: "Work",
    priority: "High",
    date: "",
    startTime: "",
    endTime: "",
  };

  const [formData, setFormData] =
    useState(initialState);

  // ==========================
  // LOAD TASK DATA
  // ==========================

  useEffect(() => {

    if (task) {

      setFormData({

        title: task.title || "",

        description:
          task.description || "",

        category:
          task.category || "Work",

        priority:
          task.priority || "High",

        date:
          task.date || "",

        startTime:
          task.startTime || "",

        endTime:
          task.endTime || "",

      });

    }

  }, [task]);

  // ==========================
  // INPUT CHANGE
  // ==========================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({

      ...prev,

      [name]: value,

    }));

  };

  // ==========================
  // SAVE TASK
  // ==========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await editTask(
        task._id,
        formData
      );

      onClose();

    } catch (error) {

      console.error(
        "Update Task Error:",
        error
      );

    }

  };

  if (!isOpen || !task) return null;

  return (
    <>
      <div
        id="editOverlay"
        className="active"
        onClick={onClose}
      />

      <div
        id="editTaskModal"
        className="active"
      >

        <div className="edit-header">

          <div className="modal-indicator"></div>

          <h2>Edit Task</h2>

        </div>

        <form
          id="editTaskForm"
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            name="title"
            placeholder="Task Title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >

            <option value="Work">
              Work
            </option>

            <option value="Study">
              Study
            </option>

            <option value="Health">
              Health
            </option>

            <option value="Personal">
              Personal
            </option>

          </select>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>

          </select>

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />

          <div className="time-row">

            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
            />

            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
            />

          </div>

          <button type="submit">
            Save Changes
          </button>

        </form>

      </div>
    </>
  );

};

export default EditTaskModal;
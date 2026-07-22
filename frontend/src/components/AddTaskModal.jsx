import { useState } from "react";

import { useTasks } from "../context/TaskContext";
import { useTemplates } from "../context/TemplateContext";

const AddTaskModal = ({
  isOpen,
  onClose,
}) => {

  const { addTask } = useTasks();

  const { addTemplate } =
    useTemplates();

  const initialForm = {

    title: "",

    description: "",

    category: "Work",

    priority: "High",

    date: "",

    startTime: "",

    endTime: "",

    completed: false,

    isTemplate: false,

  };

  const [formData, setFormData] =
    useState(initialForm);

  // ==========================
  // INPUT CHANGE
  // ==========================

  const handleChange = (e) => {

    const {

      name,

      value,

      type,

      checked,

    } = e.target;

    setFormData((prev) => ({

      ...prev,

      [name]:

        type === "checkbox"

          ? checked

          : value,

    }));

  };

  // ==========================
  // SUBMIT
  // ==========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      // ----------------------
      // Create Task
      // ----------------------

      await addTask({

        title: formData.title,

        description:
          formData.description,

        category:
          formData.category,

        priority:
          formData.priority,

        date:
          formData.date,

        startTime:
          formData.startTime,

        endTime:
          formData.endTime,

      });

      // ----------------------
      // Create Template
      // ----------------------

      if (formData.isTemplate) {

        await addTemplate({

          title: formData.title,

          description:
            formData.description,

          category:
            formData.category,

          priority:
            formData.priority,

          date:
            formData.date,

          startTime:
            formData.startTime,

          endTime:
            formData.endTime,

        });

      }

      setFormData(initialForm);

      onClose();

    } catch (error) {

      console.error(

        "Create Task Error:",

        error

      );

    }

  };

  // ==========================
  // CLOSE
  // ==========================

  const handleClose = () => {

    setFormData(initialForm);

    onClose();

  };

  if (!isOpen) return null;

  return (
    <>
      <div
        id="overlay"
        className="active"
        onClick={handleClose}
      ></div>

      <div
        id="taskModal"
        className="active"
      >
        <div className="drag-line"></div>

        <h2>Add New Task</h2>

        <form
          id="taskForm"
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            name="title"
            placeholder="Task Name"
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
              High Priority
            </option>

            <option value="Medium">
              Medium Priority
            </option>

            <option value="Low">
              Low Priority
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

          <label className="template-option">

            <input
              type="checkbox"
              name="isTemplate"
              checked={formData.isTemplate}
              onChange={handleChange}
            />

            Save as Template

          </label>

          <button type="submit">
            Create Task
          </button>

        </form>

      </div>
    </>
  );

};

export default AddTaskModal;
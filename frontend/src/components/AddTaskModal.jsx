import { useEffect, useRef, useState } from "react";

import { useTasks } from "../context/TaskContext";
import { useTemplates } from "../context/TemplateContext";

const AddTaskModal = ({
  isOpen,
  onClose,
}) => {

  const { addTask } = useTasks();

  const { addTemplate } =
    useTemplates();

  const formRef = useRef(null);

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
  // KEEP FOCUSED INPUT VISIBLE
  // ON MOBILE KEYBOARD
  // ==========================

  const handleFocus = (e) => {

    const element = e.target;

    setTimeout(() => {

      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

    }, 250);
  };

  // ==========================
  // SUBMIT
  // ==========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await addTask({

        title:
          formData.title,

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

      if (formData.isTemplate) {

        await addTemplate({

          title:
            formData.title,

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

  // ==========================
  // ESCAPE KEY
  // ==========================

  useEffect(() => {

    if (!isOpen) return;

    const handleEscape = (e) => {

      if (e.key === "Escape") {
        handleClose();
      }

    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {

      document.removeEventListener(
        "keydown",
        handleEscape
      );

    };

  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* ==========================
          OVERLAY
      ========================== */}

      <div
        id="overlay"
        className="active"
        onClick={handleClose}
      />

      {/* ==========================
          TASK MODAL
      ========================== */}

      <div
        id="taskModal"
        className="active"
        role="dialog"
        aria-modal="true"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* Drag indicator */}

        <div className="drag-line"></div>

        {/* Header */}

        <h2>
          Add New Task
        </h2>

        {/* ==========================
            SCROLLABLE FORM
        ========================== */}

        <form
          id="taskForm"
          ref={formRef}
          onSubmit={handleSubmit}
        >

          {/* TASK NAME */}

          <input
            type="text"
            name="title"
            placeholder="Task Name"
            value={formData.title}
            onChange={handleChange}
            onFocus={handleFocus}
            autoComplete="off"
            required
          />

          {/* DESCRIPTION */}

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            onFocus={handleFocus}
          />

          {/* CATEGORY */}

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            onFocus={handleFocus}
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

          {/* PRIORITY */}

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            onFocus={handleFocus}
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

          {/* DATE */}

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            onFocus={handleFocus}
          />

          {/* TIME */}

          <div className="time-row">

            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              onFocus={handleFocus}
            />

            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              onFocus={handleFocus}
            />

          </div>

          {/* TEMPLATE */}

          <label className="template-option">

            <input
              type="checkbox"
              name="isTemplate"
              checked={
                formData.isTemplate
              }
              onChange={handleChange}
            />

            <span>
              Save as Template
            </span>

          </label>

          {/* SUBMIT */}

          <button
            type="submit"
          >
            Create Task
          </button>

        </form>

      </div>
    </>
  );
};

export default AddTaskModal;
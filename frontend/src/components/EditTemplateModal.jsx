import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function EditTemplateModal({
  isOpen,
  template,
  onClose,
  editTemplate,
}) {
  const initialForm = {
    title: "",
    description: "",
    category: "Work",
    priority: "High",
    date: "",
    startTime: "",
    endTime: "",
  };

  const [formData, setFormData] =
    useState(initialForm);

  const [saving, setSaving] =
    useState(false);

  // ==========================
  // LOAD TEMPLATE
  // ==========================

  useEffect(() => {
    if (!template) return;

    setFormData({
      title: template.title || "",
      description:
        template.description || "",
      category:
        template.category || "Work",
      priority:
        template.priority || "High",
      date: template.date || "",
      startTime:
        template.startTime || "",
      endTime:
        template.endTime || "",
    });
  }, [template]);

  // ==========================
  // ESC CLOSE
  // ==========================

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleEsc
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleEsc
      );
  });

  // ==========================
  // INPUT CHANGE
  // ==========================

  const handleChange = (e) => {
    const { name, value } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================
  // UPDATE TEMPLATE
  // ==========================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (!template) return;

      try {
        setSaving(true);

        await editTemplate(
          template._id,
          formData
        );

        toast.success(
          "Template updated successfully!"
        );

        handleClose();
      } catch (error) {
        console.error(error);

        toast.error(
          "Unable to update template."
        );
      } finally {
        setSaving(false);
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
        id="editOverlay"
        className="active"
        onClick={handleClose}
      ></div>

      <div
        id="editTaskModal"
        className="active"
      >
        <div className="drag-line"></div>

        <h2>
          Edit Template
        </h2>

        <form
          id="editTaskForm"
          onSubmit={handleSubmit}
        >
          {/* Title */}

          <input
            type="text"
            name="title"
            placeholder="Task Name"
            value={formData.title}
            onChange={handleChange}
            required
          />

          {/* Description */}

          <textarea
            name="description"
            placeholder="Description"
            value={
              formData.description
            }
            onChange={handleChange}
          />
                    {/* Category */}

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

          {/* Priority */}

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

          {/* Date */}

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />

          {/* Time */}

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

          {/* Update Button */}

          <button
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner"></span>

                Updating...
              </>
            ) : (
              "Update Template"
            )}
          </button>

        </form>

      </div>
    </>
  );
}
import {
  FaPlay,
  FaTrash,
  FaPen,
  FaBook,
  FaBriefcase,
  FaHeart,
  FaUser,
} from "react-icons/fa";

import { useTemplates } from "../context/TemplateContext";
import toast from "react-hot-toast";

export default function TemplateCard({
  template,
  openEditModal,
}) {
  const {
    removeTemplate,
    createFromTemplate,
  } = useTemplates();

  const handleUse = async () => {
    try {
      const today = new Date()
        .toISOString()
        .split("T")[0];

      await createFromTemplate(
        template._id,
        today
      );

      toast.success("Task created successfully!");
    } catch (error) {
      console.error(error);

      toast.error(
    "Failed to create task."
      );
    }
  };

  const handleDelete = async () => {
    const confirmDelete =
      window.confirm(
        "Delete this template?"
      );

    if (!confirmDelete) return;

    try {
      await removeTemplate(template._id);

      toast.success(
    "Template deleted."
      );
    } catch (error) {
      console.error(error);

      toast.error(
    "Unable to delete template."
      );
    }
  };

  const categoryIcons = {
    Work: <FaBriefcase />,
    Study: <FaBook />,
    Health: <FaHeart />,
    Personal: <FaUser />,
  };

  return (
    <div className="template-card">

      {/* Category Icon */}

      <div
        className={`template-icon ${template.category.toLowerCase()}`}
      >
        {categoryIcons[
          template.category
        ] || <FaBook />}
      </div>

      {/* Content */}

      <div className="template-content">

        <h3>{template.title}</h3>

        <small>
          Created from template
        </small>

        <p>
          {template.description ||
            "No description available"}
        </p>

        <div className="template-meta">

          <span className="category-pill">
            {template.category}
          </span>

          <span
            className={`priority ${template.priority.toLowerCase()}`}
          >
            {template.priority}
          </span>

        </div>

      </div>

      {/* Buttons */}

      <div className="template-buttons">

        <button
          className="use-btn"
          onClick={handleUse}
        >
          <FaPlay />
          Use
        </button>

        <button
          className="icon-btn"
          onClick={() =>
            openEditModal(template)
          }
          title="Edit Template"
        >
          <FaPen />
        </button>

        <button
          className="icon-btn delete"
          onClick={handleDelete}
          title="Delete Template"
        >
          <FaTrash />
        </button>

      </div>

    </div>
  );
}
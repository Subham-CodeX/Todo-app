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

export default function TemplateCard({ template }) {
  const {
    removeTemplate,
    openEditModal,
    createFromTemplate,
  } = useTemplates();

  const handleUse = async () => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    await createFromTemplate(
      template._id,
      today
    );

    alert("Task created successfully!");
  };

  const categoryIcons = {
    Work: <FaBriefcase />,
    Study: <FaBook />,
    Health: <FaHeart />,
    Personal: <FaUser />,
  };

  return (
    <div className="template-card">

      <div
            className={`template-icon ${template.category.toLowerCase()}`}
        >

            {categoryIcons[template.category]}

        </div>

      <div className="template-content">

        <h3>

        {template.title}

        </h3>

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
            onClick={() => openEditModal(template)}
        >
            <FaPen />
        </button>

        <button
          className="icon-btn delete"
          onClick={() =>
            removeTemplate(template._id)
          }
        >
          <FaTrash />
        </button>

      </div>

    </div>
  );
}
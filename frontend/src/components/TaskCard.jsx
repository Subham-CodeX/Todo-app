import React from "react";

const TaskCard = ({
  _id,
  title,
  description,
  category,
  priority,
  date,
  startTime,
  endTime,
  completed,
  onToggle,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className={`task-card ${
        completed ? "completed" : ""
      }`}
    >
      <div className="task-top">
        <div className="task-info">
          <h3>{title}</h3>

          {description && (
            <p className="task-description">
              {description}
            </p>
          )}
        </div>

        <input
          type="checkbox"
          checked={completed}
          onChange={() =>
            onToggle(_id)
          }
        />
      </div>

      <div className="task-meta">
        <span
          className={`category-badge ${category?.toLowerCase()}`}
        >
          {category}
        </span>

        <span
          className={`priority ${priority?.toLowerCase()}`}
        >
          {priority}
        </span>
      </div>

      <div className="task-time">
        {date && (
          <span>
            📅 {date}
          </span>
        )}

        {startTime && endTime && (
          <span>
            ⏰ {startTime} - {endTime}
          </span>
        )}
      </div>

      <div className="task-actions">
        <button
          className="edit-btn"
          onClick={() =>
            onEdit(_id)
          }
        >
          Edit
        </button>

        <button
          className="delete-btn"
          onClick={() =>
            onDelete(_id)
          }
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
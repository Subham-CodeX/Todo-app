import React from "react";


const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        id="deleteOverlay"
        className="delete-overlay active"
        onClick={onClose}
      >
        <div
          id="deleteModal"
          className="delete-modal"
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          <div className="delete-icon">
            🗑️
          </div>

          <h2>Delete Task</h2>

          <p>
            Are you sure you want to
            delete this task?
          </p>

          <div className="delete-actions">
            <button
              className="cancel-delete-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="confirm-delete-btn"
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteModal;
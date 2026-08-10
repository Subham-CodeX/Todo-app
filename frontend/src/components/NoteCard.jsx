import {
  FaThumbtack,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

import { motion } from "framer-motion";

import { useNotes } from "../context/NotesContext";

import "../styles/noteCard.css";

export default function NoteCard({
  note,
  onEdit,
}) {
  const {
    togglePin,
    removeNote,
  } = useNotes();

  const handleDelete = async (
    e
  ) => {
    e.stopPropagation();

    const confirmed =
      window.confirm(
        "Delete this note?"
      );

    if (!confirmed) return;

    try {
      await removeNote(
        note._id
      );
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );
    }
  };

  const handlePin = async (
    e
  ) => {
    e.stopPropagation();

    try {
      await togglePin(note);
    } catch (error) {
      console.error(
        "Pin error:",
        error
      );
    }
  };

  return (
    <motion.div
      className="note-card"
      style={{
        backgroundColor:
          note.color,
      }}
      layout
      initial={{
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.8,
      }}
      whileHover={{
        y: -5,
      }}
      transition={{
        duration: 0.2,
      }}
      onDoubleClick={() =>
        onEdit(note)
      }
    >
      {/* PIN */}

      <button
        className={`note-pin-btn ${
          note.isPinned
            ? "active"
            : ""
        }`}
        onClick={handlePin}
      >
        <FaThumbtack />
      </button>

      {/* CONTENT */}

      {note.title && (
        <h3>
          {note.title}
        </h3>
      )}

      <p>
        {note.content}
      </p>

      {/* FOOTER */}

      <div className="note-card-footer">

        <small>
          {new Date(
            note.updatedAt
          ).toLocaleDateString()}
        </small>

        <div className="note-card-actions">

          <button
            onClick={(e) => {
              e.stopPropagation();

              onEdit(note);
            }}
          >
            <FaEdit />
          </button>

          <button
            onClick={
              handleDelete
            }
          >
            <FaTrash />
          </button>

        </div>

      </div>
    </motion.div>
  );
}
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaTimes,
  FaThumbtack,
  FaTrash,
  FaCheck,
} from "react-icons/fa";

import { motion, AnimatePresence } from "framer-motion";

import { useNotes } from "../context/NotesContext";

import "../styles/noteModal.css";

const NOTE_COLORS = [
  "#FFF9C4",
  "#FFE0B2",
  "#FFCDD2",
  "#E1BEE7",
  "#D1C4E9",
  "#BBDEFB",
  "#C8E6C9",
  "#B2EBF2",
];

export default function NoteModal({
  isOpen,
  onClose,
  note = null,
}) {
  const {
    addNote,
    editNote,
    removeNote,
  } = useNotes();

  const isEditing = Boolean(note);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [color, setColor] =
    useState(NOTE_COLORS[0]);

  const [isPinned, setIsPinned] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [saveStatus, setSaveStatus] =
    useState("");

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const autoSaveTimer =
    useRef(null);

  const initializedRef =
    useRef(false);

  // =========================
  // LOAD NOTE
  // =========================

  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      return;
    }

    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setColor(
        note.color || NOTE_COLORS[0]
      );
      setIsPinned(
        Boolean(note.isPinned)
      );
    } else {
      setTitle("");
      setContent("");
      setColor(NOTE_COLORS[0]);
      setIsPinned(false);
    }

    setSaveStatus("");

    initializedRef.current = true;

  }, [isOpen, note]);

  // =========================
  // AUTO SAVE
  // =========================

  useEffect(() => {
    if (!isOpen) return;

    if (!isEditing) return;

    if (!initializedRef.current) {
      return;
    }

    clearTimeout(
      autoSaveTimer.current
    );

    setSaveStatus(
      "Saving..."
    );

    autoSaveTimer.current =
      setTimeout(async () => {
        try {
          setSaving(true);

          await editNote(
            note._id,
            {
              title,
              content,
              color,
              isPinned,
            }
          );

          setSaveStatus(
            "Saved"
          );

        } catch (error) {
          setSaveStatus(
            "Save failed"
          );

        } finally {
          setSaving(false);
        }
      }, 700);

    return () => {
      clearTimeout(
        autoSaveTimer.current
      );
    };

  }, [
    title,
    content,
    color,
    isPinned,
    isOpen,
    isEditing,
    note,
  ]);

  // =========================
  // CREATE
  // =========================

  const handleCreate = async () => {
    if (
      !title.trim() &&
      !content.trim()
    ) {
      return;
    }

    try {
      setSaving(true);

      await addNote({
        title: title.trim(),
        content: content.trim(),
        color,
        isPinned,
        archived: false,
        favorite: false,
      });

      onClose();

    } catch (error) {
      console.error(
        "Create note error:",
        error
      );

    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async () => {
    if (!note?._id) return;

    const confirmed =
      window.confirm(
        "Delete this note?"
      );

    if (!confirmed) return;

    try {
      setDeleteLoading(true);

      await removeNote(
        note._id
      );

      onClose();

    } catch (error) {
      console.error(
        "Delete note error:",
        error
      );

    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================
  // CLOSE
  // =========================

  const handleClose = () => {
    clearTimeout(
      autoSaveTimer.current
    );

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}

          <motion.div
            className="note-modal-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={handleClose}
          />

          {/* BOTTOM SHEET */}

          <motion.div
            className="note-modal"
            style={{
              backgroundColor: color,
            }}
            initial={{
              y: "100%",
            }}
            animate={{
              y: 0,
            }}
            exit={{
              y: "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 30,
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* HANDLE */}

            <div className="note-modal-handle" />

            {/* HEADER */}

            <div className="note-modal-header">

              <button
                className="note-icon-btn"
                onClick={handleClose}
              >
                <FaTimes />
              </button>

              <div className="note-save-status">

                {saving ? (
                  <>
                    Saving...
                  </>
                ) : saveStatus ? (
                  <>
                    <FaCheck />
                    {saveStatus}
                  </>
                ) : null}

              </div>

              <button
                className={`note-icon-btn ${
                  isPinned
                    ? "pinned"
                    : ""
                }`}
                onClick={() =>
                  setIsPinned(
                    (prev) => !prev
                  )
                }
              >
                <FaThumbtack />
              </button>

            </div>

            {/* TITLE */}

            <input
              className="note-title-input"
              placeholder="Title"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
            />

            {/* CONTENT */}

            <textarea
              className="note-content-input"
              placeholder="Write your note..."
              value={content}
              onChange={(e) =>
                setContent(
                  e.target.value
                )
              }
              autoFocus
            />

            {/* COLORS */}

            <div className="note-color-section">

              <span>
                Color
              </span>

              <div className="note-colors">

                {NOTE_COLORS.map(
                  (noteColor) => (
                    <button
                      key={noteColor}
                      className={`note-color ${
                        color === noteColor
                          ? "selected"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          noteColor,
                      }}
                      onClick={() =>
                        setColor(
                          noteColor
                        )
                      }
                    />
                  )
                )}

              </div>

            </div>

            {/* ACTIONS */}

            <div className="note-modal-actions">

              {isEditing && (
                <button
                  className="note-delete-btn"
                  onClick={
                    handleDelete
                  }
                  disabled={
                    deleteLoading
                  }
                >
                  <FaTrash />

                  {deleteLoading
                    ? "Deleting..."
                    : "Delete"}
                </button>
              )}

              {!isEditing && (
                <button
                  className="note-save-btn"
                  onClick={
                    handleCreate
                  }
                  disabled={saving}
                >
                  <FaCheck />

                  {saving
                    ? "Saving..."
                    : "Save Note"}
                </button>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
import {
  useMemo,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaPlus,
} from "react-icons/fa";

import {
  useNavigate,
} from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { useNotes } from "../context/NotesContext";

import NoteCard from "../components/NoteCard";
import NoteModal from "../components/NoteModal";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";

import "../styles/notes.css";

export default function Notes() {
  const navigate =
    useNavigate();

  const {
    notes,
    loading,
  } = useNotes();

  const [search, setSearch] =
    useState("");

  const [
    noteModalOpen,
    setNoteModalOpen,
  ] = useState(false);

  const [
    selectedNote,
    setSelectedNote,
  ] = useState(null);

  // =========================
  // FILTER
  // =========================

  const filteredNotes =
    useMemo(() => {
      const keyword =
        search
          .toLowerCase()
          .trim();

      if (!keyword) {
        return notes;
      }

      return notes.filter(
        (note) =>
          note.title
            ?.toLowerCase()
            .includes(keyword) ||
          note.content
            ?.toLowerCase()
            .includes(keyword)
      );
    }, [
      notes,
      search,
    ]);

  // =========================
  // CREATE
  // =========================

  const openCreateNote =
    () => {
      setSelectedNote(null);

      setNoteModalOpen(true);
    };

  // =========================
  // EDIT
  // =========================

  const openEditNote =
    (note) => {
      setSelectedNote(note);

      setNoteModalOpen(true);
    };

  // =========================
  // CLOSE
  // =========================

  const closeNoteModal =
    () => {
      setSelectedNote(null);

      setNoteModalOpen(false);
    };

  return (
    <div className="notes-page">

      {/* HEADER */}

      <header className="notes-header">

        <button
          onClick={() =>
            navigate(-1)
          }
          className="back-btn"
        >
          <FaArrowLeft />
        </button>

        <div>
          <h1>
            Sticky Notes
          </h1>

          <p>
            {notes.length}{" "}
            {notes.length === 1
              ? "Note"
              : "Notes"}
          </p>
        </div>

      </header>


      {/* SEARCH */}

      <SearchBar
        value={search}
        onChange={setSearch}
      />


      {/* NOTES */}

      {loading ? (
        <div className="notes-loading">
          Loading notes...
        </div>
      ) : filteredNotes.length >
        0 ? (

        <motion.div
          className="notes-grid"
          layout
        >

          <AnimatePresence>
            {filteredNotes.map(
              (note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onEdit={
                    openEditNote
                  }
                />
              )
            )}
          </AnimatePresence>

        </motion.div>

      ) : (

        <EmptyState />

      )}


      {/* ADD BUTTON */}

      <motion.button
        className="notes-fab"
        onClick={
          openCreateNote
        }
        whileHover={{
          scale: 1.08,
        }}
        whileTap={{
          scale: 0.9,
        }}
      >
        <FaPlus />
      </motion.button>


      {/* CREATE / EDIT MODAL */}

      <NoteModal
        isOpen={
          noteModalOpen
        }
        onClose={
          closeNoteModal
        }
        note={
          selectedNote
        }
      />

    </div>
  );
}
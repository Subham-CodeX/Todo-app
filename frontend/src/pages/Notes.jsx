import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaPlus,
} from "react-icons/fa";

import {
  useNavigate,
  useSearchParams,
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

  // =========================
  // NAVIGATION
  // =========================

  const navigate = useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  // =========================
  // NOTES CONTEXT
  // =========================

  const {
    notes,
    loading,
  } = useNotes();


  // =========================
  // STATES
  // =========================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    noteModalOpen,
    setNoteModalOpen,
  ] = useState(false);

  const [
    selectedNote,
    setSelectedNote,
  ] = useState(null);


  // =========================
  // OPEN CREATE NOTE
  // =========================

  const openCreateNote = () => {

    setSelectedNote(null);

    setNoteModalOpen(true);

  };


  // =========================
  // OPEN EDIT NOTE
  // =========================

  const openEditNote = (note) => {

    setSelectedNote(note);

    setNoteModalOpen(true);

  };


  // =========================
  // CLOSE NOTE MODAL
  // =========================

  const closeNoteModal = () => {

    setSelectedNote(null);

    setNoteModalOpen(false);

  };


  // =========================
  // AUTO OPEN CREATE MODAL
  // /notes?new=true
  // =========================

  useEffect(() => {

    if (
      searchParams.get("new") === "true"
    ) {

      setSelectedNote(null);

      setNoteModalOpen(true);

      // Remove ?new=true from URL
      // after opening the modal

      setSearchParams({});

    }

  }, [
    searchParams,
    setSearchParams,
  ]);


  // =========================
  // FILTER NOTES
  // =========================

  const filteredNotes = useMemo(() => {

    const keyword =
      search
        .toLowerCase()
        .trim();


    // No search keyword
    // Return all notes

    if (!keyword) {
      return notes;
    }


    // Search title/content

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
  // UI
  // =========================

  return (

    <div className="notes-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="notes-header">

        <button
          onClick={() =>
            navigate(-1)
          }
          className="back-btn"
          aria-label="Go back"
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


      {/* =========================
          SEARCH
      ========================= */}

      <SearchBar
        value={search}
        onChange={setSearch}
      />


      {/* =========================
          NOTES
      ========================= */}

      {loading ? (

        <div className="notes-loading">

          Loading notes...

        </div>

      ) : filteredNotes.length > 0 ? (

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


      {/* =========================
          ADD NOTE BUTTON
      ========================= */}

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
        aria-label="Create new note"
      >

        <FaPlus />

      </motion.button>


      {/* =========================
          CREATE / EDIT MODAL
      ========================= */}

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
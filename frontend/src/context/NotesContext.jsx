import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../services/noteApi";

const NotesContext = createContext(null);

export const useNotes = () => {
  const context = useContext(NotesContext);

  if (!context) {
    throw new Error(
      "useNotes must be used inside NotesProvider"
    );
  }

  return context;
};

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  // =========================
  // LOAD NOTES
  // =========================

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getNotes();

      setNotes(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      console.error(
        "Load Notes Error:",
        err
      );

      setError(
        "Failed to load notes."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // =========================
  // ADD NOTE
  // =========================

  const addNote = async (noteData) => {
    try {
      const createdNote =
        await createNote(noteData);

      setNotes((prev) => [
        createdNote,
        ...prev,
      ]);

      return createdNote;

    } catch (err) {
      console.error(
        "Create Note Error:",
        err
      );

      throw err;
    }
  };

  // =========================
  // EDIT NOTE
  // =========================

  const editNote = async (
    id,
    noteData
  ) => {
    try {
      const updatedNote =
        await updateNote(
          id,
          noteData
        );

      setNotes((prev) =>
        prev.map((note) =>
          note._id === id
            ? updatedNote
            : note
        )
      );

      return updatedNote;

    } catch (err) {
      console.error(
        "Update Note Error:",
        err
      );

      throw err;
    }
  };

  // =========================
  // DELETE NOTE
  // =========================

  const removeNote = async (id) => {
    try {
      await deleteNote(id);

      setNotes((prev) =>
        prev.filter(
          (note) =>
            note._id !== id
        )
      );

    } catch (err) {
      console.error(
        "Delete Note Error:",
        err
      );

      throw err;
    }
  };

  // =========================
  // PIN / UNPIN
  // =========================

  const togglePin = async (note) => {
    try {
      const updatedNote =
        await updateNote(
          note._id,
          {
            isPinned:
              !note.isPinned,
          }
        );

      setNotes((prev) =>
        prev.map((item) =>
          item._id === note._id
            ? updatedNote
            : item
        )
      );

      return updatedNote;

    } catch (err) {
      console.error(
        "Toggle Pin Error:",
        err
      );

      throw err;
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        error,

        loadNotes,

        addNote,
        editNote,
        removeNote,

        togglePin,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
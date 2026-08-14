import {
  useRef,
} from "react";

import {
  FaThumbtack,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

import { motion } from "framer-motion";

import {
  useNotes,
} from "../context/NotesContext";

import "../styles/noteCard.css";


export default function NoteCard({
  note,
  onEdit,
}) {

  const {
    togglePin,
    removeNote,
  } = useNotes();


  // =========================================
  // MOBILE DOUBLE TAP
  // =========================================

  const lastTapRef =
    useRef(0);

  const tapTimerRef =
    useRef(null);


  // =========================================
  // OPEN NOTE
  // =========================================

  const handleOpenNote = () => {

    onEdit(note);

  };


  // =========================================
  // MOBILE / TOUCH DOUBLE TAP
  // =========================================

  const handlePointerUp = (
    event
  ) => {

    /*
      Only handle touch / pen here.

      Desktop mouse clicks are handled
      by onDoubleClick below.
    */

    if (
      event.pointerType === "mouse"
    ) {
      return;
    }


    /*
      Don't trigger note opening when
      user interacts with buttons.
    */

    if (
      event.target.closest(
        ".note-pin-btn"
      ) ||
      event.target.closest(
        ".note-card-actions"
      )
    ) {
      return;
    }


    const now =
      Date.now();


    const timeSinceLastTap =
      now -
      lastTapRef.current;


    /*
      Android double tap window.
    */

    if (
      lastTapRef.current !== 0 &&
      timeSinceLastTap < 450
    ) {

      /*
        Double tap detected.
      */

      clearTimeout(
        tapTimerRef.current
      );

      lastTapRef.current = 0;


      handleOpenNote();

      return;
    }


    /*
      First tap.
    */

    lastTapRef.current =
      now;


    /*
      Reset after the
      double-tap window.
    */

    clearTimeout(
      tapTimerRef.current
    );


    tapTimerRef.current =
      setTimeout(() => {

        lastTapRef.current = 0;

      }, 450);
  };


  // =========================================
  // DESKTOP DOUBLE CLICK
  // =========================================

  const handleDoubleClick = (
    event
  ) => {

    if (
      event.target.closest(
        ".note-pin-btn"
      ) ||
      event.target.closest(
        ".note-card-actions"
      )
    ) {
      return;
    }


    handleOpenNote();

  };


  // =========================================
  // DELETE
  // =========================================

  const handleDelete = async (
    event
  ) => {

    event.stopPropagation();


    const confirmed =
      window.confirm(
        "Delete this note?"
      );


    if (!confirmed) {
      return;
    }


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


  // =========================================
  // PIN
  // =========================================

  const handlePin = async (
    event
  ) => {

    event.stopPropagation();


    try {

      await togglePin(
        note
      );

    } catch (error) {

      console.error(
        "Pin error:",
        error
      );

    }
  };


  // =========================================
  // EDIT BUTTON
  // =========================================

  const handleEditButton = (
    event
  ) => {

    event.stopPropagation();

    handleOpenNote();

  };


  // =========================================
  // UI
  // =========================================

  return (

    <motion.div

      className="note-card"


      style={{
        backgroundColor:
          note.color,

        touchAction:
          "manipulation",

        WebkitTapHighlightColor:
          "transparent",

        WebkitUserSelect:
          "none",

        userSelect:
          "none",
      }}


      layout


      initial={{
        opacity: 0,
        y: 20,
        scale: 0.94,
      }}


      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}


      exit={{
        opacity: 0,
        y: -15,
        scale: 0.92,
      }}


      /*
        WINDOWS / DESKTOP
      */

      whileHover={{
        y: -6,
        scale: 1.015,
      }}


      /*
        ANDROID / TOUCH

        This gives the physical
        press animation.
      */

      whileTap={{
        scale: 0.96,
        y: -2,
      }}


      transition={{

        layout: {
          duration: 0.35,
          ease:
            "easeInOut",
        },

        opacity: {
          duration: 0.25,
        },

        y: {
          type: "spring",
          stiffness: 350,
          damping: 24,
        },

        scale: {
          type: "spring",
          stiffness: 400,
          damping: 25,
        },
      }}


      /*
        WINDOWS
      */

      onDoubleClick={
        handleDoubleClick
      }


      /*
        ANDROID
      */

      onPointerUp={
        handlePointerUp
      }

    >

      {/* ====================================
          PIN
      ==================================== */}

      <button

        className={`note-pin-btn ${
          note.isPinned
            ? "active"
            : ""
        }`}

        onClick={
          handlePin
        }

        aria-label={
          note.isPinned
            ? "Unpin note"
            : "Pin note"
        }

      >

        <FaThumbtack />

      </button>


      {/* ====================================
          TITLE
      ==================================== */}

      {note.title && (

        <h3>
          {note.title}
        </h3>

      )}


      {/* ====================================
          CONTENT
      ==================================== */}

      <p>
        {note.content}
      </p>


      {/* ====================================
          FOOTER
      ==================================== */}

      <div className="note-card-footer">

        <small>

          {new Date(
            note.updatedAt ||
            note.createdAt
          ).toLocaleDateString()}

        </small>


        <div className="note-card-actions">

          <button
            onClick={
              handleEditButton
            }

            aria-label="Edit note"
          >

            <FaEdit />

          </button>


          <button
            onClick={
              handleDelete
            }

            aria-label="Delete note"
          >

            <FaTrash />

          </button>

        </div>

      </div>

    </motion.div>
  );
}
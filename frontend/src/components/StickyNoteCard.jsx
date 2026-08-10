import {
  useMemo,
  useRef,
} from "react";

import {
  FaPlus,
  FaStickyNote,
} from "react-icons/fa";

import {
  motion,
} from "framer-motion";

import {
  useNavigate,
} from "react-router-dom";

import {
  useNotes,
} from "../context/NotesContext";

import "../styles/stickyNote.css";

export default function StickyNoteCard() {
  const navigate = useNavigate();

  const {
    notes,
    loading,
  } = useNotes();

  // ========================================
  // DOUBLE TAP STATE
  // ========================================

  const lastTapRef = useRef(0);

  const tapTimeoutRef = useRef(null);

  // ========================================
  // NOTES
  // ========================================

  const activeNotes = useMemo(() => {
    return notes.filter(
      (note) => !note.archived
    );
  }, [notes]);

  const totalNotes =
    activeNotes.length;

  // ========================================
  // LATEST NOTE
  // ========================================

  const latestNote = useMemo(() => {
    if (
      activeNotes.length === 0
    ) {
      return null;
    }

    return [...activeNotes].sort(
      (a, b) =>
        new Date(
          b.updatedAt ||
            b.createdAt ||
            0
        ) -
        new Date(
          a.updatedAt ||
            a.createdAt ||
            0
        )
    )[0];
  }, [activeNotes]);

  // ========================================
  // PREVIEW
  // ========================================

  const latestPreview = latestNote
    ? (
        latestNote.content ||
        latestNote.title ||
        "Untitled note"
      )
        .replace(/\s+/g, " ")
        .trim()
    : "No notes yet";

  const shortenedPreview =
    latestPreview.length > 38
      ? `${latestPreview.substring(
          0,
          38
        )}...`
      : latestPreview;

  // ========================================
  // OPEN NOTES
  // ========================================

  const openNotes = () => {
    navigate("/notes");
  };

  // ========================================
  // MOBILE DOUBLE TAP
  // ========================================

  const handleTouchEnd = (event) => {
    /*
      Don't handle touches coming
      from the + button.
    */

    if (
      event.target.closest(
        ".sticky-add"
      )
    ) {
      return;
    }

    const now = Date.now();

    const timeSinceLastTap =
      now - lastTapRef.current;

    if (
      timeSinceLastTap > 0 &&
      timeSinceLastTap < 350
    ) {
      // DOUBLE TAP

      clearTimeout(
        tapTimeoutRef.current
      );

      lastTapRef.current = 0;

      openNotes();

      return;
    }

    // FIRST TAP

    lastTapRef.current = now;

    clearTimeout(
      tapTimeoutRef.current
    );

    /*
      Reset after the double-tap
      detection window.
    */

    tapTimeoutRef.current =
      setTimeout(() => {
        lastTapRef.current = 0;
      }, 350);
  };

  // ========================================
  // DESKTOP DOUBLE CLICK
  // ========================================

  const handleDoubleClick = (
    event
  ) => {
    if (
      event.target.closest(
        ".sticky-add"
      )
    ) {
      return;
    }

    openNotes();
  };

  // ========================================
  // CREATE NOTE
  // ========================================

  const createNote = (event) => {
    event.stopPropagation();

    navigate(
      "/notes?new=true"
    );
  };

  // ========================================
  // FORMAT TIME
  // ========================================

  const formatUpdatedTime = () => {
    if (!latestNote) {
      return "";
    }

    const date = new Date(
      latestNote.updatedAt ||
        latestNote.createdAt
    );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      date.getTime();

    const minutes =
      Math.floor(
        difference /
          (1000 * 60)
      );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24) {
      return `${hours} ${
        hours === 1
          ? "hour"
          : "hours"
      } ago`;
    }

    const days =
      Math.floor(
        hours / 24
      );

    if (days < 7) {
      return `${days} ${
        days === 1
          ? "day"
          : "days"
      } ago`;
    }

    return date.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  return (
    <div className="sticky-wrapper">

      {/* ========================================
          HANGER
      ======================================== */}

      <div className="sticky-hanger">

        <div
          className="
            sticky-string
            left-string
          "
        />

        <div className="sticky-pin">
          <span />
        </div>

        <div
          className="
            sticky-string
            right-string
          "
        />

      </div>


      {/* ========================================
          CARD
      ======================================== */}

      <motion.div
        className="sticky-card"

        /*
          Desktop
        */
        onDoubleClick={
          handleDoubleClick
        }

        /*
          Mobile
        */
        onTouchEnd={
          handleTouchEnd
        }

        /*
          Important for mobile.
          Prevents the browser from
          interpreting the interaction
          as scrolling/zooming.
        */
        style={{
          touchAction: "manipulation",
        }}

        initial={{
          rotate: -1,
        }}

        animate={{
          rotate: [
            -1,
            1.4,
            -1.2,
            0.8,
            -0.5,
            0,
          ],
        }}

        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}

        whileTap={{
          scale: 0.98,
        }}

        whileHover={{
          y: -2,
        }}
      >

        {/* ========================================
            PLUS
        ======================================== */}

        <motion.button
          className="sticky-add"

          onClick={
            createNote
          }

          whileHover={{
            scale: 1.1,
            rotate: 5,
          }}

          whileTap={{
            scale: 0.9,
          }}

          aria-label="Create new note"
        >
          <FaPlus />
        </motion.button>


        {/* ========================================
            ICON
        ======================================== */}

        <div className="sticky-icon">
          <FaStickyNote />
        </div>


        {/* ========================================
            TITLE
        ======================================== */}

        <h3>
          Sticky Notes
        </h3>


        {/* ========================================
            COUNT
        ======================================== */}

        <div className="sticky-count">

          {loading ? (
            <span className="sticky-loading">
              Loading...
            </span>
          ) : (
            <>
              {totalNotes}{" "}
              {totalNotes === 1
                ? "Note"
                : "Notes"}
            </>
          )}

        </div>


        {/* ========================================
            LATEST NOTE
        ======================================== */}

        <div className="sticky-preview">

          {latestNote ? (
            <>
              <strong>
                Latest
              </strong>

              <span>
                {shortenedPreview}
              </span>

              <small>
                {formatUpdatedTime()}
              </small>
            </>
          ) : (
            <span>
              Start writing your
              first note...
            </span>
          )}

        </div>


        {/* ========================================
            HINT
        ======================================== */}

        <div className="sticky-hint">
          Double-tap to open
        </div>

      </motion.div>
    </div>
  );
}
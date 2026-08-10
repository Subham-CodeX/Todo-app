import { motion } from "framer-motion";
import { FaPlus, FaStickyNote } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

import "../styles/stickyNote.css";

export default function StickyNoteCard() {

  const navigate = useNavigate();

  const lastClick = useRef(0);

  const handleCardClick = () => {

    const now = Date.now();

    if (now - lastClick.current < 300) {

      navigate("/notes");

    }

    lastClick.current = now;
  };

  const handleAdd = (e) => {

    e.stopPropagation();

    alert("Create Note");

  };

  return (

    <div className="sticky-wrapper">

      <div className="rope"></div>

      <motion.div

        className="sticky-card"

        onClick={handleCardClick}

        whileTap={{
          rotate: [0, -8, 8, -4, 4, 0],
          transition: {
            duration: .7
          }
        }}

      >

        <button

          className="sticky-add"

          onClick={handleAdd}

        >

          <FaPlus/>

        </button>

        <div className="sticky-icon">

          <FaStickyNote/>

        </div>

        <h3>Sticky Notes</h3>

        <p>0 Notes</p>

        <span>

          Tap twice to open

        </span>

      </motion.div>

    </div>

  );

}
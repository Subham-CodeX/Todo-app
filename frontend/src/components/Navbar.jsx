import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaChartPie,
  FaFileAlt,
  FaUser,
  FaPlus,
  FaStickyNote,
  FaComments,
} from "react-icons/fa";

function Navbar({ onAddTask }) {

  return (
    <nav className="bottom-nav">

      {/* =====================
          DESKTOP BRAND
      ===================== */}

      <div className="desktop-nav-brand">

        <div className="brand-icon">
          ✓
        </div>

        <div>
          <strong>
            TaskFlow
          </strong>

          <span>
            Stay organized
          </span>
        </div>

      </div>


      {/* =====================
          HOME
      ===================== */}

      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive
            ? "nav-item active"
            : "nav-item"
        }
      >
        <FaHome />

        <span className="nav-label">
          Home
        </span>
      </NavLink>


      {/* =====================
          ANALYTICS
          DESKTOP ONLY
      ===================== */}

      <NavLink
        to="/analytics"
        className={({ isActive }) =>
          isActive
            ? "nav-item desktop-only-nav active"
            : "nav-item desktop-only-nav"
        }
      >
        <FaChartPie />

        <span className="nav-label">
          Analytics
        </span>
      </NavLink>


      {/* =====================
          TEMPLATES
          DESKTOP ONLY
      ===================== */}

      <NavLink
        to="/templates"
        className={({ isActive }) =>
          isActive
            ? "nav-item desktop-only-nav active"
            : "nav-item desktop-only-nav"
        }
      >
        <FaFileAlt />

        <span className="nav-label">
          Templates
        </span>
      </NavLink>


      {/* =====================
          CHAT
          MOBILE ONLY
      ===================== */}

      <NavLink
        to="/chat"
        className={({ isActive }) =>
          isActive
            ? "nav-item mobile-only-nav active"
            : "nav-item mobile-only-nav"
        }
      >
        <FaComments />

        <span className="nav-label">
          Chat
        </span>
      </NavLink>


      {/* =====================
          NOTES
      ===================== */}

      <NavLink
        to="/notes"
        className={({ isActive }) =>
          isActive
            ? "nav-item active"
            : "nav-item"
        }
      >
        <FaStickyNote />

        <span className="nav-label">
          Notes
        </span>
      </NavLink>


      {/* =====================
          PROFILE
      ===================== */}

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          isActive
            ? "nav-item active"
            : "nav-item"
        }
      >
        <FaUser />

        <span className="nav-label">
          Profile
        </span>
      </NavLink>


      {/* =====================
          ADD TASK
      ===================== */}

      <button
        className="floating-add"
        onClick={onAddTask}
        aria-label="Add Task"
      >

        <FaPlus />

        <span className="desktop-add-label">
          Add Task
        </span>

      </button>

    </nav>
  );
}

export default Navbar;
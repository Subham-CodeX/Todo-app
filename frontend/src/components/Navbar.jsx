import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaChartPie,
  FaFileAlt,
  FaUser,
  FaPlus,
  FaStickyNote,
} from "react-icons/fa";

function Navbar({ onAddTask }) {

  return (
    <nav className="bottom-nav">

      {/* BRAND */}

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


      {/* HOME */}

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


      {/* ANALYTICS */}

      <NavLink
        to="/analytics"
        className={({ isActive }) =>
          isActive
            ? "nav-item active"
            : "nav-item"
        }
      >
        <FaChartPie />

        <span className="nav-label">
          Analytics
        </span>
      </NavLink>


      {/* TEMPLATES */}

      <NavLink
        to="/templates"
        className={({ isActive }) =>
          isActive
            ? "nav-item active"
            : "nav-item"
        }
      >
        <FaFileAlt />

        <span className="nav-label">
          Templates
        </span>
      </NavLink>


      {/* NOTES */}

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


      {/* PROFILE */}

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


      {/* ADD TASK */}

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
import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaChartPie,
  FaFileAlt,
  FaUser,
  FaPlus,
} from "react-icons/fa";

function Navbar({ onAddTask }) {
  return (
    <nav className="bottom-nav">

      {/* Home */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive
            ? "nav-item active"
            : "nav-item"
        }
      >
        <FaHome />
      </NavLink>

      {/* Analytics */}
      <NavLink
        to="/analytics"
        className={({ isActive }) =>
          isActive
            ? "nav-item active"
            : "nav-item"
        }
      >
        <FaChartPie />
      </NavLink>

      {/* Add Task Button */}
      <button
        className="floating-add"
        onClick={onAddTask}
        aria-label="Add Task"
      >
        <FaPlus />
      </button>

      {/* Templates */}
      <NavLink
        to="/templates"
        className={({ isActive }) =>
          isActive
            ? "nav-item active"
            : "nav-item"
        }
      >
        <FaFileAlt />
      </NavLink>

      {/* Profile */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          isActive
            ? "nav-item active"
            : "nav-item"
        }
      >
        <FaUser />
      </NavLink>

    </nav>
  );
}

export default Navbar;
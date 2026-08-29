import {
  FaBell,
  FaBars,
  FaCalendarAlt,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

function DashboardHeader() {

  const { user } = useAuth();

  const today = new Date();

  const formattedDate =
    today.toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  const profileImage =
    user?.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User"
    )}&background=7B2FF7&color=fff`;

  return (

    <header className="dashboard-header">

      <div className="top-row">

        <button className="icon-btn">
          <FaBars />
        </button>

        <div className="right-icons">

          <button className="icon-btn">
            <FaBell />
          </button>

          <img
            src={profileImage}
            alt="Profile"
            className="profile-image"
          />

        </div>

      </div>

      <div className="header-content">

        <div>

          <p className="hello-text">

            Hello, {user?.name || "User"} 👋

          </p>

          <h1>
            Statistics
          </h1>

        </div>

        <div className="date-box">

          <FaCalendarAlt />

          <span>
            {formattedDate}
          </span>

        </div>

      </div>

    </header>

  );
}

export default DashboardHeader;
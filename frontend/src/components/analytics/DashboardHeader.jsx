import {
  FaBell,
  FaBars,
  FaCalendarAlt,
} from "react-icons/fa";

function DashboardHeader() {

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
            src="https://i.pravatar.cc/150"
            alt="Profile"
            className="profile-image"
          />

        </div>

      </div>

      <div className="header-content">

        <div>

          <p className="hello-text">

            Hello, Subham 👋

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
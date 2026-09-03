import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaEdit,
  FaLock,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartPie,
  FaFileAlt,
} from "react-icons/fa";

import {
  useNavigate,
} from "react-router-dom";

import {
  useState,
} from "react";

import {
  useAuth,
} from "../context/AuthContext";

import "../styles/profile.css";

export default function Profile() {

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false);

  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = () => {
    logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };

  if (!user) {
    return (
      <div className="profile-loading">
        Loading profile...
      </div>
    );
  }

  const address =
    user.address || {};

  const location = [
    address.city,
    address.state,
  ]
    .filter(Boolean)
    .join(", ");

  // =====================================
  // AVATAR
  // =====================================

  const avatar =
    user.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name || "User"
    )}&background=7B2FF7&color=fff&size=200`;

  return (
    <div className="profile-page">

      <div className="profile-card">

        {/* =========================
            HEADER
        ========================= */}

        <div className="profile-title">

          {/* BACK TO HOME */}
          <button
            type="button"
            className="profile-back-button"
            onClick={() =>
              navigate("/")
            }
            aria-label="Back to home"
          >
            ←
          </button>

          <button
            type="button"
            className="profile-menu-button"
            onClick={() =>
              setIsMenuOpen(true)
            }
            aria-label="Open profile menu"
          >
            <FaBars />
          </button>

          <h1>Profile</h1>

          <p>
            Your TaskFlow account
          </p>

        </div>

        {/* =========================
            AVATAR
        ========================= */}

        <div className="profile-avatar-wrapper">

          <img
            src={avatar}
            alt={user.name}
            className="profile-avatar"
          />

        </div>

        {/* =========================
            NAME
        ========================= */}

        <h2 className="profile-name">
          {user.name}
        </h2>

        <p className="profile-role">
          {user.role || "Other"}
        </p>

        {/* =========================
            INFO
        ========================= */}

        <div className="profile-info-box">

          <div className="profile-info-row">
            <FaEnvelope />

            <span>
              {user.email}
            </span>
          </div>

          <div className="profile-info-row">
            <FaPhone />

            <span>
              {user.phone ||
                "Phone not added"}
            </span>
          </div>

          <div className="profile-info-row">
            <FaMapMarkerAlt />

            <span>
              {location ||
                "Location not added"}
            </span>
          </div>

          <div className="profile-info-row">
            <FaBirthdayCake />

            <span>
              {user.dateOfBirth
                ? new Date(
                    user.dateOfBirth
                  ).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )
                : "Date of birth not added"}
            </span>
          </div>

        </div>

        {/* =========================
            BIO
        ========================= */}

        {user.bio && (
          <div className="profile-bio">
            <h3>About</h3>

            <p>
              {user.bio}
            </p>
          </div>
        )}

        {/* =========================
            HOBBIES
        ========================= */}

        {user.hobbies?.length > 0 && (
          <div className="profile-hobbies">

            <h3>Hobbies</h3>

            <div className="hobby-list">

              {user.hobbies.map(
                (hobby, index) => (
                  <span
                    key={index}
                    className="hobby-tag"
                  >
                    {hobby}
                  </span>
                )
              )}

            </div>

          </div>
        )}

        {/* =========================
            ACTIONS
        ========================= */}

        <div className="profile-actions">

          <button
            className="profile-action primary"
            onClick={() =>
              navigate(
                "/profile/edit"
              )
            }
          >
            <FaEdit />

            Edit Profile
          </button>

          <button
            className="profile-action"
            onClick={() =>
              navigate(
                "/profile/change-password"
              )
            }
          >
            <FaLock />

            Change Password
          </button>

          <button
            className="profile-action logout"
            onClick={
              handleLogout
            }
          >
            <FaSignOutAlt />

            Logout
          </button>

        </div>

      </div>

      {/* =========================
          MOBILE QUICK MENU
      ========================= */}

      {isMenuOpen && (

        <div
          className="profile-menu-overlay"
          onClick={() =>
            setIsMenuOpen(false)
          }
        >

          <div
            className="profile-mobile-menu"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="profile-menu-header">

              <div>

                <h3>
                  Quick Menu
                </h3>

                <p>
                  Explore TaskFlow
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setIsMenuOpen(false)
                }
                aria-label="Close menu"
              >
                <FaTimes />
              </button>

            </div>


            {/* ANALYTICS */}

            <button
              className="profile-menu-item"
              onClick={() => {

                setIsMenuOpen(false);

                navigate(
                  "/analytics"
                );

              }}
            >

              <div className="profile-menu-icon">

                <FaChartPie />

              </div>

              <div>

                <strong>
                  Analytics
                </strong>

                <span>
                  Track your productivity
                </span>

              </div>

            </button>


            {/* TEMPLATES */}

            <button
              className="profile-menu-item"
              onClick={() => {

                setIsMenuOpen(false);

                navigate(
                  "/templates"
                );

              }}
            >

              <div className="profile-menu-icon">

                <FaFileAlt />

              </div>

              <div>

                <strong>
                  Templates
                </strong>

                <span>
                  Manage your task templates
                </span>

              </div>

            </button>

          </div>

        </div>

      )}

    </div>
  );
}
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

export default function ProfileCompletionGuard() {

  const {
    user,
    loading,
  } = useAuth();

  const location =
    useLocation();

  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#080b12",
          color: "white",
        }}
      >
        Loading TaskFlow...
      </div>
    );
  }

  // ==================================
  // NOT LOGGED IN
  // ==================================

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ==================================
  // PROFILE NOT COMPLETE
  // ==================================

  if (
    !user.profileComplete &&
    location.pathname !==
      "/profile/complete"
  ) {

    return (
      <Navigate
        to="/profile/complete"
        replace
      />
    );
  }

  // ==================================
  // PROFILE COMPLETE
  // ==================================

  if (
    user.profileComplete &&
    location.pathname ===
      "/profile/complete"
  ) {

    return (
      <Navigate
        to="/profile"
        replace
      />
    );
  }

  return <Outlet />;
}
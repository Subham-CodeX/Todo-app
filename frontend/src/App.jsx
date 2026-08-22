import {
  useEffect,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./components/Layout";

import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Templates from "./pages/Templates";
import Notes from "./pages/Notes";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";

import Profile from "./pages/Profile";
import CompleteProfile from "./pages/CompleteProfile";
import ChangePassword from "./pages/ChangePassword";

import ProtectedRoute from "./components/ProtectedRoute";

import {
  AuthProvider,
} from "./context/AuthContext";

import {
  requestNotificationPermission,
} from "./services/notificationService";

function App() {

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <AuthProvider>

      <BrowserRouter>

        <Routes>

          {/* =====================
              PUBLIC
          ===================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />

          {/* =====================
              PROTECTED
          ===================== */}

          <Route
            element={
              <ProtectedRoute />
            }
          >

            {/* Profile */}
            <Route
              path="/profile"
              element={
                <Profile />
              }
            />

            <Route
              path="/profile/complete"
              element={
                <CompleteProfile />
              }
            />

            <Route
              path="/profile/edit"
              element={
                <CompleteProfile
                  editMode
                />
              }
            />

            <Route
              path="/profile/change-password"
              element={
                <ChangePassword />
              }
            />

            {/* Main Application */}

            <Route
              element={<Layout />}
            >

              <Route
                path="/"
                element={<Tasks />}
              />

              <Route
                path="/analytics"
                element={
                  <Analytics />
                }
              />

              <Route
                path="/templates"
                element={
                  <Templates />
                }
              />

              <Route
                path="/notes"
                element={
                  <Notes />
                }
              />

            </Route>

          </Route>

          {/* =====================
              FALLBACK
          ===================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </BrowserRouter>

    </AuthProvider>
  );
}

export default App;
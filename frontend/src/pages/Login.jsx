import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
} from "react-icons/fa";

import {
  useAuth,
} from "../context/AuthContext";

import AuthLayout from "../components/AuthLayout";

export default function Login() {

  const navigate =
    useNavigate();

  const {
    login,
  } = useAuth();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  // =====================================
  // LOGIN
  // =====================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");

      if (!email.trim()) {

        setError(
          "Please enter your email."
        );

        return;
      }

      if (!password) {

        setError(
          "Please enter your password."
        );

        return;
      }

      try {

        setLoading(true);

        const result =
          await login(
            email.trim(),
            password
          );

        /*
         * IMPORTANT:
         *
         * New users who haven't completed
         * their profile must go to
         * /profile/complete.
         */

        if (
          result?.user?.profileComplete ===
          false
        ) {

          navigate(
            "/profile/complete",
            {
              replace: true,
            }
          );

        } else {

          navigate(
            "/",
            {
              replace: true,
            }
          );

        }

      } catch (error) {

        console.error(
          "Login Error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Login failed. Please check your email and password."
        );

      } finally {

        setLoading(false);

      }

    };


  return (

    <AuthLayout mode="login">

      {/* =================================
          HEADING
      ================================= */}

      <div className="auth-heading">

        <p className="auth-heading-label">
          WELCOME BACK
        </p>

        <h2>
          Welcome back 👋
        </h2>

        <p>
          Sign in to continue to
          your TaskFlow workspace.
        </p>

      </div>


      {/* =================================
          ERROR
      ================================= */}

      {error && (

        <div className="auth-error">

          <span>
            !
          </span>

          {error}

        </div>

      )}


      {/* =================================
          FORM
      ================================= */}

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

        {/* EMAIL */}

        <div className="auth-field">

          <label>
            Email
          </label>

          <div className="auth-input-wrapper">

            <FaEnvelope />

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter your email"
              autoComplete="email"
            />

          </div>

        </div>


        {/* PASSWORD */}

        <div className="auth-field">

          <div className="auth-label-row">

            <label>
              Password
            </label>

            <button
              type="button"
              className="forgot-password"
              onClick={() =>
                navigate("/forgot-password")
              }
            >
              Forgot Password?
            </button>

          </div>


          <div className="auth-input-wrapper">

            <FaLock />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(
                  (prev) => !prev
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

        </div>


        {/* LOGIN BUTTON */}

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >

          <span>
            {loading
              ? "Logging in..."
              : "Login"}
          </span>

          {!loading && (
            <FaArrowRight />
          )}

        </button>

      </form>

    </AuthLayout>

  );
}
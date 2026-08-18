import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FaUser,
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

export default function Register() {

  const navigate =
    useNavigate();

  const {
    register,
  } = useAuth();


  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
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
  // REGISTER
  // =====================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");


      if (!name.trim()) {

        setError(
          "Please enter your name."
        );

        return;
      }


      if (!email.trim()) {

        setError(
          "Please enter your email."
        );

        return;
      }


      if (password.length < 6) {

        setError(
          "Password must be at least 6 characters."
        );

        return;
      }


      if (
        password !==
        confirmPassword
      ) {

        setError(
          "Passwords do not match."
        );

        return;
      }


      try {

        setLoading(true);

        await register(
          name.trim(),
          email.trim(),
          password
        );


        /*
         * New users must complete
         * their TaskFlow profile.
         */

        navigate(
          "/profile/complete",
          {
            replace: true,
          }
        );

      } catch (error) {

        console.error(
          "Register Error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Registration failed. Please try again."
        );

      } finally {

        setLoading(false);

      }

    };


  return (

    <AuthLayout mode="register">

      {/* =================================
          HEADING
      ================================= */}

      <div className="auth-heading">

        <p className="auth-heading-label">
          GET STARTED
        </p>

        <h2>
          Create your account 🚀
        </h2>

        <p>
          Start organizing your life
          with TaskFlow.
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
        className="auth-form register-form"
        onSubmit={handleSubmit}
      >

        {/* NAME */}

        <div className="auth-field">

          <label>
            Name
          </label>

          <div className="auth-input-wrapper">

            <FaUser />

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Your name"
              autoComplete="name"
            />

          </div>

        </div>


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
              placeholder="your@email.com"
              autoComplete="email"
            />

          </div>

        </div>


        {/* PASSWORD */}

        <div className="auth-field">

          <label>
            Password
          </label>

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
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(
                  (prev) => !prev
                )
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


        {/* CONFIRM PASSWORD */}

        <div className="auth-field">

          <label>
            Confirm Password
          </label>

          <div className="auth-input-wrapper">

            <FaLock />

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={
                confirmPassword
              }
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Confirm your password"
              autoComplete="new-password"
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowConfirmPassword(
                  (prev) => !prev
                )
              }
            >
              {showConfirmPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

        </div>


        {/* REGISTER */}

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >

          <span>
            {loading
              ? "Creating account..."
              : "Create Account"}
          </span>

          {!loading && (
            <FaArrowRight />
          )}

        </button>

      </form>

    </AuthLayout>

  );
}
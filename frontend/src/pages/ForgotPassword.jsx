import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";

import API from "../services/api";

import AuthLayout from "../components/AuthLayout";

export default function ForgotPassword() {

  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

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

      try {

        setLoading(true);

        const response =
          await API.post(
            "/auth/forgot-password",
            {
              email:
                email.trim(),
            }
          );

        navigate(
          "/reset-password",
          {
            state: {
              email:
                response.data.email ||
                email.trim(),
            },
          }
        );

      } catch (error) {

        console.error(
          "Forgot Password Error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Failed to send password reset OTP."
        );

      } finally {

        setLoading(false);

      }
    };

  return (

    <AuthLayout mode="login">

      <div className="auth-heading">

        <p className="auth-heading-label">
          PASSWORD RECOVERY
        </p>

        <h2>
          Forgot your password? 🔐
        </h2>

        <p>
          Enter your email and we'll send
          you a password reset OTP.
        </p>

      </div>

      {error && (
        <div className="auth-error">

          <span>!</span>

          {error}

        </div>
      )}

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

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

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >

          <span>
            {loading
              ? "Sending OTP..."
              : "Send Reset OTP"}
          </span>

          {!loading && (
            <FaArrowRight />
          )}

        </button>

      </form>

      <button
        type="button"
        className="forgot-password"
        onClick={() =>
          navigate("/login")
        }
      >
        Back to Login
      </button>

    </AuthLayout>

  );
}
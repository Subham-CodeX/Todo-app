import {
  useEffect,
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

  // ==========================================
  // FORM
  // ==========================================

  const [
    email,
    setEmail,
  ] = useState("");

  // ==========================================
  // UI
  // ==========================================

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  // ==========================================
  // COOLDOWN
  // ==========================================

  const [
    resendCooldown,
    setResendCooldown,
  ] = useState(0);

  // ==========================================
  // COUNTDOWN TIMER
  // ==========================================

  useEffect(() => {

    if (resendCooldown <= 0) {
      return;
    }

    const timer =
      setInterval(() => {

        setResendCooldown(
          (prev) => {

            if (prev <= 1) {

              clearInterval(timer);

              return 0;
            }

            return prev - 1;
          }
        );

      }, 1000);

    return () => {
      clearInterval(timer);
    };

  }, [resendCooldown]);

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");
      setSuccess("");

      // ======================================
      // PREVENT DUPLICATE REQUEST
      // ======================================

      if (
        loading ||
        resendCooldown > 0
      ) {
        return;
      }

      // ======================================
      // NORMALIZE EMAIL
      // ======================================

      const normalizedEmail =
        email.trim().toLowerCase();

      // ======================================
      // VALIDATE EMAIL
      // ======================================

      if (!normalizedEmail) {

        setError(
          "Please enter your email."
        );

        return;
      }

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          normalizedEmail
        )
      ) {

        setError(
          "Please enter a valid email address."
        );

        return;
      }

      try {

        setLoading(true);

        // ====================================
        // REQUEST PASSWORD RESET OTP
        // ====================================

        const response =
          await API.post(
            "/auth/forgot-password",
            {
              email:
                normalizedEmail,
            }
          );

        // ====================================
        // EMAIL RETURNED FROM BACKEND
        // ====================================

        const resetEmail =
          response.data.email ||
          normalizedEmail;

        // ====================================
        // START COOLDOWN
        // ====================================

        const retryAfter =
          Number(
            response.data.retryAfter
          ) || 60;

        setResendCooldown(
          retryAfter
        );

        // ====================================
        // SUCCESS MESSAGE
        // ====================================

        setSuccess(
          "A password reset OTP has been sent to your email."
        );

        // ====================================
        // MOVE TO RESET PASSWORD PAGE
        // ====================================

        navigate(
          "/reset-password",
          {
            state: {
              email: resetEmail,
            },
          }
        );

      } catch (error) {

        console.error(
          "Forgot Password Error:",
          error
        );

        // ====================================
        // BACKEND RATE LIMIT
        // ====================================

        const retryAfter =
          Number(
            error.response?.data?.retryAfter
          );

        if (
          retryAfter &&
          retryAfter > 0
        ) {

          setResendCooldown(
            retryAfter
          );
        }

        // ====================================
        // ERROR MESSAGE
        // ====================================

        setError(
          error.response?.data?.message ||
          "Failed to send password reset OTP."
        );

      } finally {

        setLoading(false);

      }
    };

  // ==========================================
  // UI
  // ==========================================

  return (

    <AuthLayout mode="login">

      {/* ======================================
          HEADING
      ====================================== */}

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

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && (

        <div className="auth-error">

          <span>
            !
          </span>

          {error}

        </div>
      )}

      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {success && (

        <div className="auth-success">

          {success}

        </div>
      )}

      {/* ======================================
          FORM
      ====================================== */}

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

        {/* ====================================
            EMAIL
        ==================================== */}

        <div className="auth-field">

          <label>
            Email
          </label>

          <div className="auth-input-wrapper">

            <FaEnvelope />

            <input
              type="email"
              value={email}
              onChange={(e) => {

                setEmail(
                  e.target.value
                );

                // Clear old messages
                // when user starts typing
                if (error) {
                  setError("");
                }

                if (success) {
                  setSuccess("");
                }

              }}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={
                loading
              }
            />

          </div>

        </div>

        {/* ====================================
            SEND OTP BUTTON
        ==================================== */}

        <button
          type="submit"
          className="auth-submit"
          disabled={
            loading ||
            resendCooldown > 0
          }
        >

          <span>

            {loading
              ? "Sending OTP..."
              : resendCooldown > 0
                ? `Try again in ${resendCooldown}s`
                : "Send Reset OTP"}

          </span>

          {!loading &&
            resendCooldown <= 0 && (
              <FaArrowRight />
            )}

        </button>

      </form>

      {/* ======================================
          COOLDOWN MESSAGE
      ====================================== */}

      {resendCooldown > 0 && (

        <p
          style={{
            textAlign: "center",
            marginTop: "14px",
            fontSize: "13px",
            opacity: 0.75,
          }}
        >
          You can request another OTP
          in{" "}
          <strong>
            {resendCooldown}s
          </strong>
        </p>
      )}

      {/* ======================================
          BACK TO LOGIN
      ====================================== */}

      <button
        type="button"
        className="forgot-password"
        onClick={() =>
          navigate("/login")
        }
        disabled={loading}
      >
        Back to Login
      </button>

    </AuthLayout>
  );
}